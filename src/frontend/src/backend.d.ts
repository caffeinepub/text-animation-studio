import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StyleSettings {
    backgroundColor: string;
    shadow: boolean;
    fontFamily: string;
    fontSize: bigint;
    outline: boolean;
    textColor: string;
}
export interface AnimationProject {
    title: string;
    createdAt: Time;
    textSegments: Array<TextSegment>;
    styleSettings: StyleSettings;
}
export type Time = bigint;
export interface TextSegment {
    soundEffect: string;
    content: string;
    startTimeMs: bigint;
    transitionEffect: string;
    styleOverrides: string;
    animationPreset: string;
    durationMs: bigint;
}
export interface backendInterface {
    createProject(title: string, textSegments: Array<TextSegment>, styleSettings: StyleSettings): Promise<void>;
    deleteProject(title: string): Promise<void>;
    getProject(title: string): Promise<AnimationProject>;
    listProjects(): Promise<Array<AnimationProject>>;
    updateProject(title: string, newTextSegments: Array<TextSegment>, newStyleSettings: StyleSettings): Promise<void>;
}
