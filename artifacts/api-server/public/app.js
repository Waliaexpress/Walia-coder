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

const ALL_VIEWS = ["home", "projects", "published", "integrations", "settings", "admin", "api-explorer", "workspace"];

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
  openWorkspace(projectId, title);
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
  let _generatedProjectId = null;
  let _generatedProjectTitle = "Generated Project";
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

          if (evt.project && evt.project.id) {
            _generatedProjectId = evt.project.id;
            _generatedProjectTitle = evt.project.title || "Generated Project";
            loadHomeProjects();
          }

          if (evt.content) {
            currentGeneratedCode += evt.content;
            pre.textContent = currentGeneratedCode;
            pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
          }

          if (evt.done) {
            statusDot.className = "w-2 h-2 rounded-full bg-blue-400";
            statusLbl.textContent = "Complete! Opening workspace…";
            copyBtn.classList.remove("hidden");
            saved.classList.remove("hidden");
            // Open the Active Workspace with the generated project
            if (_generatedProjectId) {
              setTimeout(() => {
                openWorkspace(_generatedProjectId, _generatedProjectTitle);
              }, 600);
            } else {
              loadHomeProjects();
            }
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

// ─── Active Workspace ─────────────────────────────────────────────────────────

let _wsProjectId = null;
let _wsCode = "";
let _wsCodeEditTimer = null;
let _wsIterating = false;
let _wsPrevView = "home";
let wsLayout = "tri";

function openWorkspace(projectId, title) {
  const currentActive = document.querySelector(".view.active")?.id?.replace("view-", "");
  _wsPrevView = (currentActive && currentActive !== "workspace") ? currentActive : (_wsPrevView || "home");

  if (_wsProjectId === projectId && currentActive === "workspace") {
    document.getElementById("ws-title").textContent = title || "Project";
    return;
  }

  _wsProjectId = projectId;

  // Update top bar
  document.getElementById("ws-title").textContent = title || "Project";
  document.getElementById("ws-ext-link").href = `/api/projects/${projectId}/preview`;

  // Reset chat
  const msgs = document.getElementById("ws-messages");
  msgs.innerHTML = "";
  wsAddMessage("assistant", "Project loaded. I have full context of the current code. Tell me what to change — e.g. \"Make the header blue\", \"Add a pricing section\".");

  // Reset code editor
  const editor = document.getElementById("ws-code-editor");
  editor.value = "Loading code…";
  document.getElementById("ws-code-stats").textContent = "Loading…";
  document.getElementById("ws-preview-iframe").srcdoc = "<html><body style='background:#0e1117;display:flex;align-items:center;justify-content:center;height:100vh;'><p style='color:#4b5563;font-family:monospace;font-size:12px;'>Loading preview…</p></body></html>";

  // Make main overflow:hidden for the workspace
  document.querySelector("main").style.overflow = "hidden";

  // Switch to workspace view
  switchView("workspace");
  setWsLayout("tri");

  // Load project code
  authFetch(`/api/projects/${projectId}/code`)
    .then(r => r.json())
    .then(d => {
      _wsCode = d.code || "";
      editor.value = _wsCode;
      wsUpdateStats();
      wsUpdatePreview();
    })
    .catch(() => {
      editor.value = "// Error loading code";
    });
}

function closeWorkspace() {
  _wsProjectId = null;
  document.querySelector("main").style.overflow = "";
  switchView(_wsPrevView || "home");
}

function setWsLayout(layout) {
  wsLayout = layout;
  const paneChat = document.getElementById("ws-pane-chat");
  const paneCode = document.getElementById("ws-pane-code");
  const panePreview = document.getElementById("ws-pane-preview");

  const btns = { tri: "ws-btn-tri", chat: "ws-btn-chat", code: "ws-btn-code", preview: "ws-btn-preview" };
  Object.entries(btns).forEach(([k, id]) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.style.background = k === layout ? "#2563eb" : "none";
      btn.style.color = k === layout ? "#fff" : "#6b7280";
    }
  });

  switch (layout) {
    case "tri":
      paneChat.style.display = "flex"; paneChat.style.width = "300px"; paneChat.style.flex = "";
      paneCode.style.display = "flex"; paneCode.style.flex = "1";
      panePreview.style.display = "flex"; panePreview.style.flex = "1";
      break;
    case "chat":
      paneChat.style.display = "flex"; paneChat.style.flex = "1"; paneChat.style.width = "";
      paneCode.style.display = "none";
      panePreview.style.display = "none";
      break;
    case "code":
      paneChat.style.display = "none";
      paneCode.style.display = "flex"; paneCode.style.flex = "1";
      panePreview.style.display = "none";
      break;
    case "preview":
      paneChat.style.display = "none";
      paneCode.style.display = "none";
      panePreview.style.display = "flex"; panePreview.style.flex = "1";
      break;
  }
}

