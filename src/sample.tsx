import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const Map = ({ progress }: { progress: number }) => (
  <svg
    viewBox="0 0 760 650"
    style={{
      width: '100%',
      height: 600,
      background: '#dce8cf',
      borderRadius: 32,
    }}
  >
    <path
      d="M-40 150 Q160 300 250 150 T800 130 M20 580 Q180 380 450 460 T830 330"
      fill="none"
      stroke="#b6cdb9"
      strokeWidth="100"
    />
    <path
      d="M70 0 L220 650 M370 0 L460 650 M0 260 L760 380 M0 520 L760 540"
      fill="none"
      stroke="#f9f6e9"
      strokeWidth="24"
    />
    <path
      d="M180 480 C230 390 380 430 400 310 S510 210 590 160"
      fill="none"
      stroke="#366e51"
      strokeWidth="10"
      strokeDasharray="15 10"
    />
    {[
      [180, 480],
      [400, 310],
      [590, 160],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle
          cx={x}
          cy={y}
          r={i === 1 ? 28 + 4 * Math.sin(progress / 8) : 25}
          fill="#244b39"
        />
        <text
          x={x}
          y={y + 9}
          textAnchor="middle"
          fill="white"
          fontSize="25"
          fontFamily="Arial"
        >
          {i + 1}
        </text>
      </g>
    ))}
    <rect x="38" y="35" width="238" height="55" rx="28" fill="#fffdf0" />
    <text x="64" y="71" fill="#244b39" fontSize="23" fontFamily="Arial">
      Illustrative map
    </text>
  </svg>
);

export const DemoRecording = () => {
  const f = useCurrentFrame();
  const stage = Math.min(3, Math.floor(f / 225));
  const local = f % 225;
  const alpha = interpolate(local, [0, 12], [0.4, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{
        background: '#f6f3e9',
        color: '#203b2b',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '64px 54px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        <span>9:41</span>
        <span>●●● ▰</span>
      </div>
      <div
        style={{
          marginTop: 64,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 29, fontWeight: 700, letterSpacing: 2 }}>
          POCKET TRAILS
        </span>
        <span
          style={{
            background: '#dce8cf',
            padding: '13px 22px',
            borderRadius: 40,
            fontSize: 22,
          }}
        >
          DEMO
        </span>
      </div>
      <div style={{ marginTop: 66, opacity: alpha }}>
        <div
          style={{
            fontSize: 23,
            textTransform: 'uppercase',
            letterSpacing: 4,
            color: '#64816a',
            marginBottom: 20,
          }}
        >
          {
            [
              'YOUR NEXT SMALL ADVENTURE',
              'THE GARDEN LOOP',
              'A MOMENT TO NOTICE',
              'YOUR TRAIL JOURNAL',
            ][stage]
          }
        </div>
        <h1
          style={{
            fontSize: 76,
            lineHeight: 1.04,
            letterSpacing: -3,
            margin: '0 0 36px',
          }}
        >
          {[
            'Go somewhere\ncloser.',
            'One loop.\nThree discoveries.',
            'Look a little\ncloser.',
            'A small walk.\nA good day.',
          ][stage]
            .split('\n')
            .map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <br />}
                {s}
              </React.Fragment>
            ))}
        </h1>
        {stage < 2 ? (
          <Map progress={local} />
        ) : stage === 2 ? (
          <div
            style={{
              height: 600,
              borderRadius: 32,
              background: '#dce8cf',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <svg viewBox="0 0 500 500" width="520">
              <path
                d="M250 420V160 M250 310C80 300 70 160 110 100C240 100 280 200 250 310 M250 230C400 250 460 100 410 60C280 50 240 130 250 230"
                fill="#71966a"
                stroke="#244b39"
                strokeWidth="10"
              />
            </svg>
          </div>
        ) : (
          <div
            style={{
              height: 600,
              borderRadius: 32,
              background: '#244b39',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#eff3df',
            }}
          >
            <div
              style={{
                border: '3px solid #c4f273',
                borderRadius: '50%',
                width: 260,
                height: 260,
                display: 'grid',
                placeItems: 'center',
                fontSize: 110,
                color: '#c4f273',
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 44, marginTop: 30 }}>Garden Loop</div>
            <div style={{ fontSize: 26, marginTop: 16 }}>
              Fictional completion
            </div>
          </div>
        )}
        <div
          style={{
            background: 'white',
            borderRadius: 28,
            padding: 32,
            marginTop: 30,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 700 }}>
            {
              [
                'The Garden Loop',
                'A gentle route nearby',
                'Find the leaf shapes',
                'One trail collected',
              ][stage]
            }
          </div>
          <div
            style={{
              fontSize: 27,
              lineHeight: 1.4,
              color: '#68806b',
              marginTop: 14,
            }}
          >
            {
              [
                '3 stops · 20 minutes · Easy',
                'Follow three stops on this illustrated map.',
                'Pause and notice what grows around you.',
                'A sample journal entry for this demo.',
              ][stage]
            }
          </div>
        </div>
        <div
          style={{
            marginTop: 30,
            padding: 28,
            textAlign: 'center',
            fontSize: 29,
            fontWeight: 700,
            borderRadius: 23,
            background: '#244b39',
            color: 'white',
          }}
        >
          {
            [
              'Explore this trail',
              'View the first stop',
              'Save this discovery',
              'Back to trails',
            ][stage]
          }
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 105,
          left: 54,
          right: 54,
          borderTop: '1px solid #ccd5c5',
          paddingTop: 30,
          display: 'flex',
          justifyContent: 'space-around',
          fontSize: 25,
        }}
      >
        <b>Explore</b>
        <span>Journal</span>
        <span>Profile</span>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 35,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 21,
          color: '#6a7e67',
        }}
      >
        FICTIONAL INTERFACE · GENERATED DEMONSTRATION
      </div>
    </AbsoluteFill>
  );
};
