import { useCallback, useState } from "react";
import type { Project, Segment, StyleSettings } from "../types";
import { DEFAULT_STYLE } from "../types";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const SAMPLE_SEGMENTS: Segment[] = [
  {
    id: generateId(),
    text: "Welcome to the future",
    startMs: 0,
    durationMs: 2500,
    animation: "slide-up",
    transition: "crossfade",
    soundEffect: "whoosh",
  },
  {
    id: generateId(),
    text: "Where every word comes alive",
    startMs: 2500,
    durationMs: 3000,
    animation: "typewriter",
    transition: "wipe-left",
    soundEffect: "typewriter-click",
  },
  {
    id: generateId(),
    text: "Create stunning text animations",
    startMs: 5500,
    durationMs: 2800,
    animation: "elastic",
    transition: "crossfade",
    soundEffect: "pop",
  },
  {
    id: generateId(),
    text: "Export to DaVinci & Premiere",
    startMs: 8300,
    durationMs: 3200,
    animation: "glitch",
    transition: "cut",
    soundEffect: "glitch",
  },
];

export function useProjectManager() {
  const [project, setProject] = useState<Project>({
    name: "My Animation Project",
    segments: SAMPLE_SEGMENTS,
    styleSettings: DEFAULT_STYLE,
    speedMultiplier: 1,
    syncToSpeech: false,
    wpm: 150,
  });

  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    SAMPLE_SEGMENTS[0]?.id ?? null,
  );

  const updateProjectName = useCallback((name: string) => {
    setProject((p) => ({ ...p, name }));
  }, []);

  const updateStyle = useCallback((style: Partial<StyleSettings>) => {
    setProject((p) => ({
      ...p,
      styleSettings: { ...p.styleSettings, ...style },
    }));
  }, []);

  const addSegment = useCallback((text: string) => {
    const newSeg: Segment = {
      id: generateId(),
      text,
      startMs: 0,
      durationMs: 2000,
      animation: "fade-in",
      transition: "cut",
      soundEffect: "none",
    };
    setProject((p) => {
      const segments = [...p.segments, newSeg];
      // Recalculate start times
      return { ...p, segments: recalcStartTimes(segments) };
    });
    setSelectedSegmentId(newSeg.id);
  }, []);

  const deleteSegment = useCallback((id: string) => {
    setProject((p) => {
      const segments = recalcStartTimes(p.segments.filter((s) => s.id !== id));
      return { ...p, segments };
    });
    setSelectedSegmentId((prev) => (prev === id ? null : prev));
  }, []);

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setProject((p) => {
      const segments = recalcStartTimes(
        p.segments.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
      return { ...p, segments };
    });
  }, []);

  const reorderSegments = useCallback((segments: Segment[]) => {
    setProject((p) => ({ ...p, segments: recalcStartTimes(segments) }));
  }, []);

  const splitText = useCallback(
    (text: string, mode: "sentence" | "line" | "word") => {
      let parts: string[];
      if (mode === "sentence") {
        parts = text
          .match(/[^.!?]+[.!?]*/g)
          ?.map((s) => s.trim())
          .filter(Boolean) ?? [text];
      } else if (mode === "line") {
        parts = text
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        parts = text.split(/\s+/).filter(Boolean);
      }
      const newSegments: Segment[] = parts.map((t) => ({
        id: generateId(),
        text: t,
        startMs: 0,
        durationMs: Math.max(
          1500,
          (t.split(" ").length / project.wpm) * 60000 + 500,
        ),
        animation: "fade-in" as const,
        transition: "cut" as const,
        soundEffect: "none" as const,
      }));
      setProject((p) => ({
        ...p,
        segments: recalcStartTimes([...p.segments, ...newSegments]),
      }));
      if (newSegments.length > 0) setSelectedSegmentId(newSegments[0].id);
    },
    [project.wpm],
  );

  const updateSpeed = useCallback((speedMultiplier: number) => {
    setProject((p) => {
      const ratio = speedMultiplier / p.speedMultiplier;
      const segments = recalcStartTimes(
        p.segments.map((s) => ({
          ...s,
          durationMs: Math.round(s.durationMs / ratio),
        })),
      );
      return { ...p, segments, speedMultiplier };
    });
  }, []);

  const syncSpeech = useCallback((enabled: boolean, wpm: number) => {
    setProject((p) => {
      let segments = p.segments;
      if (enabled) {
        segments = recalcStartTimes(
          p.segments.map((s) => ({
            ...s,
            durationMs: Math.max(
              1000,
              Math.round((s.text.split(" ").length / wpm) * 60000) + 500,
            ),
          })),
        );
      }
      return { ...p, syncToSpeech: enabled, wpm, segments };
    });
  }, []);

  const selectedSegment =
    project.segments.find((s) => s.id === selectedSegmentId) ?? null;
  const totalDurationMs = project.segments.reduce(
    (acc, s) => Math.max(acc, s.startMs + s.durationMs),
    0,
  );

  return {
    project,
    selectedSegment,
    selectedSegmentId,
    setSelectedSegmentId,
    totalDurationMs,
    updateProjectName,
    updateStyle,
    addSegment,
    deleteSegment,
    updateSegment,
    reorderSegments,
    splitText,
    updateSpeed,
    syncSpeech,
    setProject,
  };
}

function recalcStartTimes(segments: Segment[]): Segment[] {
  let time = 0;
  return segments.map((s) => {
    const updated = { ...s, startMs: time };
    time += s.durationMs;
    return updated;
  });
}
