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
