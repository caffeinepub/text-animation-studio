import type { Segment } from "../types";

function msToSrtTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mm = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(mm).padStart(3, "0")}`;
}

function msToVttTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mm = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(mm).padStart(3, "0")}`;
}

export function exportSRT(segments: Segment[]): void {
  const lines: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    lines.push(String(i + 1));
    lines.push(
      `${msToSrtTime(seg.startMs)} --> ${msToSrtTime(seg.startMs + seg.durationMs)}`,
    );
    lines.push(seg.text);
    lines.push("");
  }
  downloadFile(lines.join("\n"), "subtitles.srt", "text/srt");
}

export function exportVTT(segments: Segment[]): void {
  const lines = ["WEBVTT", ""];
  for (const seg of segments) {
    lines.push(
      `${msToVttTime(seg.startMs)} --> ${msToVttTime(seg.startMs + seg.durationMs)}`,
    );
    lines.push(seg.text);
    lines.push("");
  }
  downloadFile(lines.join("\n"), "subtitles.vtt", "text/vtt");
}

export function exportJSON(data: object): void {
  downloadFile(
    JSON.stringify(data, null, 2),
    "animation-project.json",
    "application/json",
  );
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
