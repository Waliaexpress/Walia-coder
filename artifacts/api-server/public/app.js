const API_BASE = "/api/auth";

// ─── Prompt Templates ─────────────────────────────────────────────────────────

const PROMPT_TEMPLATES = {
  website: "Build a professional marketing website with a hero section, features grid, testimonials, pricing table, and contact form. Use React + Vite + Tailwind CSS. Include dark mode, responsive layout, and SEO meta tags.",
  mobile: "Build a cross-platform mobile app using React Native + Expo. Include a tab-based navigation, user authentication (JWT), push notifications, and a clean dark-mode UI with smooth animations.",
  design: "Design a pixel-perfect, component-driven UI system with a color palette, typography scale, button variants, form inputs, modals, and data tables. Use Tailwind CSS + Figma tokens. Include light and dark themes.",
  database: "Architect a PostgreSQL database schema for a multi-tenant SaaS application. Include users, organizations, roles (RBAC), audit logs, and soft-delete patterns. Use Drizzle ORM with Zod validation schemas.",
  api: "Build a production-grade REST API using Express + TypeScript + Drizzle ORM. Include JWT authentication, RBAC middleware, input validation (Zod), structured logging (pino), rate limiting, and OpenAPI docs.",
  dashboard: "Build an analytics dashboard with real-time charts (Recharts), KPI cards, data tables with pagination and sorting, date range filters, and an export-to-CSV feature. Use React + Vite + Tailwind.",
};

// ─── State ────────────────────────────────────────────────────────────────────

function getToken()  { return localStorage.getItem("walia_token"); }
function getUser()   { try { return JSON.parse(localStorage.getItem("walia_user") || "null"); } catch { return null; } }
function saveSession(token, user) {
  localStorage.setItem("walia_token", token);
  localStorage.setItem("walia_user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("walia_token");
  localStorage.removeItem("walia_user");
}

// ─── Auth UI ──────────────────────────────────────────────────────────────────

function showAlert(message, type = "error") {
  const box = document.getElementById("alert-box");
  box.className = type === "error" ? "alert-error mb-4" : "alert-success mb-4";
  box.textContent = message;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 5000);
}

function setLoading(btnId, spinnerId, textId, loading) {
  const btn = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);
  btn.disabled = loading;
  spinner.classList.toggle("hidden", !loading);
  document.getElementById(textId).style.opacity = loading ? "0.6" : "1";
}

function switchTab(tab) {
  const isLogin = tab === "login";
  document.getElementById("login-form").classList.toggle("hidden", !isLogin);
  document.getElementById("register-form").classList.toggle("hidden", isLogin);
  document.getElementById("alert-box").classList.add("hidden");

  const active = "flex-1 py-3.5 text-sm font-semibold text-blue-400 border-b-2 border-blue-500 transition-all";
  const inactive = "flex-1 py-3.5 text-sm font-semibold text-gray-500 border-b-2 border-transparent hover:text-gray-300 transition-all";
  document.getElementById("tab-login").className    = isLogin ? active : inactive;
  document.getElementById("tab-register").className = isLogin ? inactive : active;
}

// ─── SPA Router ───────────────────────────────────────────────────────────────

const ALL_VIEWS = ["home", "projects", "published", "integrations", "settings", "admin", "api-explorer"];

function switchView(name) {
  ALL_VIEWS.forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    if (el) { el.classList.remove("active"); el.classList.add("hidden"); }
  });

  const target = document.getElementById(`view-${name}`);
  if (target) {
    target.classList.remove("hidden");
    // Force reflow for animation
    void target.offsetWidth;
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-item[data-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === name);
  });

  if (name === "admin") fetchAdminPanel();
  if (name === "projects" || name === "published") loadProjectsView(name);
}

// ─── Workspace Hydration ──────────────────────────────────────────────────────

function showWorkspace(user, token) {
  document.getElementById("auth-panel").classList.add("hidden");
  document.getElementById("workspace-panel").classList.remove("hidden");

  const displayName = user.email.split("@")[0];
  const initials    = displayName.slice(0, 2).toUpperCase();

  document.getElementById("user-greeting-name").textContent        = displayName;
  document.getElementById("sidebar-email").textContent             = user.email;
  document.getElementById("sidebar-role").textContent              = user.role;
  document.getElementById("sidebar-avatar").textContent            = initials;
  document.getElementById("sidebar-workspace-name").textContent    = `${displayName}'s Workspace`;
  document.getElementById("token-preview").textContent             = token;
  document.getElementById("settings-email").textContent            = user.email;
  document.getElementById("settings-role").textContent             = user.role;

  if (user.role === "admin" || user.role === "manager") {
    document.getElementById("admin-nav-section").classList.remove("hidden");
  }

  loadHomeProjects();
}

function showAuth() {
  document.getElementById("auth-panel").classList.remove("hidden");
  document.getElementById("workspace-panel").classList.add("hidden");
}

// ─── Project Rendering ────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (mins > 0)  return `${mins} min${mins > 1 ? "s" : ""} ago`;
  return "Just now";
}

