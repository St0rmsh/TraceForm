import { apiFetch } from "../../../api/client";

/* =========================
   REGISTER
========================= */

export function registerUser({ name, email, password }) {
  return apiFetch("/auth/register", {
    method: "POST",

    body: JSON.stringify({
      name,
      email,
      password,
    }),

    skipAuth: true,
  });
}

/* =========================
   LOGIN
========================= */

export function loginUser({ email, password }) {
  return apiFetch("/auth/login", {
    method: "POST",

    body: JSON.stringify({
      email,
      password,
    }),

    skipAuth: true,
  });
}

/* =========================
   GET CURRENT USER
========================= */

export function fetchMe() {
  return apiFetch("/auth/me");
}

/* =========================
   LOGOUT
========================= */

export function logoutUser() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}