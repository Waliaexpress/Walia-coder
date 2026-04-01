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

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function showAlert(message, type = "error") {
  const box = document.getElementById("alert-box");
  box.className = [
    "mb-5 px-4 py-3 rounded-lg text-sm font-medium",
    type === "error"
      ? "bg-red-50 text-red-700 border border-red-200"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200",
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
  const alertBox = document.getElementById("alert-box");

  alertBox.classList.add("hidden");

  const activeTab = "text-amber-500 border-b-2 border-amber-500 font-semibold";
  const inactiveTab = "text-slate-400 border-b-2 border-transparent hover:text-slate-600 font-semibold";

  if (tab === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginTab.className = `flex-1 py-4 text-sm transition-all duration-200 ${activeTab}`;
    registerTab.className = `flex-1 py-4 text-sm transition-all duration-200 ${inactiveTab}`;
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    loginTab.className = `flex-1 py-4 text-sm transition-all duration-200 ${inactiveTab}`;
    registerTab.className = `flex-1 py-4 text-sm transition-all duration-200 ${activeTab}`;
  }
}

function roleBadgeClasses(role) {
  const map = {
    admin: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    manager: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    employee: "bg-slate-600/50 text-slate-300 border border-slate-600",
  };
  return map[role] || map.employee;
}

function showDashboard(user, token) {
  document.getElementById("auth-panel").classList.add("hidden");
  const dash = document.getElementById("dashboard-panel");
  dash.classList.remove("hidden");

  document.getElementById("dash-email").textContent = user.email;

  const badge = document.getElementById("dash-role-badge");
  badge.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  badge.className = `inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${roleBadgeClasses(user.role)}`;

  const initials = user.email.split("@")[0].slice(0, 2).toUpperCase();
  document.getElementById("avatar-initials").textContent = initials;

  document.getElementById("token-preview").textContent = token;
}

function showAuth() {
  document.getElementById("auth-panel").classList.remove("hidden");
  document.getElementById("dashboard-panel").classList.add("hidden");
}

// ─── API Calls ────────────────────────────────────────────────────────────────

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
    showDashboard(data.user, data.token);
  } catch (err) {
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
    showDashboard(data.user, data.token);
  } catch (err) {
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
}

// ─── Protected API Calls ──────────────────────────────────────────────────────

async function authFetch(url) {
  const token = getToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
}

function renderApiResponse(panelId, data, isError) {
  const panel = document.getElementById(panelId);
  panel.classList.remove("hidden");
  const pre = panel.querySelector("pre");
  pre.textContent = JSON.stringify(data, null, 2);
  pre.className = isError
    ? "text-xs font-mono text-red-400 break-all whitespace-pre-wrap"
    : "text-xs font-mono text-emerald-400 break-all whitespace-pre-wrap";
}

async function fetchProfile() {
  const btn = document.getElementById("btn-profile");
  btn.disabled = true;
  btn.textContent = "Fetching…";
  try {
    const res = await authFetch("/api/users/me");
    const data = await res.json();
    renderApiResponse("profile-response", data, !res.ok);
  } catch (err) {
    renderApiResponse("profile-response", { error: "Network error" }, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Fetch My Profile";
  }
}

async function revokeUser(userId, rowElement) {
  const token = getToken();
  const btn = rowElement.querySelector(".revoke-btn");
  btn.disabled = true;
  btn.textContent = "Revoking…";

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (res.ok) {
      rowElement.remove();
    } else {
      btn.disabled = false;
      btn.textContent = "Revoke Access";
      alert(data.error || "Revocation failed.");
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Revoke Access";
    alert("Network error during revocation.");
  }
}

function renderUsersTable(users, currentUserId) {
  const container = document.getElementById("admin-users-container");

  if (!users.length) {
    container.innerHTML = `<p class="text-slate-400 text-sm">No users found.</p>`;
    return;
  }

  const roleColor = (role) => {
    if (role === "admin") return "bg-amber-500/20 text-amber-400";
    if (role === "manager") return "bg-blue-500/20 text-blue-400";
    return "bg-slate-700 text-slate-300";
  };

  const rows = users.map((u) => {
    const isSelf = u.id === currentUserId;
    const actionCell = isSelf
      ? `<td class="px-3 py-2 text-slate-500 text-sm italic">Current session</td>`
      : `<td class="px-3 py-2">
           <button
             class="revoke-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
             onclick="revokeUser('${u.id}', this.closest('tr'))"
           >Revoke Access</button>
         </td>`;

    return `<tr class="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
      <td class="px-3 py-2 text-slate-200 text-sm font-mono">${u.email}</td>
      <td class="px-3 py-2">
        <span class="px-2 py-0.5 rounded text-xs font-semibold ${roleColor(u.role)}">${u.role}</span>
      </td>
      <td class="px-3 py-2 text-slate-400 text-xs">${new Date(u.createdAt).toLocaleDateString()}</td>
      ${actionCell}
    </tr>`;
  });

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="text-slate-500 text-xs uppercase tracking-wider">
            <th class="px-3 py-2">Email</th>
            <th class="px-3 py-2">Role</th>
            <th class="px-3 py-2">Joined</th>
            <th class="px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>`;
}

async function fetchAdminPanel() {
  const btn = document.getElementById("btn-admin");
  btn.disabled = true;
  btn.textContent = "Fetching…";
  try {
    const res = await authFetch("/api/admin/users");
    const data = await res.json();

    const panel = document.getElementById("admin-response");
    panel.classList.remove("hidden");

    if (!res.ok) {
      document.getElementById("admin-users-container").innerHTML =
        `<pre class="text-xs font-mono text-red-400 break-all whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>`;
      return;
    }

    const currentUserId = getUser()?.sub ?? null;
    renderUsersTable(data.users, currentUserId);
  } catch (err) {
    const panel = document.getElementById("admin-response");
    panel.classList.remove("hidden");
    document.getElementById("admin-users-container").innerHTML =
      `<pre class="text-xs font-mono text-red-400">Network error</pre>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Access Admin Panel";
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

(function init() {
  const token = getToken();
  const user = getUser();
  if (token && user) {
    showDashboard(user, token);
  } else {
    showAuth();
  }
})();
