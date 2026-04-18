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

/**
 * Calls the streaming /api/generate endpoint and resolves as soon as the
 * server emits the newly-created project. The remainder of the SSE stream
 * (LLM-generated code chunks) is discarded by cancelling the reader — keeping
 * the perceived latency at ~50ms instead of 30-90s.
 */
export async function apiGenerateProject(prompt: string): Promise<GeneratedProject> {
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
          if (parsed.project) {
            // Stop reading the rest of the stream — let server complete in background.
            reader.cancel().catch(() => {});
            return parsed.project as GeneratedProject;
          }
        } catch (e) {
          if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
            throw e;
          }
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  throw new Error("Generation stream ended without project payload");
}
