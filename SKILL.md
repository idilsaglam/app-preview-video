---
name: app-preview-video
description: Turn supplied mobile app recordings into editable Remotion launch videos or technically checked App Store preview drafts. Use for footage inspection, storyboarding, captioned edits, local rendering and export checks; not for inventing app screens or submitting store assets.
---

# App Preview Video

This folder is both an installable skill and the runnable Remotion template. Read [README.md](README.md) for tested setup and commands. Read [the scene-plan interface](references/scene-plan.md) when creating a plan and [Apple requirements](references/apple.md) for App Store mode. For fresh capture, use [the capture guide](docs/capture.md).

## Intake and evidence

Accept recordings folder, mode (`launch` or `app-store`), app name, brand assets, language and creative brief. Default to English, portrait, 30 seconds for launch or 25 seconds for App Store. Use supplied colours; when absent use the example's neutral green palette and label it a draft direction. Never invent current app capabilities.

Run `npm run doctor`, then inspect footage with `npm run inspect -- --recordings DIR --out NEW_DIR`. Read the inspection JSON and reference frames, and review full clips for actions, sensitive data, test UI, loading, and truthful sequence. Stills alone are not content verification. If full playback is unavailable, record that limit and keep manual review pending.

Collect capture version, device, date and simulated conditions. Keep real app assets outside the public package. Ask for missing footage when a requested moment is absent. Do not replace it with generated UI, reverse time to imply a different result, or relabel simulator footage as physical-device capture.

## Edit and render

Create a scene plan with actual source trim points, brief readable captions, and an evidence description per scene. Use one coherent journey with a useful action in the opening seconds. Preserve legibility and input proportions. Use `examples/launch.json` or `examples/app-store.json` as a structural starting point, replacing every fictional claim and source reference.

Launch mode permits a frame, headline, CTA and branded background. App Store mode shows the app with restrained captions and access disclosures; no fake device interaction or fabricated UI. The bundled demo is explicitly fictional, never an Apple submission asset. This v1 requires device provenance before calling a real app edit submission-oriented; technical checks alone never establish content compliance or acceptance.

Run `npm run render -- --recordings DIR --plan PLAN.json --out NEW_DIR`. Output folders must be new to preserve evidence. The tool normalizes trimmed media, renders through Remotion, encodes MP4, creates a poster and writes provenance, hashes, timing and technical checks. Sources remain unchanged. Music is optional, user-supplied, licensed, and at least as long as the edit. Source audio defaults to muted.

## Review and delivery

Review the entire finished MP4 with audio and muted at phone size. Check all cuts, disclosures, captions, claimed actions and audio. If problems are found, revise the scene plan and render into another folder; preserve first render and describe the real correction.

Report separately: technical validation, manual playback/content review, source provenance and Apple acceptance. Never turn `pending` into `passed` based on a few screenshots. Provide the MP4, poster, editable project/scene plan, report and remaining limitations. No upload, submission, cloud rendering, paid assets or publishing is implied.

