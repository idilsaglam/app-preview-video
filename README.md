# App Preview Video

**Turn your app recordings into an editable launch video with a reusable Codex skill and Remotion template.**

Bring your recordings, app name and creative brief. The agent reviews the footage and writes a scene plan; local tools render the video, generate a poster and check the export. Original recordings stay unchanged.

- **Launch:** 30 seconds, 1080 × 1920, 30 fps; branded background, animated headlines, captions and closing CTA.
- **App Store draft:** defaults to 25 seconds, 886 × 1920, 30 fps; restrained captions and technical export checks.
- **Included demo:** Pocket Trails, a clearly labelled fictional app you can generate locally. No private Visitaki footage is included.

## What you need

| Dependency | Why |
| --- | --- |
| Node.js 22.20+ and compatible npm | Required by the current skills CLI; the renderer itself supports Node 20+ |
| FFmpeg and FFprobe on your PATH | Inspects, trims, normalizes and encodes media |
| Google Chrome | Renders the Remotion composition |
| Codex | Uses the skill to review footage and plan an edit; optional for CLI-only use |

Tested on macOS Apple Silicon with Node 26.5.0, npm 11.17.0, FFmpeg 7.1.1 and Remotion 4.0.542. Other operating systems have not been verified. Commands below use a macOS/Linux-style shell.

If you already use Homebrew on macOS, `brew install node ffmpeg` installs the command-line prerequisites. Install Chrome separately. Existing compatible installations are fine.

Chrome is detected automatically on macOS. Elsewhere, set `REMOTION_BROWSER_EXECUTABLE` to its executable, or let Remotion download its managed browser. Dependency installation and browser downloads need internet access; video rendering runs locally.

## 1. Install with skills.sh

From your project folder, run:

```sh
npx skills add idilsaglam/app-preview-video --skill app-preview-video -a codex
cd .agents/skills/app-preview-video
npm ci
npm run doctor
```

This installs the skill and runnable template into your project's `.agents/skills/app-preview-video`. The skills CLI does not install the template's npm dependencies; `npm ci` does that separately. Keep this terminal in the installed folder for the demo and render commands below.

For a personal installation available across projects (the route used in our video walkthrough), use this **instead**:

```sh
npx skills add idilsaglam/app-preview-video --skill app-preview-video -a codex -g
cd "$HOME/.agents/skills/app-preview-video"
npm ci
npm run doctor
```

