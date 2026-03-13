import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Film, FolderOpen, Loader2, Save, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AnimationProject } from "../backend.d";
import type { Project } from "../types";

interface Props {
  project: Project;
  onNameChange: (name: string) => void;
  onSave: () => Promise<void>;
  onLoad: (project: AnimationProject) => void;
  savedProjects: AnimationProject[];
  isSaving: boolean;
}

export function TopBar({
  project,
  onNameChange,
  onSave,
  onLoad,
  savedProjects,
  isSaving,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(project.name);

  function handleNameBlur() {
    setEditingName(false);
    if (nameVal.trim()) onNameChange(nameVal.trim());
  }

  function handleNameKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleNameBlur();
    if (e.key === "Escape") {
      setEditingName(false);
      setNameVal(project.name);
    }
  }

  async function handleSave() {
    try {
      await onSave();
      toast.success("Project saved");
    } catch {
      toast.error("Failed to save project");
    }
  }

  return (
    <header className="topbar-bg flex items-center gap-3 px-4 h-12 shrink-0">
      <div className="flex items-center gap-2 mr-2">
        <div
          className="w-7 h-7 rounded flex items-center justify-center"
          style={{
            background: "oklch(0.72 0.16 200 / 0.15)",
            border: "1px solid oklch(0.72 0.16 200 / 0.5)",
          }}
        >
          <Zap className="w-4 h-4" style={{ color: "oklch(0.72 0.16 200)" }} />
        </div>
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "oklch(0.72 0.16 200)" }}
        >
          TextMotion
        </span>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="flex items-center gap-2">
        <Film className="w-3.5 h-3.5 text-muted-foreground" />
        {editingName ? (
          <Input
            data-ocid="project.input"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKey}
            autoFocus
            className="h-7 w-48 text-sm bg-background border-ring"
          />
        ) : (
          <button
            type="button"
            data-ocid="project.input"
            onClick={() => {
              setEditingName(true);
              setNameVal(project.name);
            }}
            className="text-sm text-foreground hover:text-primary transition-colors cursor-text"
          >
            {project.name}
          </button>
        )}
      </div>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Load
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {savedProjects.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No saved projects
            </div>
          ) : (
            savedProjects.map((p) => (
              <DropdownMenuItem key={p.title} onClick={() => onLoad(p)}>
                {p.title}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        data-ocid="project.save_button"
        size="sm"
        onClick={handleSave}
        disabled={isSaving}
        className="h-7 text-xs gap-1.5 btn-glow"
        style={{ background: "oklch(0.72 0.16 200)", color: "#0a0a0f" }}
      >
        {isSaving ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        Save
      </Button>
    </header>
  );
}
