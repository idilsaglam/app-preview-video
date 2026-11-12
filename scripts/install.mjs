import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(
  process.env.APP_PREVIEW_SKILLS_DIR ||
    path.join(os.homedir(), '.agents', 'skills'),
  'app-preview-video',
);
if (fs.existsSync(target)) {
  console.error(`Skill already exists at ${target}; refusing to overwrite it.`);
  process.exit(1);
}
const files = [
  'SKILL.md',
  'agents',
  'references',
  'src',
  'scripts',
  'tests',
  'examples',
  'docs',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'README.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'THIRD_PARTY.md',
  '.gitignore',
  '.prettierrc.json',
];
for (const name of files)
  if (!fs.existsSync(path.join(root, name)))
    throw new Error(`Incomplete package: missing ${name}`);
fs.mkdirSync(path.dirname(target), { recursive: true });
const staging = fs.mkdtempSync(
  path.join(path.dirname(target), '.app-preview-install-'),
);
try {
  for (const name of files)
    fs.cpSync(path.join(root, name), path.join(staging, name), {
      recursive: true,
    });
  fs.mkdirSync(path.join(staging, 'public'));
  if (fs.existsSync(target))
    throw new Error(
      'Another installation created the target; refusing to replace it.',
    );
  fs.renameSync(staging, target);
} catch (e) {
  fs.rmSync(staging, { recursive: true, force: true });
  throw e;
}
console.log(
  `Installed ${target}\nRun npm ci inside that folder before rendering. Restart your agent session to discover the skill.`,
);