function wsAddMessage(role, content) {
  const msgs = document.getElementById("ws-messages");
  const div = document.createElement("div");
  div.style.cssText = "display:flex;gap:8px;" + (role === "user" ? "justify-content:flex-end;" : "");
  const isUser = role === "user";
  div.innerHTML = `
    ${!isUser ? `<div style="width:24px;height:24px;border-radius:50%;background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
      <svg width="12" height="12" fill="none" stroke="#60a5fa" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
    </div>` : ""}
    <div style="max-width:85%;border-radius:${isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px"};padding:8px 12px;font-size:11px;line-height:1.6;${isUser ? "background:#2563eb;color:#fff;" : "background:#1c2333;border:1px solid #1f2937;color:#d1d5db;"}" id="ws-msg-${Date.now()}-${Math.random().toString(36).slice(2)}">
      ${escapeHtml(content)}
    </div>
    ${isUser ? `<div style="width:24px;height:24px;border-radius:50%;background:#374151;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
      <svg width="12" height="12" fill="none" stroke="#d1d5db" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
    </div>` : ""}
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div.querySelector("[id^='ws-msg-']");
}

function wsHandleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    wsSendIteration();
  }
}

function wsShowProcessingOverlay() {
  let overlay = document.getElementById("ws-processing-overlay");
  if (overlay) { overlay.style.display = "flex"; return; }
  overlay = document.createElement("div");
  overlay.id = "ws-processing-overlay";
  overlay.style.cssText = [
    "position:absolute;inset:0;background:rgba(13,17,23,0.85);",
    "display:flex;flex-direction:column;align-items:center;justify-content:center;",
    "gap:14px;z-index:50;border-radius:0;pointer-events:all;backdrop-filter:blur(2px);"
  ].join("");
  overlay.innerHTML = `
    <div style="display:flex;gap:6px;align-items:center;">
      <span style="width:8px;height:8px;border-radius:50%;background:#3b82f6;animation:wsPulse 0.9s ease-in-out infinite;"></span>
      <span style="width:8px;height:8px;border-radius:50%;background:#3b82f6;animation:wsPulse 0.9s ease-in-out 0.2s infinite;"></span>
      <span style="width:8px;height:8px;border-radius:50%;background:#3b82f6;animation:wsPulse 0.9s ease-in-out 0.4s infinite;"></span>
    </div>
    <p style="font-size:12px;font-family:monospace;color:#60a5fa;font-weight:600;letter-spacing:0.05em;">Engine Processing Update…</p>
    <p id="ws-overlay-chars" style="font-size:10px;font-family:monospace;color:#374151;">Receiving code…</p>
  `;
  if (!document.getElementById("ws-pulse-style")) {
    const s = document.createElement("style");
    s.id = "ws-pulse-style";
    s.textContent = "@keyframes wsPulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}";
    document.head.appendChild(s);
  }
  const pane = document.getElementById("ws-pane-code");
  pane.style.position = "relative";
  pane.appendChild(overlay);
}

function wsHideProcessingOverlay() {
  const overlay = document.getElementById("ws-processing-overlay");
  if (overlay) overlay.style.display = "none";
}

async function wsSendIteration() {
  if (!_wsProjectId || _wsIterating) return;
  const input = document.getElementById("ws-chat-input");
  const prompt = input.value.trim();
  if (!prompt) return;

  input.value = "";
  input.disabled = true;
  _wsIterating = true;
  document.getElementById("ws-ai-badge").style.display = "inline";
  document.getElementById("ws-send-btn").disabled = true;
  wsShowProcessingOverlay();

  wsAddMessage("user", prompt);
  const botBubble = wsAddMessage("assistant", "");
  botBubble.innerHTML = `<span style="color:#6b7280;font-style:italic;">Thinking…</span>`;

  let accumulated = "";
  let previewDebounceTimer = null;
  let firstChunk = true;

  const schedulePreviewUpdate = () => {
    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(() => {
      wsUpdatePreview();
    }, 800);
  };

  try {
    const res = await authFetch(`/api/projects/${_wsProjectId}/iterate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, currentCode: _wsCode }),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => `HTTP ${res.status}`);
      throw new Error(errText || `HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.startsWith("data: ")) continue;
        let parsed;
        try { parsed = JSON.parse(event.slice(6)); } catch { continue; }

        if (parsed.error) throw new Error(parsed.error);

        if (parsed.content) {
          if (firstChunk) {
            botBubble.innerHTML = `<span style="color:#fbbf24;font-style:italic;">Streaming code…</span>`;
            firstChunk = false;
          }
          accumulated += parsed.content;
          _wsCode = accumulated;

          const editor = document.getElementById("ws-code-editor");
          editor.value = _wsCode;
          wsUpdateStats();

          const overlayChars = document.getElementById("ws-overlay-chars");
          if (overlayChars) overlayChars.textContent = `${accumulated.length.toLocaleString()} chars received`;

          schedulePreviewUpdate();
        }

        if (parsed.done) {
          if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
          wsUpdatePreview();
          botBubble.textContent = "Done! Changes applied to the live preview.";
          wsUpdateStats();
        }
      }
    }
  } catch (err) {
    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    botBubble.innerHTML = `<span style="color:#f87171;">Error: ${escapeHtml(err.message || "Iteration failed.")}</span>`;
  } finally {
    _wsIterating = false;
    input.disabled = false;
    input.focus();
    document.getElementById("ws-ai-badge").style.display = "none";
    document.getElementById("ws-send-btn").disabled = false;
    wsHideProcessingOverlay();
  }
}

function wsOnCodeEdit() {
  _wsCode = document.getElementById("ws-code-editor").value;
  wsUpdateStats();
  if (_wsCodeEditTimer) clearTimeout(_wsCodeEditTimer);
  _wsCodeEditTimer = setTimeout(wsUpdatePreview, 800);
}

function wsUpdatePreview() {
  const iframe = document.getElementById("ws-preview-iframe");
  if (iframe && _wsCode) iframe.srcdoc = _wsCode;
}

function wsUpdateStats() {
  const lines = (_wsCode.match(/\n/g) || []).length + 1;
  document.getElementById("ws-code-stats").textContent =
    `${_wsCode.length.toLocaleString()} chars · ${lines} lines`;
}

function wsSyncPreview() {
  wsUpdatePreview();
}

function wsRefreshPreview() {
  const iframe = document.getElementById("ws-preview-iframe");
  if (!iframe) return;
  const html = iframe.srcdoc;
  iframe.srcdoc = "";
  setTimeout(() => { iframe.srcdoc = html; }, 50);
}

function wsCopyCode() {
  if (!_wsCode) return;
  navigator.clipboard.writeText(_wsCode).then(() => {
    const btn = document.getElementById("ws-copy-btn");
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="13" height="13" fill="none" stroke="#34d399" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
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
