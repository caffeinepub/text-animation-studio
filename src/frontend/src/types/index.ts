export type AnimationPreset =
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "typewriter"
  | "bounce"
  | "zoom-in"
  | "zoom-out"
  | "blur-in"
  | "glitch"
  | "wave"
  | "flip-x"
  | "rotate-in"
  | "elastic"
  | "split";

export type TransitionEffect =
  | "cut"
  | "crossfade"
  | "wipe-left"
  | "wipe-right"
  | "push"
  | "zoom-transition";

export type SoundEffect =
  | "none"
  | "whoosh"
  | "pop"
  | "swipe"
  | "glitch"
  | "cinematic"
  | "typewriter-click";

export type BackgroundType = "none" | "solid" | "blur";
export type TextAlign = "left" | "center" | "right";

export interface Segment {
  id: string;
  text: string;
  startMs: number;
  durationMs: number;
  animation: AnimationPreset;
  transition: TransitionEffect;
  soundEffect: SoundEffect;
}

export interface StyleSettings {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  backgroundType: BackgroundType;
  backgroundColor: string;
  textAlign: TextAlign;
}

export interface Project {
  name: string;
  segments: Segment[];
  styleSettings: StyleSettings;
  speedMultiplier: number;
  syncToSpeech: boolean;
  wpm: number;
}

export const DEFAULT_STYLE: StyleSettings = {
  fontFamily: "Impact",
  fontSize: 64,
  textColor: "#ffffff",
  strokeColor: "#000000",
  strokeWidth: 2,
  shadowEnabled: true,
  shadowBlur: 20,
  shadowOffsetX: 0,
  shadowOffsetY: 4,
  backgroundType: "none",
  backgroundColor: "rgba(0,0,0,0.7)",
  textAlign: "center",
};

export const ANIMATION_PRESETS: {
  value: AnimationPreset;
  label: string;
  icon: string;
}[] = [
  { value: "fade-in", label: "Fade In", icon: "◐" },
  { value: "slide-up", label: "Slide Up", icon: "↑" },
  { value: "slide-down", label: "Slide Down", icon: "↓" },
  { value: "slide-left", label: "Slide Left", icon: "←" },
  { value: "slide-right", label: "Slide Right", icon: "→" },
  { value: "typewriter", label: "Typewriter", icon: "▌" },
  { value: "bounce", label: "Bounce", icon: "⤴" },
  { value: "zoom-in", label: "Zoom In", icon: "⊕" },
  { value: "zoom-out", label: "Zoom Out", icon: "⊖" },
  { value: "blur-in", label: "Blur In", icon: "◎" },
  { value: "glitch", label: "Glitch", icon: "▥" },
  { value: "wave", label: "Wave", icon: "∿" },
  { value: "flip-x", label: "Flip X", icon: "↻" },
  { value: "rotate-in", label: "Rotate In", icon: "↺" },
  { value: "elastic", label: "Elastic", icon: "⤸" },
  { value: "split", label: "Split", icon: "⇕" },
];

export const TRANSITION_EFFECTS: { value: TransitionEffect; label: string }[] =
  [
    { value: "cut", label: "Cut" },
    { value: "crossfade", label: "Crossfade" },
    { value: "wipe-left", label: "Wipe Left" },
    { value: "wipe-right", label: "Wipe Right" },
    { value: "push", label: "Push" },
    { value: "zoom-transition", label: "Zoom" },
  ];

export const SOUND_EFFECTS: { value: SoundEffect; label: string }[] = [
  { value: "none", label: "None" },
  { value: "whoosh", label: "Whoosh" },
  { value: "pop", label: "Pop" },
  { value: "swipe", label: "Swipe" },
  { value: "glitch", label: "Glitch" },
  { value: "cinematic", label: "Cinematic" },
  { value: "typewriter-click", label: "Typewriter Click" },
];
