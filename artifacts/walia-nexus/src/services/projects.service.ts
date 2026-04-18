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

export async function apiGenerateProject(prompt: string) {
  const res = await fetch(`${getBase()}/api/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}