`-a codex` selects Codex; `-g` selects a personal installation instead of a project installation. Use the location printed by the CLI if your setup has a custom skills path. See the [official skills CLI documentation](https://github.com/vercel-labs/skills).

Open Codex in your project, start a new chat, type **`$app-preview-video`**, and select the skill. Restart Codex if it does not appear. A project installation applies to that project; the personal installation is available across projects.

Already installed during rehearsal? Reuse that copy. Back up local edits before updating a skill. For installations managed by the skills CLI, run `npx skills update` to check for and apply updates; this can update other installed skills too. Run `npm ci` again in the updated skill folder if its dependencies changed.

## 2. Try the demo first

From the installed skill folder after the setup above, no app footage or AI account is needed for this CLI demo:

```sh
npm run sample
npm run render -- --recordings public --plan examples/launch.json --out renders/demo-launch
```

Open **`renders/demo-launch/launch.mp4`**. The demo source is generated at `public/sample.mp4`; run `npm run sample` only once. It is an illustrative interface, not footage of a released app.

Every output directory must be new. For another edit, choose `renders/demo-launch-v2` rather than overwriting the first run.

## 3. Alternative: clone the project

For CLI-only use or development, you can clone the repository instead of using skills.sh:

```sh
git clone https://github.com/idilsaglam/app-preview-video.git
cd app-preview-video
npm ci
npm run doctor
```

Alternatively, select **Code → Download ZIP**, extract it, and run the setup commands inside that folder. Continue with the demo commands above. This route supports Node 20+ with a compatible npm.

To install a cloned checkout as a personal Codex skill, the original installer remains available:

```sh
npm run install-skill
cd "$HOME/.agents/skills/app-preview-video"
npm ci
npm run doctor
```

Use one installation route. The custom installer refuses to replace an existing skill. Set `APP_PREVIEW_SKILLS_DIR` to choose a different parent directory; follow its printed path. You can also ask Codex to read the checkout's `SKILL.md` directly without installing another copy.

## 4. Use your own app recordings

Record a few short portrait clips with a pause before and after each action. Show a useful sequence: browse → open an item → use a feature → show its actual result. Include only actions your app supports. Keep private information out of the footage.

Put MP4, MOV, M4V or WebM files directly inside a folder outside this repository. Record the app version, device and any simulated conditions. See the [capture checklist](docs/capture.md).

Paste this into Codex, replacing the paths and app details:

```text
Use $app-preview-video.

Create a 30-second English portrait launch video for my app, My App.
My recordings are in /absolute/path/to/my-recordings.
Write all plans and outputs into /absolute/path/to/my-video-project.

Creative brief: a calm introduction showing the app's main useful action.
Brand colours: background #102c24, accent #c4f273.
Capture: simulator; app version 1.0; describe any simulated conditions accurately.

Inspect the recordings and propose scenes, trim points and short captions.
Use only actions visible in the footage. Ask for missing footage instead of
inventing screens or results. Flag private information before rendering.

Then render a launch video into a new output folder.
Deliver the MP4, poster, editable scene plan and validation report.
Keep source recordings unchanged. Do not publish or upload anything.
```

The skill first looks for your real logo/app icon and design references in the supplied assets or app project. If the logo is missing, it asks before rendering; if multiple versions exist, it asks which to use. You can explicitly choose a text-only treatment. It derives colours, typography and framing from your app instead of copying the demo's visual style, then shows an opening-frame direction and caption style.

For launch videos, simulator/test-location information stays in the plan and report by default, rather than being automatically printed over the footage. Keep disclosures that are necessary to avoid misleading viewers. Fictional examples remain labelled, and App Store capture requirements still apply.

The agent should inspect the actual footage, write a JSON scene plan and run the tools. The CLI does not independently understand video or invent a storyboard.

To revise an edit:

```text
Keep the selected footage and timings. Change the opening caption to
“Your next idea starts here.” Render into a new v2 folder, preserve v1,
and explain what changed.
```

Watch the entire result at phone size, with sound and muted, before sharing it.

### Prefer the command line?

Run these from the checkout or installed skill folder:

```sh
npm run inspect -- --recordings /absolute/path/to/my-recordings --out renders/my-inspection
```

Copy `examples/launch.json` into your private project as `scene-plan.json`. Replace the fictional app metadata, capture provenance, filenames, trim points and captions with your own observed footage. Set `fictional` to `false` for real app footage and `provenance` to `simulator` or `device` as appropriate. For the default launch format, make scene durations total 30 seconds; every trim must fit its source clip.

```sh
npm run render -- --recordings /absolute/path/to/my-recordings --plan /absolute/path/to/scene-plan.json --out renders/my-launch-v1
```

The [scene-plan reference](references/scene-plan.md) explains every field. Filenames in the plan are relative to the recordings folder. Media, logos and optional licensed music must be local files; remote URLs are not accepted.

## What you get

```text
renders/my-launch-v1/
├── launch.mp4           Final video (app-store.mp4 in App Store mode)
├── poster.png           Poster frame
├── scene-plan.json      Source clips, trim points, captions and provenance
├── render-props.json    Editable composition settings
├── assets/              Prepared clips and assets
├── validation.json      Technical checks and pending manual review
└── run.json             Run timing and file hashes
```

Open an existing edit in Remotion Studio from the project folder:

```sh
npx remotion studio src/index.tsx --public-dir /absolute/path/to/run/assets --props /absolute/path/to/run/render-props.json
```

Use `npm run render` for final exports: direct Studio export skips this package's final encoding and validation.

## How it works

1. **Inspect:** FFprobe reads dimensions, duration and audio; FFmpeg extracts reference frames.
2. **Plan:** the agent reviews footage and records scene choices in JSON. Full playback review is required; sampled stills alone are insufficient.
3. **Prepare:** FFmpeg trims and normalizes footage to consistent timing without stretching the UI.
4. **Compose:** Remotion renders React components for the footage, captions, branding and animation.
5. **Export:** FFmpeg creates the H.264 MP4 and a stereo AAC track, including silence when no audio is selected.
6. **Check:** scripts validate technical properties and preserve separate manual-review and Apple-acceptance statuses.

Source audio is muted by default. Enable `sourceAudio` deliberately or supply music you are licensed to use.

## App Store mode

After generating the demo source, try the fictional App Store-format example:

```sh
npm run render -- --recordings public --plan examples/app-store.json --out renders/demo-store
```

This tests the output format, **not App Store eligibility**. Use simulator footage for launch videos and development examples. This workflow requires physical-device provenance for a real submission-oriented preview. Apple acceptance remains unverified until submission; technical checks cannot establish content compliance.

The initial preset uses 886 × 1920, 30 fps, H.264 MP4, a 10–12 Mbps target, and stereo AAC at 48 kHz/256 kbps. The validator checks the supported 15–30-second duration and 500 MB limit among other properties. Recheck [Apple's current specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications) before submission. See [preset notes](references/apple.md).

## Will everyone get the same result?

- The same footage, saved scene plan and pinned dependencies should produce functionally equivalent output. Encoded files are not guaranteed to be byte-identical.
- A new AI conversation can choose different scenes, captions and timing.
- App name, colours, footage and copy are configurable. Larger visual changes require editing the Remotion components.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| `ffmpeg` or `ffprobe` not found | Install FFmpeg and ensure both commands are on PATH; rerun `npm run doctor`. |
| Browser missing | Install Chrome or set `REMOTION_BROWSER_EXECUTABLE` to its executable. |
| Skill not listed | Confirm installation at the printed path, open a new chat, then restart Codex if necessary. |
| Output folder already exists | Choose a new folder for this revision. |
| `sample.mp4` already exists | Reuse it; the sample generator deliberately refuses to overwrite it. |
| Trim exceeds clip duration | Inspect the file's actual duration and shorten the trim or capture replacement footage. |
| Render cancelled after no progress | Check memory, disk space and browser compatibility; retry into a new output folder. |
| Technical checks pass but the edit looks wrong | Review all footage and captions, revise the scene plan and render again. |

## Costs, privacy and limits

No paid media, cloud renderer or API key is required by the rendering scripts. Your coding agent's usage costs are separate. Your agent's handling of footage depends on its own settings and service; “local rendering” does not mean an AI service never receives content you give it.

Original code, skill instructions and fictional demo assets are [MIT-licensed](LICENSE). Remotion has separate licensing conditions; check [its current terms](https://www.remotion.dev/docs/license/pricing) for your situation. See [dependency attribution](THIRD_PARTY.md).

v1 supports portrait launch videos and one iPhone portrait App Store preset. It does not automatically capture arbitrary apps, upload videos, submit to Apple, or guarantee approval. Technical validation cannot prove content rights, privacy, truthful claims or readability throughout the edit.

Keep recordings and personal assets outside the repository. The reusable package excludes Visitaki branding, account data and recordings.

## Development

```sh
npm test
npm run typecheck
npm run format:check
```

- [Contributing](CONTRIBUTING.md): meaningful checks and safe example assets.

