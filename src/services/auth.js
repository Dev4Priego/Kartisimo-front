const SESSION_KEY = "userSession";
const EXPIRATION_SKEW_SECONDS = 30;

let routerInstance = null;
let redirectingToLogin = false;

export function configureAuth({ router } = {}) {
  routerInstance = router || null;
}

export function saveSession(session) {
  if (!session) {
    clearSession();
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession);
    return session && typeof session === "object" ? session : null;
  } catch (error) {
    clearSession();
    return null;
  }
}

export function getToken() {
  const session = getSession();

  return (
    session?.token ||
    session?.accessToken ||
    session?.jwt ||
    session?.usuario?.token ||
    null
  );
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const decoded = atob(padded);

  try {
    return decodeURIComponent(
      decoded
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch (error) {
    return decoded;
  }
}

export function getTokenPayload(token = getToken()) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload));
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token = getToken(), skewSeconds = EXPIRATION_SKEW_SECONDS) {
  const payload = getTokenPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function isSessionValid() {
  const token = getToken();
  return Boolean(token) && !isTokenExpired(token);
}

export function getAuthorizationHeader() {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

export function redirectToLogin() {
  clearSession();

  if (typeof window === "undefined" || window.location.pathname === "/") {
    return;
  }

  if (redirectingToLogin) {
    return;
  }

  redirectingToLogin = true;

  const releaseRedirectLock = () => {
    window.setTimeout(() => {
      redirectingToLogin = false;
    }, 300);
  };

  if (routerInstance) {
    Promise.resolve(routerInstance.replace("/"))
      .catch(() => {
        window.location.assign("/");
      })
      .finally(releaseRedirectLock);
    return;
  }

  window.location.assign("/");
  releaseRedirectLock();
}
