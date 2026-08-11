import {
  registerUser,
  loginUser,
  fetchMe,
  logoutUser,
} from "../api/auth.api";

import {
  setAccessToken,
  refreshAccessToken,
} from "../../../api/client";

/* =========================================================
   CURRENT USER
========================================================= */

export async function fetchCurrentUser() {
  const res = await fetchMe();

  return res.data.user;
}

/* =========================================================
   REGISTER
========================================================= */

export async function register({
  name,
  email,
  password,
}) {
  const res = await registerUser({
    name,
    email,
    password,
  });

  setAccessToken(
    res.data.accessToken
  );

  return res.data.user;
}

/* =========================================================
   LOGIN
========================================================= */

export async function login({
  email,
  password,
}) {
  const res = await loginUser({
    email,
    password,
  });

  setAccessToken(
    res.data.accessToken
  );

  return res.data.user;
}

/* =========================================================
   REFRESH
========================================================= */

export async function refreshSession() {
  await refreshAccessToken();

  return fetchCurrentUser();
}

/* =========================================================
   LOGOUT
========================================================= */

export async function logout() {
  try {
    await logoutUser();
  } finally {
    setAccessToken(null);
  }
}