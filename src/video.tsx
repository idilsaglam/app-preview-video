import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import type { RenderProps } from './types';

const Caption = ({
  text,
  accent,
  store,
}: {
  text: string;
  accent: string;
  store: boolean;
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(f, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        transform: `translateY(${interpolate(f, [0, 12], [16, 0], { extrapolateRight: 'clamp' })}px)`,
        fontSize: store ? 38 : 46,
        fontWeight: 650,
        lineHeight: 1.2,
        letterSpacing: -1,
        color: store ? '#fff' : accent,
        textAlign: 'center',
        padding: store ? '24px 30px' : '0 12px',
        background: store ? 'rgba(8,18,15,.94)' : 'transparent',
        borderRadius: store ? 18 : 0,
      }}
    >
      {text}
    </div>
  );
};

export const AppVideo = ({ plan, clips, music, logo }: RenderProps) => {
  const frame = useCurrentFrame();
  const store = plan.mode === 'app-store';
  const design = plan.design ?? {};
  const appLayout = !store && design.layout === 'app';
  const ink = design.textColor ?? '#f6f5eb';
  const decorations = design.decorations ?? true;
  const logoSize = design.logoSize ?? 58;
  const total = Math.round(
    plan.scenes.reduce((n, s) => n + s.duration, 0) * 30,
  );
  let offset = 0;
  return (
    <AbsoluteFill
      style={{
        background: store ? '#0b1511' : plan.background,
        color: ink,
        fontFamily: design.fontFamily ?? 'Arial, Helvetica, sans-serif',
      }}
    >
      {!store && (
        <>
          {decorations && (
            <div
              style={{
                position: 'absolute',
                top: -200,
                right: -360,
                width: 1000,
                height: 1000,
                border: `1px solid ${plan.accent}33`,
                borderRadius: '50%',
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              top: appLayout ? 56 : 88,
              left: 70,
              right: 70,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontSize: appLayout ? 48 : 28,
              letterSpacing: appLayout ? -1.5 : 4,
              fontWeight: appLayout ? 700 : 400,
              textTransform: appLayout ? 'none' : 'uppercase',
            }}
          >
            {logo && (
              <Img
                src={staticFile(logo)}
                style={{
                  width: logoSize,
                  height: logoSize,
                  objectFit: 'contain',
                  borderRadius: appLayout ? 24 : 0,
                }}
              />
            )}
            {!logo && (
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: plan.accent,
                  borderRadius: 20,
                }}
              />
            )}
            {plan.appName}
          </div>
          <div
            style={{
              position: 'absolute',
              top: appLayout ? 218 : 168,
              left: 70,
              right: 70,
              fontSize: appLayout ? 68 : 80,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: appLayout ? -2.5 : -4,
            }}
          >
            {frame >= total - 90 && plan.cta ? plan.cta : plan.headline}
          </div>
        </>
      )}
      {plan.scenes.map((scene, i) => {
        const from = offset;
        const duration = Math.round(scene.duration * 30);
        offset += duration;
        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <div
              style={
                store
                  ? { position: 'absolute', inset: 0 }
                  : {
                      position: 'absolute',
                      left: appLayout ? 230 : 252,
                      top: appLayout ? 364 : 425,
                      width: appLayout ? 620 : 576,
                      height: appLayout ? 1344 : 1248,
                      border: `3px solid ${design.frameColor ?? '#304b41'}`,
                      borderRadius: design.frameRadius ?? 52,
                      overflow: 'hidden',
                      boxShadow: appLayout
                        ? '0 18px 50px #0000000d'
                        : '0 38px 90px #0007',
                    }
              }
            >
              <OffthreadVideo
                src={staticFile(clips[i])}
                muted={!plan.sourceAudio}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                left: store ? 30 : 70,
                right: store ? 30 : 70,
                bottom: store ? 140 : appLayout ? 116 : 160,
              }}
            >
              <Caption
                text={scene.caption}
                accent={appLayout ? ink : plan.accent}
                store={store}
              />
            </div>
          </Sequence>
        );
      })}
      {appLayout && (
        <Sequence from={Math.max(0, total - 90)} durationInFrames={90}>
          <AbsoluteFill
            style={{
              background: plan.background,
              color: ink,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 90,
              textAlign: 'center',
              opacity: interpolate(frame, [total - 90, total - 78], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {logo && (
              <Img
                src={staticFile(logo)}
                style={{
                  width: 300,
                  height: 300,
                  objectFit: 'contain',
                  borderRadius: 48,
                  marginBottom: 40,
                }}
              />
            )}
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                letterSpacing: -2,
                marginBottom: 36,
              }}
            >
              {plan.appName}
            </div>
            <div
              style={{
                fontSize: 76,
                fontWeight: 700,
                letterSpacing: -3,
                lineHeight: 1.08,
              }}
            >
              {plan.cta || plan.headline}
            </div>
          </AbsoluteFill>
        </Sequence>
      )}
      {music && <Audio src={staticFile(music)} volume={0.18} />}
      <div
        style={{
          position: 'absolute',
          bottom: store ? 40 : 80,
          left: 40,
          right: 40,
          textAlign: 'center',
          fontSize: store ? 26 : 24,
          color: store ? 'white' : (design.mutedColor ?? '#e7efe3'),
          background: store ? '#102019e8' : 'transparent',
          padding: store ? 12 : 0,
          lineHeight: 1.3,
        }}
      >
        {plan.disclosure || (store || appLayout ? '' : plan.cta)}
        {plan.fictional && !plan.disclosure.toLowerCase().includes('fictional')
          ? ' · Fictional demo'
          : ''}
      </div>
      {!store && decorations && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 5,
            width: `${(100 * (frame + 1)) / total}%`,
            background: plan.accent,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
