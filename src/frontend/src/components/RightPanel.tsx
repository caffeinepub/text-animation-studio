import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Code2, FileText, Film, Info, Zap } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { exportJSON, exportSRT, exportVTT } from "../lib/exportUtils";
import { playSound } from "../lib/soundEngine";
import type {
  AnimationPreset,
  Segment,
  SoundEffect,
  StyleSettings,
  TransitionEffect,
} from "../types";
import { ANIMATION_PRESETS, SOUND_EFFECTS, TRANSITION_EFFECTS } from "../types";

interface Props {
  selectedSegment: Segment | null;
  styleSettings: StyleSettings;
  speedMultiplier: number;
  syncToSpeech: boolean;
  wpm: number;
  allSegments: Segment[];
  projectData: object;
  onStyleChange: (style: Partial<StyleSettings>) => void;
  onSegmentChange: (id: string, updates: Partial<Segment>) => void;
  onSpeedChange: (v: number) => void;
  onSyncSpeech: (enabled: boolean, wpm: number) => void;
  onRecordWebM: () => void;
}

const FONT_FAMILIES = [
  "Impact",
  "Inter",
  "Georgia",
  "Courier New",
  "Arial",
  "Bebas Neue",
];

export function RightPanel({
  selectedSegment,
  styleSettings,
  speedMultiplier,
  syncToSpeech,
  wpm,
  allSegments,
  projectData,
  onStyleChange,
  onSegmentChange,
  onSpeedChange,
  onSyncSpeech,
  onRecordWebM,
}: Props) {
  const wpmRef = useRef(wpm);
  wpmRef.current = wpm;

  function handleExportSRT() {
    exportSRT(allSegments);
    toast.success("SRT file exported");
  }
  function handleExportVTT() {
    exportVTT(allSegments);
    toast.success("VTT file exported");
  }
  function handleExportJSON() {
    exportJSON(projectData);
    toast.success("JSON exported");
  }

  return (
    <aside className="w-[320px] shrink-0 nle-panel flex flex-col border-l border-border overflow-hidden">
      <Tabs defaultValue="style" className="flex flex-col h-full">
        <TabsList className="shrink-0 rounded-none border-b border-border bg-transparent h-9 px-1 gap-0">
          {(["style", "animation", "sound", "export"] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              data-ocid={`panel.${tab}.tab`}
              className="flex-1 rounded-none text-xs h-full data-[state=active]:bg-transparent data-[state=active]:border-b-2 capitalize"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* STYLE TAB */}
        <TabsContent value="style" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <Section title="Typography">
                <Field label="Font Family">
                  <Select
                    value={styleSettings.fontFamily}
                    onValueChange={(v) => onStyleChange({ fontFamily: v })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((f) => (
                        <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={`Font Size: ${styleSettings.fontSize}px`}>
                  <Slider
                    min={16}
                    max={120}
                    step={2}
                    value={[styleSettings.fontSize]}
                    onValueChange={([v]) => onStyleChange({ fontSize: v })}
                  />
                </Field>
                <Field label="Text Alignment">
                  <div className="flex gap-1">
                    {(["left", "center", "right"] as const).map((a) => (
                      <Button
                        key={a}
                        size="sm"
                        variant={
                          styleSettings.textAlign === a ? "default" : "outline"
                        }
                        className="flex-1 h-6 text-xs"
                        onClick={() => onStyleChange({ textAlign: a })}
                      >
                        {a[0].toUpperCase() + a.slice(1)}
                      </Button>
                    ))}
                  </div>
                </Field>
              </Section>

              <Section title="Colors">
                <Field label="Text Color">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styleSettings.textColor}
                      onChange={(e) =>
                        onStyleChange({ textColor: e.target.value })
                      }
                      className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent"
                    />
                    <Input
                      value={styleSettings.textColor}
                      onChange={(e) =>
                        onStyleChange({ textColor: e.target.value })
                      }
                      className="flex-1 h-7 text-xs font-mono"
                    />
                  </div>
                </Field>
                <Field label={`Outline Width: ${styleSettings.strokeWidth}px`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={styleSettings.strokeColor}
                      onChange={(e) =>
                        onStyleChange({ strokeColor: e.target.value })
                      }
                      className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent shrink-0"
                    />
                    <Slider
                      min={0}
                      max={10}
                      step={0.5}
                      value={[styleSettings.strokeWidth]}
                      onValueChange={([v]) => onStyleChange({ strokeWidth: v })}
                    />
                  </div>
                </Field>
              </Section>

              <Section title="Shadow">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Enable Shadow</Label>
                  <Switch
                    checked={styleSettings.shadowEnabled}
                    onCheckedChange={(v) => onStyleChange({ shadowEnabled: v })}
                  />
                </div>
                {styleSettings.shadowEnabled && (
                  <>
                    <Field label={`Blur: ${styleSettings.shadowBlur}px`}>
                      <Slider
                        min={0}
                        max={60}
                        value={[styleSettings.shadowBlur]}
                        onValueChange={([v]) =>
                          onStyleChange({ shadowBlur: v })
                        }
                      />
                    </Field>
                    <Field label={`Offset Y: ${styleSettings.shadowOffsetY}px`}>
                      <Slider
                        min={-20}
                        max={20}
                        value={[styleSettings.shadowOffsetY]}
                        onValueChange={([v]) =>
                          onStyleChange({ shadowOffsetY: v })
                        }
                      />
                    </Field>
                  </>
                )}
              </Section>

              <Section title="Background">
                <Field label="Background Type">
                  <div className="flex gap-1">
                    {(["none", "solid", "blur"] as const).map((b) => (
                      <Button
                        key={b}
                        size="sm"
                        variant={
                          styleSettings.backgroundType === b
                            ? "default"
                            : "outline"
                        }
                        className="flex-1 h-6 text-xs"
                        onClick={() => onStyleChange({ backgroundType: b })}
                      >
                        {b[0].toUpperCase() + b.slice(1)}
                      </Button>
                    ))}
                  </div>
                </Field>
                {styleSettings.backgroundType !== "none" && (
                  <Field label="Background Color">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styleSettings.backgroundColor.slice(0, 7)}
                        onChange={(e) =>
                          onStyleChange({ backgroundColor: e.target.value })
                        }
                        className="w-8 h-7 rounded cursor-pointer border border-border bg-transparent"
                      />
                      <Input
                        value={styleSettings.backgroundColor}
                        onChange={(e) =>
                          onStyleChange({ backgroundColor: e.target.value })
                        }
                        className="flex-1 h-7 text-xs font-mono"
                      />
                    </div>
                  </Field>
                )}
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ANIMATION TAB */}
        <TabsContent value="animation" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              {!selectedSegment && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Select a segment to edit its animation
                </p>
              )}
              {selectedSegment && (
                <>
                  <Section title="Animation Preset">
                    <div className="grid grid-cols-2 gap-1">
                      {ANIMATION_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() =>
                            onSegmentChange(selectedSegment.id, {
                              animation: preset.value as AnimationPreset,
                            })
                          }
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-all ${
                            selectedSegment.animation === preset.value
                              ? "text-[#0a0a0f] font-medium"
                              : "text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted"
                          }`}
                          style={
                            selectedSegment.animation === preset.value
                              ? {
                                  background: "oklch(0.72 0.16 200)",
                                  color: "#0a0a0f",
                                }
                              : {}
                          }
                        >
                          <span className="text-sm">{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </Section>
                  <Section title="Transition">
                    <div className="grid grid-cols-2 gap-1">
                      {TRANSITION_EFFECTS.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() =>
                            onSegmentChange(selectedSegment.id, {
                              transition: t.value as TransitionEffect,
                            })
                          }
                          className={`px-2 py-1.5 rounded text-xs transition-all ${
                            selectedSegment.transition === t.value
                              ? "text-[#0a0a0f] font-medium"
                              : "text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted"
                          }`}
                          style={
                            selectedSegment.transition === t.value
                              ? {
                                  background: "oklch(0.65 0.18 195)",
                                  color: "#0a0a0f",
                                }
                              : {}
                          }
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </Section>
                </>
              )}
              <Section title="Playback Speed">
                <Field label={`Speed: ${speedMultiplier.toFixed(2)}x`}>
                  <Slider
                    min={0.25}
                    max={3}
                    step={0.05}
                    value={[speedMultiplier]}
                    onValueChange={([v]) => onSpeedChange(v)}
                  />
                </Field>
              </Section>
              <Section title="Speech Sync">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Sync to Speech</Label>
                  <Switch
                    checked={syncToSpeech}
                    onCheckedChange={(v) => onSyncSpeech(v, wpmRef.current)}
                  />
                </div>
                {syncToSpeech && (
                  <Field label="Words Per Minute">
                    <div className="flex items-center gap-2">
                      <Slider
                        min={60}
                        max={300}
                        step={5}
                        value={[wpm]}
                        onValueChange={([v]) => onSyncSpeech(true, v)}
                        className="flex-1"
                      />
                      <span className="text-xs font-mono w-8 text-right">
                        {wpm}
                      </span>
                    </div>
                  </Field>
                )}
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* SOUND TAB */}
        <TabsContent value="sound" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              {!selectedSegment && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Select a segment to assign a sound
                </p>
              )}
              {selectedSegment && (
                <Section title="Sound Effect">
                  <div className="space-y-1">
                    {SOUND_EFFECTS.map((sf) => (
                      <div
                        key={sf.value}
                        className={`flex items-center justify-between px-2 py-2 rounded transition-all ${
                          selectedSegment.soundEffect === sf.value
                            ? "text-[#0a0a0f]"
                            : "text-muted-foreground bg-muted/20"
                        }`}
                        style={
                          selectedSegment.soundEffect === sf.value
                            ? {
                                background: "oklch(0.72 0.16 200)",
                                color: "#0a0a0f",
                              }
                            : {}
                        }
                      >
                        <button
                          type="button"
                          className="flex-1 text-xs text-left"
                          onClick={() =>
                            onSegmentChange(selectedSegment.id, {
                              soundEffect: sf.value as SoundEffect,
                            })
                          }
                        >
                          {sf.label}
                        </button>
                        {sf.value !== "none" && (
                          <button
                            type="button"
                            className="text-xs px-2 py-0.5 rounded hover:opacity-80 ml-2"
                            style={
                              selectedSegment.soundEffect === sf.value
                                ? { background: "rgba(0,0,0,0.2)" }
                                : {
                                    background: "oklch(0.2 0.01 260)",
                                    color: "oklch(0.72 0.16 200)",
                                  }
                            }
                            onClick={() => playSound(sf.value as SoundEffect)}
                          >
                            ▶ Preview
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* EXPORT TAB */}
        <TabsContent value="export" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              <Section title="Subtitle Files">
                <div className="space-y-2">
                  <Button
                    data-ocid="export.primary_button"
                    className="w-full h-8 text-xs gap-2 justify-start"
                    style={{
                      background: "oklch(0.72 0.16 200)",
                      color: "#0a0a0f",
                    }}
                    onClick={handleExportSRT}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Export SRT Subtitle File
                  </Button>
                  <Button
                    data-ocid="export.secondary_button"
                    variant="outline"
                    className="w-full h-8 text-xs gap-2 justify-start"
                    onClick={handleExportVTT}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Export VTT WebVTT File
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-8 text-xs gap-2 justify-start"
                    onClick={handleExportJSON}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Export JSON Data
                  </Button>
                </div>
              </Section>

              <Section title="Video Export">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-8 text-xs gap-2 justify-start"
                        onClick={onRecordWebM}
                      >
                        <Film className="w-3.5 h-3.5" />
                        Record WebM Video
                        <Info className="w-3 h-3 ml-auto text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-56 text-xs">
                      Records the canvas as a WebM video. For transparent
                      background compositing in DaVinci Resolve or Premiere Pro,
                      use a dark background and set blend mode to Screen or Add
                      in your NLE.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Section>

              <Section title="NLE Integration">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="davinci" className="border-border">
                    <AccordionTrigger className="text-xs py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Zap
                          className="w-3 h-3"
                          style={{ color: "oklch(0.72 0.16 200)" }}
                        />
                        DaVinci Resolve
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pb-3">
                      <p>
                        <strong className="text-foreground">
                          SRT/VTT Subtitles:
                        </strong>{" "}
                        In the Edit page, go to Timeline &gt; Import Subtitle.
                        Position on timeline and customize in the Inspector.
                      </p>
                      <p>
                        <strong className="text-foreground">WebM Video:</strong>{" "}
                        Import into Media Pool. Drag above your main clip. In
                        Inspector, set Composite Mode to Screen to make black
                        transparent.
                      </p>
                      <p>
                        <strong className="text-foreground">JSON Data:</strong>{" "}
                        Use with Fusion's Text+ nodes for maximum control via
                        Lua or Python scripting.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="premiere" className="border-border">
                    <AccordionTrigger className="text-xs py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Zap
                          className="w-3 h-3"
                          style={{ color: "oklch(0.65 0.18 195)" }}
                        />
                        Adobe Premiere Pro
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pb-3">
                      <p>
                        <strong className="text-foreground">
                          SRT Subtitles:
                        </strong>{" "}
                        File &gt; Import, place .srt on your timeline. Style in
                        the Text panel.
                      </p>
                      <p>
                        <strong className="text-foreground">WebM Video:</strong>{" "}
                        Import into project bin. Place above footage. In Effect
                        Controls, set Blend Mode to Screen for black key.
                      </p>
                      <p>
                        <strong className="text-foreground">
                          After Effects:
                        </strong>{" "}
                        Export JSON, use with AE scripting or Motion Bro to
                        drive text layers.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="fcpx" className="border-border">
                    <AccordionTrigger className="text-xs py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Zap
                          className="w-3 h-3"
                          style={{ color: "oklch(0.7 0.13 50)" }}
                        />
                        Final Cut Pro
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground space-y-1.5 pb-3">
                      <p>
                        <strong className="text-foreground">WebM Video:</strong>{" "}
                        Convert to ProRes with Handbrake first, then import. Use
                        Blend Mode Screen in the Video inspector.
                      </p>
                      <p>
                        <strong className="text-foreground">Captions:</strong>{" "}
                        Use VTT export. File &gt; Import Captions in FCP for
                        timed text display.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Section>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
          {title}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
