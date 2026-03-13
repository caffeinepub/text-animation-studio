import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, SkipBack, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeSegmentProgress,
  drawAnimationFrame,
} from "../lib/animationEngine";
import { playSound } from "../lib/soundEngine";
import type { Segment, StyleSettings } from "../types";

const CANVAS_W = 1280;
const CANVAS_H = 720;

interface Props {
  segments: Segment[];
  selectedId: string | null;
  styleSettings: StyleSettings;
  totalDurationMs: number;
  onSelectSegment: (id: string) => void;
}

function msToDisplay(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  const frame = Math.floor((ms % 1000) / 33.3);
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}:${String(frame).padStart(2, "0")}`;
}

export function PreviewCanvas({
  segments,
  selectedId,
  styleSettings,
  totalDurationMs,
  onSelectSegment,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const playedSoundsRef = useRef<Set<string>>(new Set());

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const drawFrame = useCallback(
    (timeMs: number, timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const activeSeg = segments.find(
        (s) => timeMs >= s.startMs && timeMs < s.startMs + s.durationMs,
      );

      if (!activeSeg) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= CANVAS_W; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, CANVAS_H);
          ctx.stroke();
        }
        for (let y = 0; y <= CANVAS_H; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_W, y);
          ctx.stroke();
        }
        return;
      }

      const elapsed = timeMs - activeSeg.startMs;
      const { inProgress, outProgress } = computeSegmentProgress(
        elapsed,
        activeSeg.durationMs,
      );

      drawAnimationFrame(ctx, {
        text: activeSeg.text,
        progress: inProgress,
        outProgress,
        animation: activeSeg.animation,
        style: styleSettings,
        canvasWidth: CANVAS_W,
        canvasHeight: CANVAS_H,
        timestamp,
      });
    },
    [segments, styleSettings],
  );

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    playedSoundsRef.current = new Set();
    function loop(now: number) {
      const dt = lastTimeRef.current ? now - lastTimeRef.current : 16;
      lastTimeRef.current = now;
      setCurrentMs((prev) => {
        const next = prev + dt;
        if (next >= totalDurationMs) {
          setIsPlaying(false);
          return totalDurationMs;
        }
        for (const seg of segments) {
          const key = `${seg.id}-${seg.startMs}`;
          if (
            prev < seg.startMs &&
            next >= seg.startMs &&
            !playedSoundsRef.current.has(key)
          ) {
            playedSoundsRef.current.add(key);
            if (soundEnabled) playSound(seg.soundEffect);
          }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(loop);
    }
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, totalDurationMs, segments, soundEnabled]);

  useEffect(() => {
    const timestamp = performance.now();
    drawFrame(currentMs, timestamp);
  }, [currentMs, drawFrame]);

  useEffect(() => {
    if (isPlaying) return;
    let raf: number;
    function draw(now: number) {
      drawFrame(currentMs, now);
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [currentMs, drawFrame, isPlaying]);

  function handlePlayPause() {
    if (currentMs >= totalDurationMs) setCurrentMs(0);
    setIsPlaying((p) => !p);
  }

  function handleRewind() {
    setIsPlaying(false);
    setCurrentMs(0);
  }

  function handleScrub(value: number[]) {
    setCurrentMs(value[0]);
    const seg = segments.find(
      (s) => value[0] >= s.startMs && value[0] < s.startMs + s.durationMs,
    );
    if (seg) onSelectSegment(seg.id);
  }

  const activeSeg = segments.find(
    (s) => currentMs >= s.startMs && currentMs < s.startMs + s.durationMs,
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#070709]">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Preview Monitor
        </span>
        <div className="flex items-center gap-3">
          {activeSeg && (
            <span className="text-xs text-muted-foreground truncate max-w-40">
              "{activeSeg.text.slice(0, 30)}
              {activeSeg.text.length > 30 ? "..." : ""}"
            </span>
          )}
          <span
            className="font-mono text-xs"
            style={{ color: "oklch(0.72 0.16 200)" }}
          >
            {msToDisplay(currentMs)}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          ref={containerRef}
          className="monitor-frame rounded overflow-hidden w-full"
          style={{
            maxHeight: "calc(100% - 0px)",
            aspectRatio: "16/9",
            maxWidth: "100%",
          }}
        >
          <canvas
            ref={canvasRef}
            data-ocid="preview.canvas_target"
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-full block"
          />
        </div>
      </div>

      <div className="px-4 pb-3 pt-2 border-t border-border space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground w-14">
            {msToDisplay(currentMs)}
          </span>
          <div className="flex-1">
            <Slider
              value={[currentMs]}
              min={0}
              max={Math.max(totalDurationMs, 1)}
              step={50}
              onValueChange={handleScrub}
              className="w-full"
            />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground w-14 text-right">
            {msToDisplay(totalDurationMs)}
          </span>
        </div>

        {totalDurationMs > 0 && (
          <div className="relative h-2 rounded overflow-hidden bg-muted">
            {segments.map((seg) => (
              <button
                key={seg.id}
                type="button"
                aria-label={`Jump to segment: ${seg.text.slice(0, 20)}`}
                className={`absolute top-0 h-full cursor-pointer transition-opacity ${selectedId === seg.id ? "opacity-100" : "opacity-60"}`}
                style={{
                  left: `${(seg.startMs / totalDurationMs) * 100}%`,
                  width: `${(seg.durationMs / totalDurationMs) * 100}%`,
                  background:
                    selectedId === seg.id
                      ? "oklch(0.72 0.16 200)"
                      : "oklch(0.72 0.16 200 / 0.4)",
                  borderRight: "1px solid oklch(0.09 0.006 260)",
                }}
                onClick={() => onSelectSegment(seg.id)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleRewind}
          >
            <SkipBack className="w-3.5 h-3.5" />
          </Button>
          <Button
            data-ocid="preview.primary_button"
            size="sm"
            className="h-8 w-16 gap-1.5 text-xs btn-glow"
            style={{ background: "oklch(0.72 0.16 200)", color: "#0a0a0f" }}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 ${soundEnabled ? "text-foreground" : "text-muted-foreground"}`}
            onClick={() => setSoundEnabled((v) => !v)}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
