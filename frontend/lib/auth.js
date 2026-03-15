import { apiRequest } from "@/lib/api";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export async function fetchCurrentUser(role) {
  const token = getToken();

  if (!token || !role) {
    throw new Error("Not authenticated");
  }

  return await apiRequest(`/${role}/me`, "GET", {}, token);
}