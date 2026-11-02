const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5001/api";

const SESSION_KEYS = [
  "kampuslyToken", "kampuslyProfile", "kampuslyUser", "kampuslyName",
  "kampuslyEmail", "kampuslyAvatar", "kampuslyWalletNumber",
  "kampuslyBankAccounts", "token",
];

export const STUDENT_PORTAL_ROLES = new Set([
  "student",
  "seller",
  "food_vendor",
  "laundry_provider",
  "grocery_shopper",
]);

export function isStudentPortalRole(role) {
  return STUDENT_PORTAL_ROLES.has(role);
}

export function getToken() {
  return localStorage.getItem("kampuslyToken") || "";
}

export function getStoredProfile() {
  const storedProfile = localStorage.getItem("kampuslyProfile");
  const legacyUser = localStorage.getItem("kampuslyUser");

  try {
    if (storedProfile) return JSON.parse(storedProfile);
    if (legacyUser) {
      const profile = JSON.parse(legacyUser);
      localStorage.setItem("kampuslyProfile", JSON.stringify(profile));
      return profile;
    }
  } catch {
    clearSession();
  }

  return null;
}

export function saveSession(token, user) {
  localStorage.setItem("kampuslyToken", token);
  localStorage.setItem("kampuslyProfile", JSON.stringify(user));
  localStorage.setItem("kampuslyUser", JSON.stringify(user));
}

export function clearSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kampusly:session-expired"));
  }
}

export function isTokenExpired(token = getToken()) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return !Number.isFinite(decoded.exp) || decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function hasUsableStoredSession() {
  const token = getToken();
  const profile = getStoredProfile();

  if (!token || !profile || isTokenExpired(token)) {
    clearSession();
    return false;
  }

  return true;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    if (response.status === 401) {
      clearSession();
    }

    const error = new Error(data.message || "Request failed. Please try again.");
    error.status = response.status;
    throw error;
  }

  return data;
}
