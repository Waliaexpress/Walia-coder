const getBase = () => (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("walia_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ProjectPayload {
  title?: string;
  stack?: string;
  status?: "live" | "private" | "building";
}

export async function apiUpdateProject(id: string, payload: ProjectPayload) {
  const res = await fetch(`${getBase()}/api/projects/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiDeleteProject(id: string) {
  const res = await fetch(`${getBase()}/api/projects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export interface GeneratedProject {
  id: string;
  title: string;
  stack: string | null;
  status: "live" | "private" | "building";
  createdAt: string;
  userId: string;
}

export interface GenerateResult {
  project: GeneratedProject;
  projectId: string;
}

/**
 * Streams /api/generate and:
 *  - Calls onProjectCreated immediately when the server emits {project} (instant card feedback)
 *  - Resolves with { project, projectId } when the server emits {done} (preview is ready)
 */
export async function apiGenerateProject(
  prompt: string,
  opts?: { onProjectCreated?: (p: GeneratedProject) => void }
): Promise<GenerateResult> {
  const res = await fetch(`${getBase()}/api/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let createdProject: GeneratedProject | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        if (!event.startsWith("data: ")) continue;
        const payload = event.slice(6).trim();
        if (!payload) continue;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) throw new Error(parsed.error);

          // First event — project metadata created instantly
          if (parsed.project && !createdProject) {
            createdProject = parsed.project as GeneratedProject;
            opts?.onProjectCreated?.(createdProject);
          }

          // Final event — generation complete, preview is ready
          if (parsed.done && parsed.projectId && createdProject) {
            reader.cancel().catch(() => {});
            return { project: createdProject, projectId: parsed.projectId as string };
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  if (createdProject) {
    return { project: createdProject, projectId: createdProject.id };
  }
  throw new Error("Generation stream ended without project payload");
}

/** Returns the URL to render a project's live preview in an iframe */
export function getPreviewUrl(projectId: string): string {
  return `${getBase()}/api/projects/${projectId}/preview`;
}
