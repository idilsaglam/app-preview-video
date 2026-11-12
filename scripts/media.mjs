import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function run(bin, args, options = {}) {
  const p = spawnSync(bin, args, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });
  if (p.error) throw new Error(`${bin}: ${p.error.message}`);
  if (p.status !== 0)
    throw new Error(
      `${bin} failed (${p.status}): ${(p.stderr || p.stdout || '').slice(-5000)}`,
    );
  return p.stdout;
}
export function probe(file) {
  if (!fs.existsSync(file))
    throw new Error(
      `Missing media: ${file}. Supply the recording before rendering.`,
    );
  const p = JSON.parse(
    run('ffprobe', [
      '-v',
      'error',
      '-show_streams',
      '-show_format',
      '-of',
      'json',
      file,
    ]),
  );
  const video = p.streams.find((s) => s.codec_type === 'video');
  const audio = p.streams.find((s) => s.codec_type === 'audio');
  return {
    duration: Number(p.format.duration),
    size: Number(p.format.size),
    video,
    audio,
    format: p.format.format_name,
  };
}
export function rate(value) {
  if (!value) return 0;
  const [a, b] = value.split('/').map(Number);
  return a / (b || 1);
}
export function finalizeVideo(intermediate, final, duration) {
  if (fs.existsSync(final))
    throw new Error(`Output already exists: ${final}. Refusing to overwrite.`);
  const hasAudio = !!probe(intermediate).audio;
  const args = ['-v', 'error', '-n', '-i', intermediate];
  if (!hasAudio) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
  args.push(
    '-map',
    '0:v:0',
    '-map',
    hasAudio ? '0:a:0' : '1:a:0',
    '-t',
    String(duration),
    '-r',
    '30',
    '-vf',
    'scale=in_range=auto:out_range=tv,format=yuv420p',
    '-color_range',
    'tv',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-profile:v',
    'high',
    '-level:v',
    '4.0',
    '-pix_fmt',
    'yuv420p',
    '-b:v',
    '11M',
    '-maxrate',
    '12M',
    '-bufsize',
    '24M',
    '-c:a',
    'aac',
    '-b:a',
    '256k',
    '-ar',
    '48000',
    '-ac',
    '2',
    '-movflags',
    '+faststart',
    final,
  );
  run('ffmpeg', args);
}
export function normalizeClip(
  source,
  output,
  { start, duration, sourceAudio = false },
) {
  if (fs.existsSync(output))
    throw new Error(`Output already exists: ${output}. Refusing to overwrite.`);
  // Decode before seeking: sparse simulator frames can straddle a trim boundary.
  const args = [
    '-v',
    'error',
    '-n',
    '-i',
    source,
    '-ss',
    String(start),
    '-t',
    String(duration),
    '-map',
    '0:v:0',
    '-vf',
    'fps=30,scale=trunc(iw*sar/2)*2:trunc(ih/2)*2,setsar=1',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '18',
  ];
  if (sourceAudio && probe(source).audio)
    args.push(
      '-map',
      '0:a:0',
      '-af',
      'aresample=48000:async=1:first_pts=0',
      '-ac',
      '2',
      '-c:a',
      'aac',
      '-b:a',
      '256k',
    );
  else args.push('-an');
  args.push(output);
  run('ffmpeg', args);
  const normalized = probe(output);
  if (!normalized.video || Math.abs(normalized.duration - duration) > 0.1)
    throw new Error(
      'Normalization did not produce the requested duration; inspect source timestamps or recapture.',
    );
  return normalized;
}
export function inside(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative))
    throw new Error('Media paths must be relative to the recordings folder.');
  const base = fs.realpathSync(root);
  const candidate = path.resolve(base, relative);
  if (candidate === base || !candidate.startsWith(base + path.sep))
    throw new Error(`Media path escapes recordings folder: ${relative}`);
  if (!fs.existsSync(candidate))
    throw new Error(
      `Missing media: ${relative}. Supply this recording or update the scene plan.`,
    );
  const real = fs.realpathSync(candidate);
  if (!real.startsWith(base + path.sep))
    throw new Error(`Media symlink escapes recordings folder: ${relative}`);
  return real;
}
export function validatePlan(plan, recordings, probeFn = probe) {
  if (!['launch', 'app-store'].includes(plan.mode))
    throw new Error('mode must be launch or app-store');
  for (const key of ['appName', 'language', 'headline', 'cta', 'disclosure']) {
    if (typeof plan[key] !== 'string') throw new Error(`${key} must be text`);
  }
  if (!plan.appName.trim() || plan.appName.length > 40)
    throw new Error('appName must contain 1–40 characters');
  if (
    plan.headline.length > 55 ||
    plan.cta.length > 70 ||
    plan.disclosure.length > 150
  )
    throw new Error(
      'Shorten headline (55), CTA (70), or disclosure (150) for readable mobile type.',
    );
  for (const key of ['accent', 'background'])
    if (!/^#[0-9a-f]{6}$/i.test(plan[key]))
      throw new Error(`${key} must be a six-digit hex colour`);
  if (
    typeof plan.fictional !== 'boolean' ||
    typeof plan.sourceAudio !== 'boolean'
  )
    throw new Error('fictional and sourceAudio must be explicit booleans');
  if (
    !['device', 'simulator', 'synthetic', 'unknown'].includes(plan.provenance)
  )
    throw new Error(
      'Record provenance as device, simulator, synthetic, or unknown',
    );
  if (
    !plan.capture ||
    ['appVersion', 'device', 'date', 'simulatedConditions'].some(
      (k) => typeof plan.capture[k] !== 'string' || !plan.capture[k].trim(),
    )
  )
    throw new Error(
      'Provide capture appVersion, device, date, and simulatedConditions (use "none" if applicable).',
    );
  if (plan.provenance === 'synthetic' && !plan.fictional)
    throw new Error('Synthetic footage must be labelled fictional.');
  if (!Array.isArray(plan.scenes) || plan.scenes.length === 0)
    throw new Error('Add at least one scene backed by a recording');
  let duration = 0;
  for (const [i, s] of plan.scenes.entries()) {
    if (
      !Number.isFinite(s.start) ||
      s.start < 0 ||
      !Number.isFinite(s.duration) ||
      s.duration < 2
    )
      throw new Error(
        `Scene ${i + 1}: start must be nonnegative; duration must be at least 2 seconds.`,
      );
    if (Math.abs(s.duration * 30 - Math.round(s.duration * 30)) > 0.001)
      throw new Error(`Scene ${i + 1}: duration must align to a 30 fps frame.`);
    if (typeof s.caption !== 'string' || s.caption.length > 90)
      throw new Error(
        `Scene ${i + 1}: caption must be text of at most 90 characters.`,
      );
    if (typeof s.evidence !== 'string' || !s.evidence.trim())
      throw new Error(
        `Scene ${i + 1}: describe the visible action supporting the caption.`,
      );
    const media = probeFn(inside(recordings, s.file));
    if (!media.video || !Number.isFinite(media.duration))
      throw new Error(`Scene ${i + 1}: source has no usable video/duration.`);
    if (s.start + s.duration > media.duration + 0.04)
      throw new Error(
        `Scene ${i + 1}: trim exceeds ${media.duration.toFixed(2)}s source. Capture more footage or shorten the scene.`,
      );
    duration += s.duration;
  }
  if (duration > 90) throw new Error('v1 supports edits up to 90 seconds.');
  if (plan.mode === 'app-store' && (duration < 15 || duration > 30))
    throw new Error('App Store previews must be 15–30 seconds.');
  if (plan.music) {
    const m = probeFn(inside(recordings, plan.music));
    if (!m.audio || m.duration < duration)
      throw new Error('Music must contain audio and cover the complete edit.');
  }
  if (plan.logo) {
    const p = inside(recordings, plan.logo);
    if (!/\.(png|jpe?g|webp)$/i.test(p))
      throw new Error('Logo must be PNG, JPEG, or WebP.');
  }
  return {
    duration,
    frames: Math.round(duration * 30),
    width: plan.mode === 'app-store' ? 886 : 1080,
    height: 1920,
    fps: 30,
  };
}

export function technicalChecks(media, plan) {
  const checks = [];
  const add = (name, ok, actual) => checks.push({ name, pass: !!ok, actual });
  const v = media.video || {},
    a = media.audio || {};
  const expected = plan.scenes.reduce((n, s) => n + s.duration, 0);
  add(
    'dimensions',
    v.width === (plan.mode === 'app-store' ? 886 : 1080) && v.height === 1920,
    `${v.width}x${v.height}`,
  );
  add('video-codec', v.codec_name === 'h264', v.codec_name);
  add('pixel-format', v.pix_fmt === 'yuv420p', v.pix_fmt);
  add('square-pixels', v.sample_aspect_ratio === '1:1', v.sample_aspect_ratio);
  add(
    'frame-rate',
    Math.abs(rate(v.avg_frame_rate) - 30) < 0.001 &&
      Math.abs(rate(v.r_frame_rate) - 30) < 0.001,
    v.avg_frame_rate,
  );
  add('duration', Math.abs(media.duration - expected) <= 0.1, media.duration);
  add('audio-codec', a.codec_name === 'aac', a.codec_name);
  add('audio-channels', a.channels === 2, a.channels);
  add('audio-sample-rate', Number(a.sample_rate) === 48000, a.sample_rate);
  add('mp4-container', String(media.format).includes('mp4'), media.format);
  if (plan.mode === 'app-store') {
    add(
      'store-duration',
      media.duration >= 15 && media.duration <= 30.05,
      media.duration,
    );
    add('store-size', media.size <= 500_000_000, media.size);
    add(
      'profile-level',
      v.profile === 'High' && v.level <= 40,
      `${v.profile} / ${v.level}`,
    );
    add('progressive', v.field_order === 'progressive', v.field_order);
  }
  return checks;
}

export function reportFor(file, plan) {
  const media = probe(file);
  const checks = technicalChecks(media, plan);
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    file: path.basename(file),
    mode: plan.mode,
    technical: {
      passed: checks.every((c) => c.pass),
      checks,
      observedVideoBitrate: Number(media.video?.bit_rate) || null,
      observedAudioBitrate: Number(media.audio?.bit_rate) || null,
      bitrateNote:
        'This pipeline targets 11 Mbps video and 256 kbps AAC; actual averages can be lower for static images or silence. Standalone validation cannot establish original encoder settings.',
    },
    provenance: {
      kind: plan.provenance,
      fictional: plan.fictional,
      capture: plan.capture,
      deviceCaptureRequirement:
        plan.mode !== 'app-store'
          ? 'not applicable to launch mode'
          : plan.provenance !== 'device'
            ? 'unmet — development example only'
            : 'declared, not independently verified',
    },
    manualReview: {
      status: 'pending',
      checks: [
        'Watch the entire export at phone size, with audio and muted.',
        'Check every cut, caption, UI proportion, and disclosure.',
        'Verify all claims against the actual app; no private information or test controls.',
        'Confirm media rights, login and paid-feature disclosures.',
        'Confirm capture provenance; recheck Apple requirements before upload.',
      ],
    },
    appleAcceptance: 'unverified — no upload or submission performed',
    source: {
      url: 'https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications',
      verifiedOn: '2026-11-11',
    },
  };
}
