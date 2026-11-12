import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  run,
  probe,
  inside,
  validatePlan,
  reportFor,
  finalizeVideo,
  normalizeClip,
} from './media.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [command, ...args] = process.argv.slice(2);
let activeOutput;
const json = (f, x) => fs.writeFileSync(f, JSON.stringify(x, null, 2) + '\n');
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
function flag(name, fallback) {
  const i = args.indexOf('--' + name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith('--'))
    throw new Error(`--${name} needs a value`);
  return args[i + 1];
}
function required(name) {
  const v = flag(name);
  if (!v) throw new Error(`Supply --${name}`);
  return path.resolve(v);
}
function freshDir(dir) {
  if (fs.existsSync(dir))
    throw new Error(
      `Output already exists: ${dir}. Choose a new output folder to preserve evidence.`,
    );
  fs.mkdirSync(dir, { recursive: true });
  activeOutput = dir;
}
function hash(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function browser() {
  const configured = process.env.REMOTION_BROWSER_EXECUTABLE;
  return (
    configured ||
    (fs.existsSync(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    )
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined)
  );
}
async function renderer(publicDir) {
  console.log('Bundling the editable Remotion project…');
  const { bundle } = await import('@remotion/bundler');
  const api = await import('@remotion/renderer');
  const serveUrl = await bundle({
    entryPoint: path.join(root, 'src/index.tsx'),
    publicDir,
  });
  return { api, serveUrl, browserExecutable: browser() };
}
async function trackedRender(api, options) {
  const { cancel, cancelSignal } = api.makeCancelSignal();
  let lastProgress = Date.now(),
    lastBucket = -1;
  const watchdog = setInterval(() => {
    if (Date.now() - lastProgress > 120000) {
      console.error(
        'No render progress for 120 seconds; cancelling. Check available memory and browser compatibility, then retry into a new folder.',
      );
      cancel();
    }
  }, 5000);
  try {
    return await api.renderMedia({
      ...options,
      concurrency: 1,
      disableSharedMemoryCapture: true,
      cancelSignal,
      onProgress: ({ progress }) => {
        lastProgress = Date.now();
        const bucket = Math.floor(progress * 10);
        if (bucket !== lastBucket) {
          lastBucket = bucket;
          console.log(`Render ${Math.round(progress * 100)}%`);
        }
      },
    });
  } finally {
    clearInterval(watchdog);
    if (options.serveUrl && !/^https?:/.test(options.serveUrl))
      fs.rmSync(options.serveUrl, { recursive: true, force: true });
  }
}
function doctor() {
  const versions = {
    node: process.version,
    platform: `${process.platform}/${process.arch}`,
    ffmpeg: run('ffmpeg', ['-version']).split('\n')[0],
    ffprobe: run('ffprobe', ['-version']).split('\n')[0],
    remotion: read(path.join(root, 'node_modules/remotion/package.json'))
      .version,
    browser: browser() || 'Remotion managed browser (download may be required)',
    cpus: os.cpus().length,
  };
  console.log(JSON.stringify(versions, null, 2));
}
async function sample() {
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  const out = path.join(root, 'public/sample.mp4');
  if (fs.existsSync(out))
    throw new Error(
      'public/sample.mp4 already exists; use it, or move it before regenerating.',
    );
  const { api, serveUrl, browserExecutable } = await renderer(
    path.join(root, 'public'),
  );
  const composition = await api.selectComposition({
    serveUrl,
    id: 'DemoRecording',
    browserExecutable,
  });
  const start = Date.now();
  await trackedRender(api, {
    serveUrl,
    composition,
    codec: 'h264',
    outputLocation: out,
    browserExecutable,
    crf: 20,
    pixelFormat: 'yuv420p',
  });
  console.log(
    JSON.stringify(
      {
        output: out,
        seconds: (Date.now() - start) / 1000,
        sha256: hash(out),
        fictional: true,
      },
      null,
      2,
    ),
  );
}
function inspect() {
  const recordings = required('recordings'),
    out = required('out');
  freshDir(out);
  const files = fs
    .readdirSync(recordings)
    .filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f));
  if (!files.length)
    throw new Error('No video recordings found in this folder.');
  const results = files.map((file, i) => {
    const src = inside(recordings, file),
      m = probe(src);
    const frames = [];
    for (const [j, fraction] of [0.1, 0.5, 0.9].entries()) {
      const name = `clip-${i + 1}-${j + 1}.jpg`;
      const time = m.duration * fraction;
      run('ffmpeg', [
        '-v',
        'error',
        '-n',
        '-ss',
        String(time),
        '-i',
        src,
        '-frames:v',
        '1',
        '-vf',
        'scale=440:-2',
        path.join(out, name),
      ]);
      frames.push({ file: name, time });
    }
    return {
      file,
      sha256: hash(src),
      ...m,
      referenceFrames: frames,
      contentReview:
        'pending — inspect full footage; three stills cannot prove content safety or claims',
    };
  });
  json(path.join(out, 'inspection.json'), results);
  console.log(`Inspected ${files.length} recordings: ${out}`);
}
async function render() {
  const recordings = required('recordings'),
    planPath = required('plan'),
    out = required('out');
  const plan = read(planPath),
    spec = validatePlan(plan, recordings);
  const sourceFiles = [
    ...new Set(
      [...plan.scenes.map((s) => s.file), plan.music, plan.logo].filter(
        Boolean,
      ),
    ),
  ];
  const sourceHashes = sourceFiles.map((file) => ({
    file,
    sha256: hash(inside(recordings, file)),
  }));
  freshDir(out);
  json(path.join(out, 'scene-plan.json'), plan);
  const assets = path.join(out, 'assets');
  fs.mkdirSync(assets);
  const startedAt = new Date().toISOString(),
    start = Date.now();
  const clips = [];
  for (const [i, s] of plan.scenes.entries()) {
    const filename = `scene-${i + 1}.mp4`;
    clips.push(filename);
    const source = inside(recordings, s.file);
    normalizeClip(source, path.join(assets, filename), {
      ...s,
      sourceAudio: plan.sourceAudio,
    });
  }
  const props = { plan, clips };
  for (const field of ['music', 'logo'])
    if (plan[field]) {
      const name = field + path.extname(plan[field]);
      fs.copyFileSync(inside(recordings, plan[field]), path.join(assets, name));
      props[field] = name;
    }
  json(path.join(out, 'render-props.json'), props);
  const { api, serveUrl, browserExecutable } = await renderer(assets);
  const composition = await api.selectComposition({
    serveUrl,
    id: 'AppVideo',
    inputProps: props,
    browserExecutable,
  });
  const intermediate = path.join(out, 'intermediate.mp4');
  await trackedRender(api, {
    serveUrl,
    composition,
    inputProps: props,
    codec: 'h264',
    outputLocation: intermediate,
    browserExecutable,
    crf: 18,
    pixelFormat: 'yuv420p',
  });
  const final = path.join(out, `${plan.mode}.mp4`);
  finalizeVideo(intermediate, final, spec.duration);
  run('ffmpeg', [
    '-v',
    'error',
    '-n',
    '-ss',
    String(Math.min(5, spec.duration / 2)),
    '-i',
    final,
    '-frames:v',
    '1',
    path.join(out, 'poster.png'),
  ]);
  const report = reportFor(final, plan);
  json(path.join(out, 'validation.json'), report);
  json(path.join(out, 'run.json'), {
    startedAt,
    finishedAt: new Date().toISOString(),
    elapsedSeconds: (Date.now() - start) / 1000,
    command: process.argv.slice(2),
    node: process.version,
    remotion: read(path.join(root, 'node_modules/remotion/package.json'))
      .version,
    sources: sourceHashes,
    output: { file: path.basename(final), sha256: hash(final) },
    technicalPassed: report.technical.passed,
  });
  fs.unlinkSync(intermediate);
  console.log(
    JSON.stringify(
      {
        output: final,
        elapsedSeconds: (Date.now() - start) / 1000,
        technicalPassed: report.technical.passed,
        manualReview: 'pending',
        appleAcceptance: report.appleAcceptance,
      },
      null,
      2,
    ),
  );
  if (!report.technical.passed) process.exitCode = 1;
}
async function teaser() {
  const source = required('run'),
    out = required('out');
  const plan = read(path.join(source, 'scene-plan.json'));
  const edited = path.join(source, `${plan.mode}.mp4`),
    raw = path.join(source, 'assets', 'scene-1.mp4');
  if (probe(raw).duration < 7 || probe(edited).duration < 10)
    throw new Error(
      'Teaser needs a first normalized scene at least 7 seconds long and an edit at least 10 seconds long.',
    );
  const report = reportFor(edited, plan);
  if (!report.technical.passed)
    throw new Error(
      'Fix the source edit technical checks before making the teaser.',
    );
  freshDir(out);
  const assets = path.join(out, 'assets');
  fs.mkdirSync(assets);
  fs.copyFileSync(raw, path.join(assets, 'raw.mp4'));
  fs.copyFileSync(edited, path.join(assets, 'edited.mp4'));
  const props = {
    appName: plan.appName,
    raw: 'raw.mp4',
    edited: 'edited.mp4',
    technicalPassed: true,
    provenance:
      plan.provenance === 'simulator'
        ? 'simulator / test location'
        : plan.provenance,
  };
  json(path.join(out, 'render-props.json'), props);
  const { api, serveUrl, browserExecutable } = await renderer(assets);
  const composition = await api.selectComposition({
    serveUrl,
    id: 'TutorialTeaser',
    inputProps: props,
    browserExecutable,
  });
  const start = Date.now(),
    intermediate = path.join(out, 'intermediate.mp4'),
    final = path.join(out, 'teaser.mp4');
  await trackedRender(api, {
    serveUrl,
    composition,
    inputProps: props,
    codec: 'h264',
    outputLocation: intermediate,
    browserExecutable,
    crf: 18,
  });
  finalizeVideo(intermediate, final, 35);
  run('ffmpeg', [
    '-v',
    'error',
    '-n',
    '-ss',
    '29',
    '-i',
    final,
    '-frames:v',
    '1',
    path.join(out, 'poster.png'),
  ]);
  const technical = reportFor(final, {
    ...plan,
    mode: 'launch',
    scenes: [{ duration: 35 }],
  }).technical;
  json(path.join(out, 'run.json'), {
    kind: 'tutorial-teaser',
    elapsedSeconds: (Date.now() - start) / 1000,
    sourceEditSha256: hash(edited),
    sourceRawSha256: hash(raw),
    outputSha256: hash(final),
    technical,
    manualReview: 'pending',
    note: 'Example prompt is labelled workflow replay. No repository URL is claimed.',
  });
  fs.unlinkSync(intermediate);
  console.log(`Teaser: ${final}`);
  if (!technical.passed) process.exitCode = 1;
}
function validate() {
  const plan = read(required('plan')),
    file = required('file');
  const report = reportFor(file, plan);
  const dest = flag('out');
  if (dest) {
    if (fs.existsSync(dest))
      throw new Error('Validation report exists; choose a new filename.');
    json(dest, report);
  }
  console.log(JSON.stringify(report, null, 2));
  if (!report.technical.passed) process.exitCode = 1;
}
try {
  if (command === 'doctor') doctor();
  else if (command === 'sample') await sample();
  else if (command === 'inspect') inspect();
  else if (command === 'render') await render();
  else if (command === 'teaser') await teaser();
  else if (command === 'validate') validate();
  else
    throw new Error(
      'Commands: doctor | sample | inspect --recordings DIR --out DIR | render --recordings DIR --plan JSON --out DIR | validate --file MP4 --plan JSON [--out JSON]',
    );
} catch (e) {
  if (activeOutput)
    json(path.join(activeOutput, 'failure.json'), {
      createdAt: new Date().toISOString(),
      command: process.argv.slice(2),
      error: e.message,
    });
  console.error(`ERROR: ${e.message}`);
  process.exitCode = 1;
}