const CARD_GRADIENTS = [
  "from-blue-600/20 to-indigo-700/20",
  "from-amber-600/15 to-orange-700/15",
  "from-purple-600/20 to-pink-700/20",
  "from-emerald-600/15 to-teal-700/15",
  "from-red-600/15 to-rose-700/15",
  "from-cyan-600/15 to-blue-700/15",
];

function buildProjectCard(p, idx) {
  const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
  const statusClass = `status-${p.status}`;
  const stackPills  = (p.stack || "").split("•").map(s => s.trim()).filter(Boolean)
    .map(s => `<span class="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 text-xs border border-gray-700/60">${s}</span>`).join(" ");

  return `<div class="project-card">
    <div class="h-24 bg-gradient-to-br ${gradient} flex items-end px-4 pb-3 border-b border-gray-800/60">
      <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}">${p.status}</span>
    </div>
    <div class="p-4">
      <p class="text-sm font-semibold text-gray-100 mb-1.5 truncate">${p.title}</p>
      <div class="flex flex-wrap gap-1 mb-2">${stackPills}</div>
      <p class="text-xs text-gray-600">${timeAgo(p.createdAt)}</p>
    </div>
  </div>`;
}

function buildNewProjectCard() {
  return `<div class="project-card border-dashed border-gray-700 hover:border-blue-500/30 flex items-center justify-center min-h-[148px] group" onclick="switchView('home')">
    <div class="text-center">
      <div class="w-9 h-9 rounded-xl border border-dashed border-gray-700 group-hover:border-blue-500/40 flex items-center justify-center mx-auto mb-2 transition-colors">
        <svg class="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      </div>
      <p class="text-xs text-gray-600 group-hover:text-gray-400 transition-colors font-medium">New Project</p>
    </div>
  </div>`;
}

async function loadHomeProjects() {
  const grid = document.getElementById("home-projects-grid");
  try {
    const res  = await authFetch("/api/projects");
    const data = await res.json();
    if (!res.ok) { grid.innerHTML = buildNewProjectCard(); return; }

    const projects = Array.isArray(data) ? data : (data.projects || []);
    const cards = projects.slice(0, 5).map((p, i) => buildProjectCard(p, i)).join("");
    grid.innerHTML = cards + buildNewProjectCard();
  } catch {
    grid.innerHTML = buildNewProjectCard();
  }
}

async function loadProjectsView(viewName) {
  const gridId = viewName === "projects" ? "projects-grid" : "published-grid";
  const grid   = document.getElementById(gridId);
  if (grid) grid.innerHTML = `<div class="col-span-3 text-center py-10 text-gray-600 text-sm">Loading…</div>`;

  try {
    const res  = await authFetch("/api/projects");
    const data = await res.json();
    if (!res.ok) { if (grid) grid.innerHTML = ""; return; }

    let projects = Array.isArray(data) ? data : (data.projects || []);
    if (viewName === "published") {
      projects = projects.filter(p => p.status === "live");
      const emptyEl = document.getElementById("published-empty");
      if (emptyEl) emptyEl.classList.toggle("hidden", projects.length > 0);
    }

    if (!grid) return;
    if (!projects.length && viewName !== "projects") { grid.innerHTML = ""; return; }

    const cards = projects.map((p, i) => buildProjectCard(p, i)).join("");
    grid.innerHTML = cards + (viewName === "projects" ? buildNewProjectCard() : "");
  } catch {
    if (grid) grid.innerHTML = `<p class="text-red-400 text-sm">Failed to load projects.</p>`;
  }
}

// ─── Quick-Action Prefill ─────────────────────────────────────────────────────

function prefillPrompt(type) {
  const textarea = document.getElementById("ai-prompt");
  if (textarea && PROMPT_TEMPLATES[type]) {
    textarea.value = PROMPT_TEMPLATES[type];
    textarea.focus();
    textarea.setSelectionRange(0, 0);
    textarea.scrollTop = 0;
  }
}

// ─── Auth Handlers ────────────────────────────────────────────────────────────

async function handleLogin(event) {
  event.preventDefault();
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  setLoading("login-btn", "login-spinner", "login-btn-text", true);
  try {
    const res  = await fetch(`${API_BASE}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { showAlert(data.error || "Login failed."); return; }
    saveSession(data.token, data.user);
    showWorkspace(data.user, data.token);
  } catch { showAlert("Network error. Please try again."); }
  finally { setLoading("login-btn", "login-spinner", "login-btn-text", false); }
}

async function handleRegister(event) {
  event.preventDefault();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const role     = document.getElementById("reg-role").value;
  setLoading("reg-btn", "reg-spinner", "reg-btn-text", true);
  try {
    const res  = await fetch(`${API_BASE}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, role }) });
    const data = await res.json();
    if (!res.ok) { showAlert(data.error || "Registration failed."); return; }
    saveSession(data.token, data.user);
    showWorkspace(data.user, data.token);
  } catch { showAlert("Network error. Please try again."); }
  finally { setLoading("reg-btn", "reg-spinner", "reg-btn-text", false); }
}

