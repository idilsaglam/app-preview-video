# Capture guide

## Before recording

Use the current app build and record its version/build. Use a test account with no private profile details. Close unrelated apps/notifications yourself; do not show credentials. Record language, date, device model, capture method and any simulated location or data. Do not manufacture progress or rewards to fill a missing scene.

Capture portrait footage at native screen size. Leave two seconds of stillness around each action. Record 10–15 seconds per shot; keep the original files unchanged. Avoid simulator chrome in the actual video.

## Visitaki shot list

| Shot       | Action                                               | Evidence needed                                              | Caption direction                  |
| ---------- | ---------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| 01 Explore | Show the loaded map, then select a real quest marker | Actual current quest markers; no loading/error state         | Discover a different side of Paris |
| 02 Browse  | Open Quests, select Paris and browse loaded cards    | Actual list with readable titles                             | Find a quest that catches your eye |
| 03 Detail  | Open a quest and expand its real description         | Description and truthful access requirements                 | Follow a little curiosity          |
| 04 Result  | Show a genuinely earned stamp/completion             | Real completion; no test buttons or simulated server success | Keep the memory of your walk       |

If shot 04 is unavailable, make a browsing-focused launch draft using 01–03. Do not claim completion or rewards. If route errors appear, recapture after resolving the actual app condition; do not paint over the error or imply navigation worked.

## Simulator recording for launch/demo footage

List available simulators and select the intended one. Boot it if needed, launch the installed app, and navigate normally.

```sh
xcrun simctl list devices available
xcrun simctl launch booted fr.makepad.visitaki
xcrun simctl io booted recordVideo --codec=h264 /absolute/path/to/01-explore.mp4
```

Press Ctrl-C in that terminal to stop and finalize the recording. Do not close the terminal or kill it forcefully. When more than one simulator is booted, replace `booted` with its exact identifier. Any simulated location must be documented in the capture manifest and tutorial.

## Physical-device recording for the App Store edit

Connect and unlock the iPhone. Use the built-in screen recorder, or QuickTime's New Movie Recording and select the paired iPhone as the camera. Ensure recording captures only the app. Move the resulting clips into your private recordings folder.

Newer Xcode installations also expose `xcrun devicectl device capture`; check `--help` on your machine before using it, since command support varies. A command appearing in help does not establish device support: this session’s physical iPhone rejected the Screen Recording capability even though screenshots worked. Use built-in iPhone Screen Recording or a working QuickTime connection in that case. The iPhone may require your interaction to unlock, authorize recording, or perform location-dependent actions. Do not change phone privacy settings silently.

The final App Store edit requires device footage and genuine current functionality. Simulator edits and technical export passes remain development evidence until replaced and fully reviewed.

## Capture manifest

Keep a JSON file beside the recordings with `appVersion`, `device`, `date`, `captureMethod`, `simulatedConditions`, and a list of files/actions. Include whether access requires login or purchase. Use `unknown` rather than guessing and resolve it before public use.

## Observed simulator timing issue

A static simulator screen may produce a file shorter than the wall-clock recording time. Make one ordinary UI transition after the intended hold, then stop and inspect the actual file duration. This pipeline decodes before trimming so sparse frames can be normalized correctly. Never assume a 15-second terminal wait means 15 seconds of usable video.
