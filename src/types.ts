export type Scene = {
  file: string;
  start: number;
  duration: number;
  caption: string;
  evidence: string;
};
export type VideoPlan = {
  mode: 'launch' | 'app-store';
  appName: string;
  language: string;
  accent: string;
  background: string;
  headline: string;
  cta: string;
  disclosure: string;
  fictional: boolean;
  provenance: 'device' | 'simulator' | 'synthetic' | 'unknown';
  capture: {
    appVersion: string;
    device: string;
    date: string;
    simulatedConditions: string;
  };
  sourceAudio: boolean;
  music?: string;
  logo?: string;
  design?: {
    fontFamily?: string;
    textColor?: string;
    mutedColor?: string;
    frameColor?: string;
    frameRadius?: number;
    logoSize?: number;
    decorations?: boolean;
    layout?: 'classic' | 'app';
  };
  scenes: Scene[];
};
export type RenderProps = {
  plan: VideoPlan;
  clips: string[];
  music?: string;
  logo?: string;
};
