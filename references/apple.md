# App Store preset

Verified 2026-11-11 against [Apple's specification](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications) and [creative guidance](https://developer.apple.com/app-store/app-previews/). Recheck before submission; this is a dated preset, not a permanent guarantee.

v1 supports modern iPhone portrait only: 886 × 1920, 30 fps, 15–30 seconds, at most 500 MB. H.264 MP4 uses progressive High profile level 4.0, 11 Mbps target (Apple target 10–12), stereo AAC 48 kHz/256 kbps target. Encoder average bitrate varies with content, especially silence and static screens; the report exposes observed values rather than falsely failing low-complexity content. Add silent stereo if there is no audio.

Apple describes device-captured app footage. This workflow uses physical-device capture for real submission-oriented previews. Simulator/synthetic drafts can test encoding but remain development examples. Never claim a pass for content policy based on FFprobe.

Show actual app functionality, use readable captions, disclose login/subscription/in-app-purchase access when shown, and verify rights to every asset. Keep the preview understandable muted. Avoid prices, dates, seasonal promises, outside-the-app footage and misleading transitions. Review the selected display target in App Store Connect before upload. Poster PNG is a reference image; also record the desired frame timestamp (default here: 5 seconds) for selecting the poster in App Store Connect.

The technical report checks codec, container, dimensions, duration, frame rate, pixel format, audio, file size and profile. It does not prove constant frame timing for arbitrary third-party files, absence of private information, content rights, accessibility, or Apple acceptance. Generated final exports use explicit CFR encoding. Manual review and Apple acceptance are separate statuses.
