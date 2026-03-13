import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnimationProject,
  StyleSettings,
  TextSegment,
} from "../backend.d";
import { useActor } from "./useActor";

export function useListProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<AnimationProject[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      textSegments: TextSegment[];
      styleSettings: StyleSettings;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createProject(
        args.title,
        args.textSegments,
        args.styleSettings,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      newTextSegments: TextSegment[];
      newStyleSettings: StyleSettings;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProject(
        args.title,
        args.newTextSegments,
        args.newStyleSettings,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProject(title);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
