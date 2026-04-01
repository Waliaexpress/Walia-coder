const API_BASE = "/api/auth";

// ─── State ────────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("walia_token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("walia_user") || "null");
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem("walia_token", token);
  localStorage.setItem("walia_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("walia_token");
  localStorage.removeItem("walia_user");
}

// ─── Auth UI Helpers ──────────────────────────────────────────────────────────

function showAlert(message, type = "error") {
  const box = document.getElementById("alert-box");
  box.className = [
    "mb-5 px-4 py-3 rounded-lg text-sm font-medium",
    type === "error"
      ? "bg-red-900/40 text-red-300 border border-red-700/50"
      : "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50",
  ].join(" ");
  box.textContent = message;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 5000);
}

function setLoading(btnId, spinnerId, textId, loading) {
  const btn = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);
  const text = document.getElementById(textId);
  btn.disabled = loading;
  spinner.classList.toggle("hidden", !loading);
  text.style.opacity = loading ? "0.6" : "1";
}

function switchTab(tab) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginTab = document.getElementById("tab-login");
  const registerTab = document.getElementById("tab-register");
  document.getElementById("alert-box").classList.add("hidden");

  const active = "flex-1 py-4 text-sm font-semibold text-blue-400 border-b-2 border-blue-500 transition-all duration-200";
  const inactive = "flex-1 py-4 text-sm font-semibold text-gray-500 border-b-2 border-transparent hover:text-gray-300 transition-all duration-200";

  if (tab === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginTab.className = active;
    registerTab.className = inactive;
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    loginTab.className = inactive;
    registerTab.className = active;
  }
}

// ─── Workspace View Router ────────────────────────────────────────────────────

const ALL_VIEWS = ["home", "projects", "published", "integrations", "settings", "admin", "profile-api"];

function switchView(name, triggerEl) {
  ALL_VIEWS.forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add("hidden");
  });

  const target = document.getElementById(`view-${name}`);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
  if (triggerEl) triggerEl.classList.add("active");

  if (name === "admin") {
    fetchAdminPanel();
  }
}

// ─── Workspace Hydration ──────────────────────────────────────────────────────

function showWorkspace(user, token) {
  document.getElementById("auth-panel").classList.add("hidden");
  document.getElementById("workspace-panel").classList.remove("hidden");

  const displayName = user.email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  document.getElementById("user-greeting-name").textContent = displayName;
  document.getElementById("sidebar-email").textContent = user.email;
  document.getElementById("sidebar-role").textContent = user.role;
  document.getElementById("sidebar-avatar").textContent = initials;
  document.getElementById("sidebar-workspace-name").textContent = `${displayName}'s Workspace`;
  document.getElementById("token-preview").textContent = token;

  if (user.role === "admin" || user.role === "manager") {
    document.getElementById("admin-nav-section").classList.remove("hidden");
  }
}

function showAuth() {
  document.getElementById("auth-panel").classList.remove("hidden");
  document.getElementById("workspace-panel").classList.add("hidden");
}

// ─── Auth Handlers ────────────────────────────────────────────────────────────

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  setLoading("login-btn", "login-spinner", "login-btn-text", true);
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error || "Login failed. Please check your credentials.");
      return;
    }
    saveSession(data.token, data.user);
    showWorkspace(data.user, data.token);
  } catch {
    showAlert("Network error. Please try again.");
  } finally {
    setLoading("login-btn", "login-spinner", "login-btn-text", false);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const role = document.getElementById("reg-role").value;

  setLoading("reg-btn", "reg-spinner", "reg-btn-text", true);
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.error || "Registration failed. Please try again.");
      return;
    }
    saveSession(data.token, data.user);
    showWorkspace(data.user, data.token);
  } catch {
    showAlert("Network error. Please try again.");
  } finally {
    setLoading("reg-btn", "reg-spinner", "reg-btn-text", false);
  }
}

function handleLogout() {
  clearSession();
  showAuth();
  switchTab("login");
  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
  document.getElementById("admin-nav-section").classList.add("hidden");
  document.getElementById("admin-users-container").innerHTML =
    '<p class="text-gray-600 text-sm text-center py-8">Click Refresh to load identity records.</p>';
  switchView("home", null);
}