function handleLogout() {
  clearSession();
  showAuth();
  switchTab("login");
  document.getElementById("login-email").value    = "";
  document.getElementById("login-password").value = "";
  document.getElementById("admin-nav-section").classList.add("hidden");
  document.getElementById("admin-users-container").innerHTML =
    '<p class="text-gray-600 text-sm text-center py-8">Click Refresh to load identity records.</p>';
  document.getElementById("home-projects-grid").innerHTML =
    '<div class="project-card border-dashed border-gray-700 flex items-center justify-center min-h-[148px]"><p class="text-gray-600 text-sm">Loading projects…</p></div>';
  switchView("home");
}

// ─── Protected Fetch ──────────────────────────────────────────────────────────

async function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

async function fetchProfile() {
  const btn   = document.getElementById("btn-profile");
  const panel = document.getElementById("profile-response");
  btn.disabled = true; btn.textContent = "Fetching…";
  try {
    const res  = await authFetch("/api/users/me");
    const data = await res.json();
    panel.classList.remove("hidden");
    const pre = panel.querySelector("pre");
    pre.textContent = JSON.stringify(data, null, 2);
    pre.className   = `text-xs font-mono break-all whitespace-pre-wrap ${res.ok ? "text-emerald-400" : "text-red-400"}`;
  } catch {
    panel.classList.remove("hidden");
    panel.querySelector("pre").className   = "text-xs font-mono text-red-400 break-all whitespace-pre-wrap";
    panel.querySelector("pre").textContent = '{"error":"Network error"}';
  } finally {
    btn.disabled = false; btn.textContent = "GET /api/users/me";
  }
}

// ─── Admin / Identity Control ─────────────────────────────────────────────────

async function revokeUser(userId, rowElement) {
  const btn = rowElement.querySelector(".revoke-btn");
  btn.disabled = true; btn.textContent = "Revoking…";
  try {
    const res  = await authFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      rowElement.style.transition = "opacity 0.3s, transform 0.3s";
      rowElement.style.opacity    = "0";
      rowElement.style.transform  = "translateX(-8px)";
      setTimeout(() => rowElement.remove(), 300);
    } else {
      btn.disabled = false; btn.textContent = "Revoke Access";
      alert(data.error || "Revocation failed.");
    }
  } catch {
    btn.disabled = false; btn.textContent = "Revoke Access";
    alert("Network error during revocation.");
  }
}

function renderUsersTable(users, currentUserId) {
  const container = document.getElementById("admin-users-container");
  if (!users.length) {
    container.innerHTML = `<p class="text-gray-500 text-sm text-center py-8">No users found.</p>`;
    return;
  }

  const roleBadge = (role) => {
    const map = { admin: "role-admin", manager: "role-manager", employee: "role-employee" };
    return map[role] || "role-employee";
  };

  const rows = users.map((u) => {
    const isSelf     = u.id === currentUserId;
    const initials   = u.email.split("@")[0].slice(0, 2).toUpperCase();
    const actionCell = isSelf
      ? `<td class="px-4 py-3 text-gray-600 text-xs italic">Current session</td>`
      : `<td class="px-4 py-3"><button class="revoke-btn text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold transition-colors disabled:opacity-50" onclick="revokeUser('${u.id}', this.closest('tr'))">Revoke Access</button></td>`;

    return `<tr class="border-t border-gray-800/60 hover:bg-white/[0.02] transition-colors">
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-semibold text-gray-300 flex-shrink-0">${initials}</div>
          <span class="text-sm text-gray-200 font-mono text-xs">${u.email}</span>
        </div>
      </td>
      <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge(u.role)}">${u.role}</span></td>
      <td class="px-4 py-3 text-gray-500 text-xs">${new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
      ${actionCell}
    </tr>`;
  });

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="text-gray-600 text-xs uppercase tracking-wider border-b border-gray-800">
            <th class="px-4 py-2.5 font-semibold">Identity</th>
            <th class="px-4 py-2.5 font-semibold">Role</th>
            <th class="px-4 py-2.5 font-semibold">Joined</th>
            <th class="px-4 py-2.5 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>`;
}

async function fetchAdminPanel() {
  const btn = document.getElementById("btn-admin");
  if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; }
  try {
    const res  = await authFetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok) {
      document.getElementById("admin-users-container").innerHTML =
        `<pre class="text-xs font-mono text-red-400 break-all whitespace-pre-wrap p-2">${JSON.stringify(data, null, 2)}</pre>`;
      return;
    }
    renderUsersTable(data.users, getUser()?.sub ?? null);
  } catch {
    document.getElementById("admin-users-container").innerHTML =
      `<p class="text-red-400 text-sm text-center py-8">Network error — could not load identities.</p>`;
  } finally {
    if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

(function init() {
  const token = getToken();
  const user  = getUser();
  if (token && user) {
    showWorkspace(user, token);
  } else {
    showAuth();
  }
})();
