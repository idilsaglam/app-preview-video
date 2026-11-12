import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { AppVideo } from './video';
import { DemoRecording } from './sample';
import { TutorialTeaser } from './teaser';
import type { RenderProps } from './types';

const defaults: RenderProps = {
  plan: {
    mode: 'launch',
    appName: 'Pocket Trails',
    language: 'en',
    accent: '#c4f273',
    background: '#102c24',
    headline: 'A little more outside.',
    cta: 'Find your next small adventure',
    disclosure: 'Fictional demo — not a released app',
    fictional: true,
    provenance: 'synthetic',
    capture: {
      appVersion: 'demo',
      device: 'generated',
      date: '2026-11-11',
      simulatedConditions: 'Entire fictional interface',
    },
    sourceAudio: false,
    scenes: [
      {
        file: 'sample.mp4',
        start: 0,
        duration: 30,
        caption: 'A fictional app. A real editing workflow.',
        evidence: 'Generated demonstration',
      },
    ],
  },
  clips: ['sample.mp4'],
};

const Root = () => (
  <>
    <Composition
      id="AppVideo"
      component={AppVideo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={900}
      defaultProps={defaults}
      calculateMetadata={({ props }) => ({
        width: props.plan.mode === 'app-store' ? 886 : 1080,
        height: 1920,
        fps: 30,
        durationInFrames: Math.round(
          props.plan.scenes.reduce((s, x) => s + x.duration, 0) * 30,
        ),
      })}
    />
    <Composition
      id="DemoRecording"
      component={DemoRecording}
      width={886}
      height={1920}
      fps={30}
      durationInFrames={900}
    />
    <Composition
      id="TutorialTeaser"
      component={TutorialTeaser}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1050}
      defaultProps={{
        appName: 'Pocket Trails (fictional)',
        raw: 'sample.mp4',
        edited: 'sample.mp4',
        technicalPassed: false,
        provenance: 'synthetic',
      }}
    />
  </>
);
registerRoot(Root);
