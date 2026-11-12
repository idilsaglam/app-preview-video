# Scene plan interface

Copy one of the example JSON files. File paths are relative to `--recordings`; absolute paths, traversal and escaping symlinks are rejected. No credentials or remote media URLs are needed.

- `mode`: `launch` or `app-store`.
- `appName`, `language`, `accent`, `background`, `headline`, `cta`, `disclosure`: text/brand settings. Colours use six-digit hex. Headline is launch-only; disclosure appears in both outputs. Keep access and paid-feature disclosures truthful. Captions are authored in `language`; this tool does not translate them automatically.
- `fictional`: explicit boolean. `provenance`: `device`, `simulator`, `synthetic`, or `unknown`.
- `capture`: `appVersion`, `device`, `date`, `simulatedConditions`; use `none` for no simulation. These declarations require human verification.
- `sourceAudio`: boolean, default to false in authored plans. Optional `music` and `logo` reference local files. Music must cover the whole edit; logo must be PNG/JPEG/WebP. Launch-only logo.
- Optional `design`: `fontFamily` (installed local CSS font stack), `textColor`, `mutedColor`, `frameColor` (six-digit hex); `frameRadius` (0–100 px); `logoSize` (32–140 px); `decorations` (boolean); `layout` (`classic` or `app`). The `app` launch layout uses a larger logo area, title-case name, larger footage, restrained framing and a three-second logo/CTA closing card. These settings leave App Store footage framing unchanged. Custom font names must resolve on the rendering machine; do not claim a brand font loaded without checking it.
- `scenes`: ordered list of `file`, source `start` in seconds, `duration` in seconds, `caption` and `evidence` describing the visible supporting action. Timeline placement is cumulative, without gaps. Durations align to 1/30 second and each scene lasts at least 2 seconds.

Render outputs include normalized assets, `render-props.json`, original `scene-plan.json`, MP4, poster, `run.json` and `validation.json`. To edit a rendered run in Studio:

```sh
npx remotion studio src/index.tsx --public-dir /absolute/path/to/run/assets --props /absolute/path/to/run/render-props.json
```

Use the CLI to make final exports; direct Studio export does not run this package's final encoding and validation. Original recordings and plan plus this repository are the editable source. Source footage is always contained, never stretched; use matching portrait capture for full-screen store previews.
