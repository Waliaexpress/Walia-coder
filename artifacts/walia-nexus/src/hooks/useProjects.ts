import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useListProjects,
  useDeleteProject,
  getListProjectsQueryKey,
  getGetProjectsSummaryQueryKey,
} from "@workspace/api-client-react";
import {
  apiUpdateProject,
  apiGenerateProject,
  ProjectPayload,
  GeneratedProject,
  GenerateResult,
} from "@/services/projects.service";

export { useListProjects };

export function useDeleteProjectMutation() {
  const qc = useQueryClient();
  const del = useDeleteProject();

  return {
    ...del,
    mutate: (id: string, callbacks?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
      const listKey = getListProjectsQueryKey();
      const prevData = qc.getQueryData(listKey);

      qc.cancelQueries({ queryKey: listKey });
      qc.setQueryData(listKey, (old: unknown) =>
        Array.isArray(old) ? old.filter((p: { id: string }) => p.id !== id) : old
      );

      del.mutate(
        { id },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: listKey });
            qc.invalidateQueries({ queryKey: getGetProjectsSummaryQueryKey() });
            callbacks?.onSuccess?.();
          },
          onError: (e) => {
            qc.setQueryData(listKey, prevData);
            callbacks?.onError?.(e as Error);
          },
        }
      );
    },
  };
}

export function useUpdateProjectMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectPayload }) =>
      apiUpdateProject(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetProjectsSummaryQueryKey() });
    },
  });
}

export function useGenerateMutation(opts?: {
  onProjectCreated?: (p: GeneratedProject) => void;
}) {
  const qc = useQueryClient();

  return useMutation<GenerateResult, Error, string>({
    mutationFn: (prompt: string) =>
      apiGenerateProject(prompt, {
        onProjectCreated: (p) => {
          // Optimistically prepend the new card to the list immediately
          qc.setQueryData(getListProjectsQueryKey(), (old: unknown) =>
            Array.isArray(old) ? [p, ...old] : [p]
          );
          opts?.onProjectCreated?.(p);
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetProjectsSummaryQueryKey() });
    },
  });
}
