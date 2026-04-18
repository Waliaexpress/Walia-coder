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

const _projectsCache = {};   // id → project object

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

function escapeHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function buildProjectCard(p, idx) {
  const gradient  = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
  const statusClass = `status-${p.status}`;
  const stackPills  = (p.stack || "").split("•").map(s => s.trim()).filter(Boolean)
    .map(s => `<span class="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 text-xs border border-gray-700/60">${escapeHtml(s)}</span>`).join(" ");

  const safeTitle = escapeHtml(p.title);
  const safeStack = escapeHtml(p.stack || "");

  return `<div class="project-card cursor-pointer hover:ring-1 hover:ring-blue-500/40 transition-all" id="card-${p.id}" onclick="openPreviewModal('${p.id}', '${safeTitle.replace(/'/g, "\\'")}')">
    <div class="h-24 bg-gradient-to-br ${gradient} flex items-end justify-between px-4 pb-3 border-b border-gray-800/60 relative group">
      <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}">${p.status}</span>
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span class="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Launch Preview
        </span>
      </div>
      <div class="flex items-center gap-1.5 relative z-10">
        <button
          class="card-menu-btn card-menu-edit"
          title="Edit project"
          onclick="event.stopPropagation(); openEditModal('${p.id}')"
          aria-label="Edit">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </button>
        <button
          class="card-menu-btn card-menu-delete"
          title="Delete project"
          onclick="event.stopPropagation(); openDeleteModal('${p.id}', '${safeTitle}')"
          aria-label="Delete">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
    <div class="p-4">
      <p class="text-sm font-semibold text-gray-100 mb-1.5 truncate">${safeTitle}</p>
      <div class="flex flex-wrap gap-1 mb-2">${stackPills}</div>
      <p class="text-xs text-gray-600">${timeAgo(p.createdAt)}</p>
    </div>
  </div>`;
}

/* ================== LIVE PREVIEW MODAL ================== */
function openPreviewModal(projectId, title) {
  // Remove any existing modal first
  const existing = document.getElementById("preview-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "preview-modal";
  modal.className = "fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn";
  modal.style.animation = "fadeIn 0.2s ease-out";
  modal.innerHTML = `
    <div class="w-full max-w-7xl h-[90vh] flex flex-col rounded-xl overflow-hidden border border-gray-800 bg-[#0e1117] shadow-2xl">
      <div class="flex items-center gap-3 px-4 py-2.5 bg-[#1c2333] border-b border-gray-800">
        <div class="flex items-center gap-1.5">
          <button onclick="closePreviewModal()" class="w-3 h-3 rounded-full bg-red-500 hover:scale-110 transition-transform" title="Close"></button>
          <div class="w-3 h-3 rounded-full bg-amber-500/40"></div>
          <div class="w-3 h-3 rounded-full bg-green-500/40"></div>
        </div>
        <div class="flex-1 flex items-center gap-2 bg-[#0e1117] rounded-md px-3 py-1 border border-gray-800">
          <div class="w-2 h-2 rounded-full bg-green-400/80"></div>
          <span class="text-[11px] font-mono text-gray-500 truncate">walia://preview/${projectId.split("-")[0]} — ${title}</span>
        </div>
        <button onclick="document.getElementById('preview-iframe').src = document.getElementById('preview-iframe').src" class="text-gray-500 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition-colors" title="Reload">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
        <a href="/api/projects/${projectId}/preview" target="_blank" rel="noopener" class="text-gray-500 hover:text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition-colors" title="Open in new tab">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
        <button onclick="closePreviewModal()" class="text-gray-500 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <iframe
        id="preview-iframe"
        src="/api/projects/${projectId}/preview"
        class="flex-1 w-full bg-white border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Live Preview: ${title}"></iframe>
    </div>`;

  // Click backdrop to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePreviewModal();
  });

  // ESC to close
  document.addEventListener("keydown", _previewEscHandler);

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
}

function _previewEscHandler(e) {
  if (e.key === "Escape") closePreviewModal();
}

