import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validatePlan,
  technicalChecks,
  run,
  probe,
  inside,
  reportFor,
  finalizeVideo,
  normalizeClip,
} from '../scripts/media.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = () =>
  JSON.parse(fs.readFileSync(path.join(root, 'examples/app-store.json')));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'app-preview-tests-'));
fs.writeFileSync(path.join(dir, 'sample.mp4'), 'fixture');
const fake = () => ({ video: { width: 886, height: 1920 }, duration: 30 });
process.on('exit', () => fs.rmSync(dir, { recursive: true, force: true }));

test('plans calculate exact target duration and reject unsafe trims', () => {
  const p = fixture();
  assert.equal(validatePlan(p, dir, fake).frames, 750);
  p.scenes[0].start = 29;
  assert.throws(() => validatePlan(p, dir, fake), /trim exceeds/);
});
test('missing media and escaped paths are actionable errors', () => {
  const p = fixture();
  p.scenes[0].file = 'absent.mp4';
  assert.throws(() => validatePlan(p, dir, fake), /Missing media/);
  assert.throws(() => inside(dir, '../escape.mp4'), /escapes/);
  assert.throws(() => inside(dir, '/tmp/file.mp4'), /relative/);
  const other = fs.mkdtempSync(path.join(os.tmpdir(), 'outside-'));
  fs.writeFileSync(path.join(other, 'x'), 'x');
  fs.symlinkSync(path.join(other, 'x'), path.join(dir, 'link'));
  assert.throws(() => inside(dir, 'link'), /symlink escapes/);
  fs.rmSync(other, { recursive: true });
});
test('store duration, finite timestamps and readable captions are enforced', () => {
  for (const duration of [2, 10]) {
    const p = fixture();
    p.scenes = [{ ...p.scenes[0], duration }];
    assert.throws(() => validatePlan(p, dir, fake), /15–30/);
  }
  const p = fixture();
  p.scenes[0].duration = NaN;
  assert.throws(() => validatePlan(p, dir, fake), /at least/);
  const q = fixture();
  q.scenes[0].caption = 'x'.repeat(91);
  assert.throws(() => validatePlan(q, dir, fake), /90 characters/);
});
test('branding and footage can change without template edits', () => {
  const p = fixture();
  p.appName = 'Another App';
  p.accent = '#ff9900';
  p.headline = 'Another story';
  assert.equal(validatePlan(p, dir, fake).width, 886);
  p.mode = 'launch';
  assert.equal(validatePlan(p, dir, fake).width, 1080);
});
test('fictional source cannot silently become real capture', () => {
  const p = fixture();
  p.fictional = false;
  assert.throws(() => validatePlan(p, dir, fake), /labelled fictional/);
});
test('technical checks detect wrong dimensions and missing audio', () => {
  const p = fixture();
  const checks = technicalChecks(
    { duration: 25, size: 100, video: { width: 1080, height: 1920 } },
    p,
  );
  assert.equal(checks.find((x) => x.name === 'dimensions').pass, false);
  assert.equal(checks.find((x) => x.name === 'audio-codec').pass, false);
});
test('silent VFR input normalizes to correctly timed CFR without changing original', () => {
  const source = path.join(dir, 'vfr.mp4'),
    normalized = path.join(dir, 'cfr.mp4');
  run('ffmpeg', [
    '-v',
    'error',
    '-f',
    'lavfi',
    '-i',
    'testsrc2=size=180x390:rate=30:duration=4',
    '-vf',
    "select='if(lt(t,2),not(mod(n,2)),1)'",
    '-fps_mode',
    'vfr',
    '-c:v',
    'libx264',
    '-an',
    source,
  ]);
  const before = fs.readFileSync(source);
  const vfr = probe(source);
  assert.notEqual(vfr.video.avg_frame_rate, vfr.video.r_frame_rate);
  assert.equal(vfr.audio, undefined);
  normalizeClip(source, normalized, { start: 0.5, duration: 3 });
  const m = probe(normalized);
  assert.equal(m.video.avg_frame_rate, '30/1');
  assert.ok(Math.abs(m.duration - 3) < 0.05);
  assert.deepEqual(fs.readFileSync(source), before);
  const report = reportFor(normalized, fixture());
  assert.equal(report.manualReview.status, 'pending');
  assert.match(report.appleAcceptance, /unverified/);
  assert.match(report.provenance.deviceCaptureRequirement, /unmet/);
});
test('sparse simulator frames normalize across a trim boundary and preserve aspect', () => {
  const source = path.join(dir, 'sparse.mp4'),
    output = path.join(dir, 'sparse-normalized.mp4');
  run('ffmpeg', [
    '-v',
    'error',
    '-f',
    'lavfi',
    '-i',
    'testsrc2=size=180x390:rate=30:duration=17',
    '-vf',
    "select='eq(n,0)+eq(n,240)+eq(n,480)',setsar=2/1",
    '-fps_mode',
    'vfr',
    '-c:v',
    'libx264',
    '-an',
    source,
  ]);
  const m = normalizeClip(source, output, { start: 2, duration: 9 });
  assert.equal(m.video.nb_frames, '270');
  assert.equal(m.video.width, 360);
  assert.equal(m.video.height, 390);
  assert.equal(m.video.sample_aspect_ratio, '1:1');
  assert.equal(m.duration, 9);
});
test('full-range render is converted to limited-range yuv420p with stereo AAC', () => {
  const input = path.join(dir, 'full-range.mp4'),
    output = path.join(dir, 'limited-range.mp4');
  run('ffmpeg', [
    '-v',
    'error',
    '-f',
    'lavfi',
    '-i',
    'testsrc2=size=180x390:rate=30:duration=2',
    '-vf',
    'scale=out_range=pc',
    '-color_range',
    'pc',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-an',
    input,
  ]);
  assert.equal(probe(input).video.pix_fmt, 'yuvj420p');
  finalizeVideo(input, output, 2);
  const m = probe(output);
  assert.equal(m.video.pix_fmt, 'yuv420p');
  assert.notEqual(m.video.color_range, 'pc');
  assert.equal(m.audio.codec_name, 'aac');
  assert.equal(m.audio.channels, 2);
  assert.equal(m.audio.sample_rate, '48000');
  assert.throws(
    () => finalizeVideo(input, output, 2),
    /already exists|not overwriting/i,
  );
});

test('non-square final pixels fail export validation', () => {
  const checks = technicalChecks(
    {
      duration: 25,
      size: 100,
      video: { width: 886, height: 1920, sample_aspect_ratio: '2:1' },
    },
    fixture(),
  );
  assert.equal(checks.find((x) => x.name === 'square-pixels').pass, false);
});
