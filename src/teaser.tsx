import React from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
export type TeaserProps = {
  appName: string;
  raw: string;
  edited: string;
  technicalPassed: boolean;
  provenance: string;
};
const panel: React.CSSProperties = {
  position: 'absolute',
  top: 460,
  left: 270,
  width: 540,
  height: 1173,
  overflow: 'hidden',
  borderRadius: 30,
  border: '2px solid #678876',
};
export const TutorialTeaser = ({
  appName,
  raw,
  edited,
  technicalPassed,
  provenance,
}: TeaserProps) => {
  const f = useCurrentFrame();
  const stage = f < 150 ? 0 : f < 360 ? 1 : f < 660 ? 2 : f < 840 ? 3 : 4;
  const titles = [
    'From app footage…',
    'An edit you can inspect.',
    '…to a launch video.',
    'Check the actual export.',
    'Build once. Use it again.',
  ];
  return (
    <AbsoluteFill
      style={{
        background: '#102c24',
        color: '#f6f5eb',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: 72,
      }}
    >
      <div style={{ fontSize: 26, letterSpacing: 4, color: '#c4f273' }}>
        BUILDING AN APP VIDEO SKILL
      </div>
      <h1
        style={{
          fontSize: 86,
          lineHeight: 1.04,
          letterSpacing: -4,
          marginTop: 58,
          maxWidth: 900,
        }}
      >
        {titles[stage]}
      </h1>
      <Sequence from={0} durationInFrames={150}>
        <div style={panel}>
          <OffthreadVideo
            muted
            src={staticFile(raw)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </Sequence>
      <Sequence from={150} durationInFrames={210}>
        <div
          style={{
            position: 'absolute',
            top: 540,
            left: 80,
            right: 80,
            background: '#203e32',
            padding: 44,
            borderRadius: 26,
            fontSize: 38,
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              fontSize: 23,
              letterSpacing: 3,
              color: '#c4f273',
              marginBottom: 30,
            }}
          >
            WORKFLOW REPLAY · EXAMPLE PROMPT
          </div>
          “Use the real recordings.
          <br />
          Keep the UI readable.
          <br />
          Render a 30-second launch edit.
          <br />
          Deliver editable source and checks.”
          <hr
            style={{
              border: 0,
              borderTop: '1px solid #678876',
              margin: '40px 0',
            }}
          />
          <div style={{ fontSize: 30, fontFamily: 'monospace' }}>
            footage → scene plan
            <br />→ Remotion → export
          </div>
        </div>
      </Sequence>
      <Sequence from={360} durationInFrames={300}>
        <div style={panel}>
          <OffthreadVideo
            muted
            src={staticFile(edited)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </Sequence>
      <Sequence from={660} durationInFrames={180}>
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            top: 580,
            fontSize: 45,
            lineHeight: 1.35,
          }}
        >
          {[
            [technicalPassed ? 'PASS' : 'FAIL', 'Technical checks'],
            ['PENDING', 'Full human playback review'],
            ['UNVERIFIED', 'Apple acceptance'],
          ].map(([status, label]) => (
            <div
              key={label}
              style={{ padding: '42px 0', borderBottom: '1px solid #678876' }}
            >
              <div
                style={{
                  fontSize: 24,
                  letterSpacing: 3,
                  color: '#c4f273',
                  marginBottom: 16,
                }}
              >
                {status}
              </div>
              {label}
            </div>
          ))}
        </div>
      </Sequence>
      <Sequence from={840} durationInFrames={210}>
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            top: 540,
            display: 'flex',
            gap: 30,
          }}
        >
          {[
            [raw, 'RAW CLIP'],
            [edited, 'EDITED VIDEO'],
          ].map(([src, label]) => (
            <div key={label} style={{ width: 445 }}>
              <div
                style={{
                  fontSize: 23,
                  letterSpacing: 3,
                  marginBottom: 24,
                  color: '#c4f273',
                }}
              >
                {label}
              </div>
              <OffthreadVideo
                muted
                src={staticFile(src)}
                style={{
                  width: 445,
                  height: 966,
                  objectFit: 'contain',
                  borderRadius: 22,
                }}
              />
            </div>
          ))}
        </div>
      </Sequence>
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: 72,
          right: 72,
          fontSize: 36,
          fontWeight: 600,
        }}
      >
        {appName} · editable Remotion project
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 75,
          left: 72,
          right: 72,
          fontSize: 25,
          color: '#c5d7ca',
        }}
      >
        Capture: {provenance} · tutorial draft · no submission
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 6,
          width: `${((f + 1) / 1050) * 100}%`,
          background: '#c4f273',
        }}
      />
    </AbsoluteFill>
  );
};
