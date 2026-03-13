import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Clock, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Segment } from "../types";
import { ANIMATION_PRESETS } from "../types";

interface Props {
  segments: Segment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onSplit: (text: string, mode: "sentence" | "line" | "word") => void;
  onUpdateDuration: (id: string, durationMs: number) => void;
  onAdd: (text: string) => void;
}

function msToTimecode(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  const mm = ms % 1000;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(Math.floor(mm / 100)).padStart(1, "0")}`;
}

export function LeftPanel({
  segments,
  selectedId,
  onSelect,
  onDelete,
  onSplit,
  onUpdateDuration,
  onAdd,
}: Props) {
  const [inputText, setInputText] = useState("");
  const [addText, setAddText] = useState("");

  function handleSplit(mode: "sentence" | "line" | "word") {
    if (!inputText.trim()) return;
    onSplit(inputText, mode);
    setInputText("");
  }

  function handleAdd() {
    if (!addText.trim()) return;
    onAdd(addText.trim());
    setAddText("");
  }

  function getAnimIcon(anim: string): string {
    return ANIMATION_PRESETS.find((a) => a.value === anim)?.icon ?? "◐";
  }

  return (
    <aside className="w-[300px] shrink-0 nle-panel flex flex-col border-r border-border overflow-hidden">
      <div className="px-3 py-2.5 border-b border-border">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Text Input
        </span>
      </div>

      <div className="p-3 space-y-2 border-b border-border">
        <Textarea
          data-ocid="text.textarea"
          placeholder="Paste your script here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="h-24 resize-none text-sm bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex gap-1">
          <Button
            data-ocid="text.split_button"
            size="sm"
            variant="outline"
            className="flex-1 h-6 text-xs"
            onClick={() => handleSplit("sentence")}
          >
            Sentence
          </Button>
          <Button
            data-ocid="text.split_button"
            size="sm"
            variant="outline"
            className="flex-1 h-6 text-xs"
            onClick={() => handleSplit("line")}
          >
            Line
          </Button>
          <Button
            data-ocid="text.split_button"
            size="sm"
            variant="outline"
            className="flex-1 h-6 text-xs"
            onClick={() => handleSplit("word")}
          >
            Word
          </Button>
        </div>
      </div>

      <div className="p-3 border-b border-border">
        <div className="flex gap-1.5">
          <Input
            placeholder="Add single segment..."
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-7 text-xs bg-background border-border"
          />
          <Button
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={handleAdd}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Segments
          </span>
          <Badge variant="secondary" className="text-xs h-4 px-1.5">
            {segments.length}
          </Badge>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {segments.length === 0 && (
              <div
                data-ocid="segment.empty_state"
                className="text-center py-8 text-xs text-muted-foreground"
              >
                No segments yet. Paste text above and split it.
              </div>
            )}
            {segments.map((seg, idx) => (
              <button
                key={seg.id}
                type="button"
                data-ocid={`segment.item.${idx + 1}`}
                className={`segment-clip rounded p-2 cursor-pointer group w-full text-left ${selectedId === seg.id ? "selected" : ""}`}
                onClick={() => onSelect(seg.id)}
                onKeyDown={(e) => e.key === "Enter" && onSelect(seg.id)}
              >
                <div className="flex items-start gap-1.5">
                  <GripVertical className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "oklch(0.72 0.16 200)" }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base leading-none">
                        {getAnimIcon(seg.animation)}
                      </span>
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        {seg.animation}
                      </span>
                    </div>
                    <p className="text-xs text-foreground truncate">
                      {seg.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {msToTimecode(seg.startMs)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                        <input
                          type="number"
                          min={200}
                          max={30000}
                          step={100}
                          value={seg.durationMs}
                          onChange={(e) =>
                            onUpdateDuration(seg.id, Number(e.target.value))
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-14 text-[10px] font-mono bg-transparent border border-border rounded px-1 text-muted-foreground focus:outline-none focus:border-ring"
                        />
                        <span className="text-[10px] text-muted-foreground">
                          ms
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid={`segment.delete_button.${idx + 1}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(seg.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