function closePreviewModal() {
  const modal = document.getElementById("preview-modal");
  if (modal) modal.remove();
  document.removeEventListener("keydown", _previewEscHandler);
  document.body.style.overflow = "";
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
    projects.forEach(p => { _projectsCache[p.id] = p; });
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
    projects.forEach(p => { _projectsCache[p.id] = p; });
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

// ─── Delete Modal ─────────────────────────────────────────────────────────────

let _deleteTargetId    = null;
let _deleteTargetCard  = null;

function openDeleteModal(projectId, title) {
  _deleteTargetId = projectId;
  document.getElementById("delete-modal-title").textContent = `"${title}"`;
  document.getElementById("delete-modal-error").classList.add("hidden");
  const btn = document.getElementById("btn-confirm-delete");
  btn.disabled = false;
  btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete Project`;
  document.getElementById("delete-modal").classList.remove("hidden");
}

function closeDeleteModal() {
  document.getElementById("delete-modal").classList.add("hidden");
  _deleteTargetId   = null;
  _deleteTargetCard = null;
}

function handleDeleteModalBackdrop(e) {
  if (e.target === document.getElementById("delete-modal")) closeDeleteModal();
}

async function executeDelete() {
  if (!_deleteTargetId) return;

  const btn     = document.getElementById("btn-confirm-delete");
  const errBox  = document.getElementById("delete-modal-error");
  const id      = _deleteTargetId;

  // Optimistic UI — hide card immediately
  const cardEl = document.getElementById(`card-${id}`);
  if (cardEl) {
    cardEl.style.transition = "opacity 0.2s, transform 0.2s";
    cardEl.style.opacity    = "0";
    cardEl.style.transform  = "scale(0.95)";
  }

  btn.disabled = true;
  btn.innerHTML = `<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Deleting…`;
  errBox.classList.add("hidden");

  try {
    const res  = await authFetch(`/api/projects/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      // Revert optimistic removal on failure
      if (cardEl) { cardEl.style.opacity = "1"; cardEl.style.transform = ""; }
      errBox.textContent = data.error || "Deletion failed. Please try again.";
      errBox.classList.remove("hidden");
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete Project`;
      return;
    }

    // Confirmed — remove from DOM and cache
    delete _projectsCache[id];
    setTimeout(() => { if (cardEl) cardEl.remove(); }, 200);
    closeDeleteModal();
    // Refresh both grids silently
    loadHomeProjects();
    const projectsGrid = document.getElementById("projects-grid");
    if (projectsGrid) loadProjectsView("projects");
  } catch {
    if (cardEl) { cardEl.style.opacity = "1"; cardEl.style.transform = ""; }
    errBox.textContent = "Network error — please try again.";
    errBox.classList.remove("hidden");
    btn.disabled = false;
    btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Delete Project`;
  }
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

let _editTargetId = null;

function openEditModal(projectId) {
  const p = _projectsCache[projectId];
  if (!p) return;

  _editTargetId = projectId;
  document.getElementById("edit-project-id").value  = p.id;
  document.getElementById("edit-title").value        = p.title || "";
  document.getElementById("edit-stack").value        = p.stack || "";
  document.getElementById("edit-status").value       = p.status || "private";
  document.getElementById("edit-modal-error").classList.add("hidden");

  const btn = document.getElementById("btn-save-edit");
  btn.disabled  = false;
  btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Save Changes`;

  document.getElementById("edit-modal").classList.remove("hidden");
  setTimeout(() => document.getElementById("edit-title").focus(), 50);
}

function closeEditModal() {
  document.getElementById("edit-modal").classList.add("hidden");
  _editTargetId = null;
}

function handleEditModalBackdrop(e) {
  if (e.target === document.getElementById("edit-modal")) closeEditModal();
}

async function saveEditProject() {
  const id     = _editTargetId;
  const title  = document.getElementById("edit-title").value.trim();
  const stack  = document.getElementById("edit-stack").value.trim();
  const status = document.getElementById("edit-status").value;
  const errBox = document.getElementById("edit-modal-error");
  const btn    = document.getElementById("btn-save-edit");

  if (!title) {
    errBox.textContent = "Title is required.";
    errBox.classList.remove("hidden");
    document.getElementById("edit-title").focus();
    return;
  }

  btn.disabled  = true;
  btn.innerHTML = `<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving…`;
  errBox.classList.add("hidden");

  try {
    const res  = await authFetch(`/api/projects/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title, stack, status }),
    });
    const data = await res.json();

    if (!res.ok) {
      errBox.textContent = data.error || "Update failed.";
      errBox.classList.remove("hidden");
      btn.disabled  = false;
      btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Save Changes`;
      return;
    }

    // Update cache with new data
    _projectsCache[id] = { ..._projectsCache[id], ...data };

    // Optimistically patch visible card
    const cardEl = document.getElementById(`card-${id}`);
    if (cardEl) {
      const titleEl = cardEl.querySelector(".text-sm.font-semibold.text-gray-100");
      if (titleEl) titleEl.textContent = data.title;

      const badgeEl = cardEl.querySelector(`[class*="status-"]`);
      if (badgeEl) {
        badgeEl.className = `px-2 py-0.5 rounded-full text-xs font-semibold status-${data.status}`;
        badgeEl.textContent = data.status;
      }

      const pillContainer = cardEl.querySelector(".flex.flex-wrap.gap-1");
      if (pillContainer && data.stack) {
        const newPills = data.stack.split("•").map(s => s.trim()).filter(Boolean)
          .map(s => `<span class="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 text-xs border border-gray-700/60">${escapeHtml(s)}</span>`).join(" ");
        pillContainer.innerHTML = newPills;
      }
    }

    closeEditModal();
  } catch {
    errBox.textContent = "Network error — please try again.";
    errBox.classList.remove("hidden");
    btn.disabled  = false;
    btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Save Changes`;
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

// ─── Context Menu / Attachments ───────────────────────────────────────────────

let _attachments = [];

function toggleContextMenu(e) {
  e?.stopPropagation();
  const menu = document.getElementById("context-menu");
  if (!menu) return;
  menu.classList.toggle("hidden");
  // Close on outside click
  if (!menu.classList.contains("hidden")) {
    setTimeout(() => {
      const handler = (ev) => {
        if (!menu.contains(ev.target) && ev.target.id !== "btn-context") {
          menu.classList.add("hidden");
          document.removeEventListener("mousedown", handler);
        }
      };
      document.addEventListener("mousedown", handler);
    }, 10);
  }
}

function handleContextAction(kind) {
  document.getElementById("context-menu")?.classList.add("hidden");
  switch (kind) {
    case "upload":
      document.getElementById("hidden-file-input")?.click();
      break;
    case "drive":
      addAttachment("Google Drive");
      break;
    case "photos":
      addAttachment("Photos");
      break;
    case "code":
      const url = window.prompt("Paste a Git repo or code URL:");
      if (url?.trim()) addAttachment(`Code: ${url.trim()}`);
      break;
    case "notebooklm":
      const nb = window.prompt("Paste a NotebookLM share URL:");
      if (nb?.trim()) addAttachment(`NotebookLM: ${nb.trim()}`);
      break;
    case "figma":
      const fig = window.prompt("Paste a Figma file URL:");
      if (fig?.trim()) addAttachment(`Figma: ${fig.trim()}`);
      break;
    case "skill":
      const skill = window.prompt("Skill name (e.g. 'design-thinker', 'data-visualization'):");
      if (skill?.trim()) addAttachment(`Skill: ${skill.trim()}`);
      break;
  }
}

function handleFileUpload(e) {
  const files = Array.from(e.target.files || []);
  files.forEach((f) => addAttachment(f.name));
  e.target.value = "";
}

function addAttachment(label) {
  _attachments.push(label);
  renderAttachments();
}

function removeAttachment(idx) {
  _attachments.splice(idx, 1);
  renderAttachments();
}

function renderAttachments() {
  const wrap = document.getElementById("attachment-chips");
  if (!wrap) return;
  if (_attachments.length === 0) {
    wrap.classList.add("hidden");
    wrap.innerHTML = "";
    return;
  }
  wrap.classList.remove("hidden");
  wrap.innerHTML = _attachments
    .map((name, i) => {
      const safe = escapeHtml(name.length > 40 ? name.slice(0, 38) + "…" : name);
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-mono">${safe}<button onclick="removeAttachment(${i})" class="hover:text-white ml-1 leading-none">×</button></span>`;
    })
    .join("");
}

// ─── AI Generate ──────────────────────────────────────────────────────────────

let currentGeneratedCode = "";

function setGenerating(on) {
  const btn      = document.getElementById("btn-generate");
  const icon     = document.getElementById("generate-icon");
  const spinner  = document.getElementById("generate-spinner");
  const label    = document.getElementById("generate-label");
  btn.disabled   = on;
  icon.classList.toggle("hidden", on);
  spinner.classList.toggle("hidden", !on);
  label.textContent = on ? "Generating…" : "Generate";
}

function closeOutputPanel() {
  document.getElementById("generate-output-panel").classList.add("hidden");
}

function copyGeneratedCode() {
  if (!currentGeneratedCode) return;
  navigator.clipboard.writeText(currentGeneratedCode).then(() => {
    const btn = document.getElementById("btn-copy");
    btn.textContent = "Copied!";
    setTimeout(() => { btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg> Copy`; }, 2000);
  });
}

async function handleGenerate() {
  const textarea = document.getElementById("ai-prompt");
  const prompt   = textarea?.value?.trim();
  if (!prompt) {
    textarea?.focus();
    return;
  }

  currentGeneratedCode = "";
  setGenerating(true);

  const panel     = document.getElementById("generate-output-panel");
  const pre       = document.getElementById("generate-output-pre");
  const statusDot = document.getElementById("output-status-dot");
  const statusLbl = document.getElementById("output-status-label");
  const saved     = document.getElementById("output-project-saved");
  const copyBtn   = document.getElementById("btn-copy");

  pre.textContent = "";
  saved.classList.add("hidden");
  copyBtn.classList.add("hidden");
  statusDot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot";
  statusLbl.textContent = "Generating…";
  panel.classList.remove("hidden");

  panel.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const res = await authFetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (res.status === 401) {
      // authFetch already cleared session and triggered showAuth
      panel.classList.add("hidden");
      setGenerating(false);
      return;
    }

    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      pre.textContent = `Error: ${data.error || "Generation failed. Please try again."}`;
      statusDot.className = "w-2 h-2 rounded-full bg-red-400";
      statusLbl.textContent = "Failed";
      setGenerating(false);
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const evt = JSON.parse(line.slice(6));

          if (evt.content) {
            currentGeneratedCode += evt.content;
            pre.textContent = currentGeneratedCode;
            pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
          }

          if (evt.done) {
            statusDot.className = "w-2 h-2 rounded-full bg-blue-400";
            statusLbl.textContent = "Complete";
            copyBtn.classList.remove("hidden");
            saved.classList.remove("hidden");
            loadHomeProjects();
          }

          if (evt.error) {
            statusDot.className = "w-2 h-2 rounded-full bg-red-400";
            statusLbl.textContent = "Error";
            if (!currentGeneratedCode) pre.textContent = evt.error;
          }
        } catch { /* ignore parse errors */ }
      }
    }
  } catch (err) {
    pre.textContent = "Network error — please try again.";
    statusDot.className = "w-2 h-2 rounded-full bg-red-400";
    statusLbl.textContent = "Failed";
  } finally {
    setGenerating(false);
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
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
  });

  if (res.status === 401) {
    clearSession();
    showAlert("Session expired — please sign in again.", "error");
    setTimeout(() => showAuth(), 800);
  }

  return res;
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

(async function init() {
  const token = getToken();
  const user  = getUser();
  if (!token || !user) { showAuth(); return; }

  // Optimistically show the workspace while validating the token
  showWorkspace(user, token);

  // Validate the token is still accepted by the server
  try {
    const res = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      clearSession();
      showAlert("Session expired — please sign in again.", "error");
      showAuth();
    }
  } catch {
    // Network error on startup — leave workspace visible, will retry on next action
  }
})();
