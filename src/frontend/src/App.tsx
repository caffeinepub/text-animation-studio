import { Toaster } from "@/components/ui/sonner";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import type { AnimationProject } from "./backend.d";
import { LeftPanel } from "./components/LeftPanel";
import { PreviewCanvas } from "./components/PreviewCanvas";
import { RightPanel } from "./components/RightPanel";
import { TopBar } from "./components/TopBar";
import { useProjectManager } from "./hooks/useProjectManager";
import {
  useCreateProject,
  useListProjects,
  useUpdateProject,
} from "./hooks/useQueries";
import type { Segment } from "./types";

export default function App() {
  const pm = useProjectManager();
  const { data: savedProjects = [] } = useListProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  const handleSave = useCallback(async () => {
    const title = pm.project.name;
    const textSegments = pm.project.segments.map((s) => ({
      soundEffect: s.soundEffect,
      content: s.text,
      startTimeMs: BigInt(s.startMs),
      transitionEffect: s.transition,
      styleOverrides: "",
      animationPreset: s.animation,
      durationMs: BigInt(s.durationMs),
    }));
    const st = pm.project.styleSettings;
    const styleSettings = {
      backgroundColor: st.backgroundColor,
      shadow: st.shadowEnabled,
      fontFamily: st.fontFamily,
      fontSize: BigInt(st.fontSize),
      outline: st.strokeWidth > 0,
      textColor: st.textColor,
    };

    const exists = savedProjects.some((p) => p.title === title);
    if (exists) {
      await updateProject.mutateAsync({
        title,
        newTextSegments: textSegments,
        newStyleSettings: styleSettings,
      });
    } else {
      await createProject.mutateAsync({ title, textSegments, styleSettings });
    }
    localStorage.setItem("textmotion-backup", JSON.stringify(pm.project));
  }, [pm.project, savedProjects, createProject, updateProject]);

  const handleLoad = useCallback(
    (backendProject: AnimationProject) => {
      const segments: Segment[] = backendProject.textSegments.map((seg, i) => ({
        id: `loaded-${i}-${Date.now()}`,
        text: seg.content,
        startMs: Number(seg.startTimeMs),
        durationMs: Number(seg.durationMs),
        animation: seg.animationPreset as Segment["animation"],
        transition: seg.transitionEffect as Segment["transition"],
        soundEffect: seg.soundEffect as Segment["soundEffect"],
      }));
      pm.setProject((prev) => ({
        ...prev,
        name: backendProject.title,
        segments,
        styleSettings: {
          ...prev.styleSettings,
          fontFamily: backendProject.styleSettings.fontFamily,
          fontSize: Number(backendProject.styleSettings.fontSize),
          textColor: backendProject.styleSettings.textColor,
          shadowEnabled: backendProject.styleSettings.shadow,
          backgroundColor: backendProject.styleSettings.backgroundColor,
        },
      }));
      toast.success(`Loaded "${backendProject.title}"`);
    },
    [pm],
  );

  async function handleRecordWebM() {
    const canvas = document.querySelector<HTMLCanvasElement>(
      "[data-ocid='preview.canvas_target']",
    );
    if (!canvas) {
      toast.error("Canvas not found");
      return;
    }
    if (!window.MediaRecorder) {
      toast.error("MediaRecorder not supported in this browser");
      return;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      toast.info("Recording stopped");
      return;
    }

    try {
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      recordingChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pm.project.name.replace(/\s+/g, "-")}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("WebM saved!");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      toast.success("Recording started — click Record again to stop");
    } catch (e) {
      toast.error(`Recording failed: ${String(e)}`);
    }
  }

  const isSaving = createProject.isPending || updateProject.isPending;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Toaster position="top-right" theme="dark" />

      <TopBar
        project={pm.project}
        onNameChange={pm.updateProjectName}
        onSave={handleSave}
        onLoad={handleLoad}
        savedProjects={savedProjects}
        isSaving={isSaving}
      />

      <main className="flex-1 flex overflow-hidden">
        <LeftPanel
          segments={pm.project.segments}
          selectedId={pm.selectedSegmentId}
          onSelect={pm.setSelectedSegmentId}
          onDelete={pm.deleteSegment}
          onSplit={pm.splitText}
          onUpdateDuration={(id, ms) =>
            pm.updateSegment(id, { durationMs: ms })
          }
          onAdd={pm.addSegment}
        />

        <PreviewCanvas
          segments={pm.project.segments}
          selectedId={pm.selectedSegmentId}
          styleSettings={pm.project.styleSettings}
          totalDurationMs={pm.totalDurationMs}
          onSelectSegment={pm.setSelectedSegmentId}
        />

        <RightPanel
          selectedSegment={pm.selectedSegment}
          styleSettings={pm.project.styleSettings}
          speedMultiplier={pm.project.speedMultiplier}
          syncToSpeech={pm.project.syncToSpeech}
          wpm={pm.project.wpm}
          allSegments={pm.project.segments}
          projectData={pm.project}
          onStyleChange={pm.updateStyle}
          onSegmentChange={pm.updateSegment}
          onSpeedChange={pm.updateSpeed}
          onSyncSpeech={pm.syncSpeech}
          onRecordWebM={handleRecordWebM}
        />
      </main>

      <footer className="shrink-0 border-t border-border px-4 py-1.5 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-mono">
          {pm.project.segments.length} segments ·{" "}
          {Math.round(pm.totalDurationMs / 1000)}s total
        </span>
        <span className="text-[10px] text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </span>
      </footer>
    </div>
  );
}