// ─── Protected API Calls ──────────────────────────────────────────────────────

async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

async function fetchProfile() {
  const btn = document.getElementById("btn-profile");
  const panel = document.getElementById("profile-response");
  btn.disabled = true;
  btn.textContent = "Fetching…";
  try {
    const res = await authFetch("/api/users/me");
    const data = await res.json();
    panel.classList.remove("hidden");
    const pre = panel.querySelector("pre");
    pre.textContent = JSON.stringify(data, null, 2);
    pre.className = res.ok
      ? "text-xs font-mono text-emerald-400 break-all whitespace-pre-wrap"
      : "text-xs font-mono text-red-400 break-all whitespace-pre-wrap";
  } catch {
    panel.classList.remove("hidden");
    panel.querySelector("pre").textContent = '{"error":"Network error"}';
    panel.querySelector("pre").className = "text-xs font-mono text-red-400 break-all whitespace-pre-wrap";
  } finally {
    btn.disabled = false;
    btn.textContent = "GET /api/users/me";
  }
}

// ─── Revocation ───────────────────────────────────────────────────────────────

async function revokeUser(userId, rowElement) {
  const btn = rowElement.querySelector(".revoke-btn");
  btn.disabled = true;
  btn.textContent = "Revoking…";

  try {
    const res = await authFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      rowElement.style.transition = "opacity 0.3s";
      rowElement.style.opacity = "0";
      setTimeout(() => rowElement.remove(), 300);
    } else {
      btn.disabled = false;
      btn.textContent = "Revoke Access";
      alert(data.error || "Revocation failed.");
    }
  } catch {
    btn.disabled = false;
    btn.textContent = "Revoke Access";
    alert("Network error during revocation.");
  }
}

function renderUsersTable(users, currentUserId) {
  const container = document.getElementById("admin-users-container");

  if (!users.length) {
    container.innerHTML = `<p class="text-gray-500 text-sm text-center py-8">No users found in the system.</p>`;
    return;
  }

  const roleBadge = (role) => {
    const map = {
      admin: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
      manager: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
      employee: "bg-gray-700/60 text-gray-400 border border-gray-700",
    };
    return map[role] || map.employee;
  };

  const rows = users.map((u) => {
    const isSelf = u.id === currentUserId;
    const actionCell = isSelf
      ? `<td class="px-4 py-3 text-gray-600 text-xs italic">Current session</td>`
      : `<td class="px-4 py-3">
           <button
             class="revoke-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-xs transition-colors disabled:opacity-50"
             onclick="revokeUser('${u.id}', this.closest('tr'))"
           >Revoke Access</button>
         </td>`;

    const initials = u.email.split("@")[0].slice(0, 2).toUpperCase();

    return `<tr class="border-t border-gray-800/60 hover:bg-white/[0.02] transition-colors">
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-300 flex-shrink-0">${initials}</div>
          <span class="text-sm text-gray-200 font-mono">${u.email}</span>
        </div>
      </td>
      <td class="px-4 py-3">
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge(u.role)}">${u.role}</span>
      </td>
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
  if (btn) {
    btn.disabled = true;
    btn.querySelector("svg") && (btn.style.opacity = "0.6");
  }
  try {
    const res = await authFetch("/api/admin/users");
    const data = await res.json();

    if (!res.ok) {
      document.getElementById("admin-users-container").innerHTML =
        `<pre class="text-xs font-mono text-red-400 break-all whitespace-pre-wrap p-2">${JSON.stringify(data, null, 2)}</pre>`;
      return;
    }

    const currentUserId = getUser()?.sub ?? null;
    renderUsersTable(data.users, currentUserId);
  } catch {
    document.getElementById("admin-users-container").innerHTML =
      `<p class="text-red-400 text-sm text-center py-8">Network error — could not load users.</p>`;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

(function init() {
  const token = getToken();
  const user = getUser();
  if (token && user) {
    showWorkspace(user, token);
  } else {
    showAuth();
  }
})();
