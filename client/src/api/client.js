const BASE_URL = "/api";

let accessToken = null;
let refreshPromise = null;

/* =========================================================
   ACCESS TOKEN
========================================================= */

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

/* =========================================================
   REFRESH ACCESS TOKEN
========================================================= */

export async function refreshAccessToken() {
  /*
   * Prevent multiple simultaneous refresh requests.
   *
   * Example:
   *
   * /posts      → 401 ┐
   * /profile    → 401 ├──→ ONE /refresh
   * /projects   → 401 ┘
   */
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(
      `${BASE_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      setAccessToken(null);

      const error = new Error(
        data?.message || "Refresh failed"
      );

      error.status = response.status;
      error.errors = data?.errors;

      throw error;
    }

    const token =
      data?.data?.accessToken;

    if (!token) {
      setAccessToken(null);

      throw new Error(
        "Refresh response did not contain an access token"
      );
    }

    setAccessToken(token);

    return token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/* =========================================================
   API FETCH
========================================================= */

export async function apiFetch(
  path,
  options = {}
) {
  const {
    skipAuth = false,
    _isRetry = false,
    ...fetchOptions
  } = options;

  const headers = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  /*
   * Attach access token.
   */
  if (!skipAuth && accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${BASE_URL}${path}`,
    {
      ...fetchOptions,
      headers,
      credentials: "include",
    }
  );

  /*
   * Access token expired.
   *
   * Refresh once and retry.
   */
  if (
    response.status === 401 &&
    !skipAuth &&
    !_isRetry
  ) {
    try {
      await refreshAccessToken();

      return apiFetch(path, {
        ...options,
        _isRetry: true,
      });
    } catch (error) {
      setAccessToken(null);
      throw error;
    }
  }

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        `Request failed: ${response.status}`
    );

    error.status = response.status;
    error.errors = data?.errors;

    throw error;
  }

  return data;
}