import axios from "axios";
import {
  getToken,
  isTokenExpired,
  redirectToLogin,
} from "./auth";

let installed = false;
let originalFetch = null;

function getRequestUrl(input) {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  if (input?.url) {
    return input.url;
  }

  return "";
}

function isApiRequest(url) {
  return typeof url === "string" && (url.includes("/api/") || url.startsWith("api/"));
}

function hasUsableAuthorization(value) {
  return Boolean(value) && !/Bearer\s+(undefined|null)?\s*$/i.test(value);
}

function withAuthHeader(input, init = {}) {
  const token = getToken();

  if (!token) {
    return init;
  }

  const requestHeaders = input instanceof Request ? input.headers : undefined;
  const headers = new Headers(init.headers || requestHeaders || {});
  const currentAuthorization = headers.get("Authorization");

  if (!hasUsableAuthorization(currentAuthorization)) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    ...init,
    headers,
  };
}

function rejectExpiredSession() {
  redirectToLogin();
  return Promise.reject(new Error("La sesion expiro."));
}

export function installHttpAuth() {
  if (installed || typeof window === "undefined" || !window.fetch) {
    return;
  }

  installed = true;
  originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url = getRequestUrl(input);
    const shouldHandleAuth = isApiRequest(url);
    let requestOptions = init;

    if (shouldHandleAuth) {
      const token = getToken();

      if (token) {
        if (isTokenExpired(token)) {
          return rejectExpiredSession();
        }

        requestOptions = withAuthHeader(input, init);
      }
    }

    const response = await originalFetch(input, requestOptions);

    if (shouldHandleAuth && response.status === 401) {
      redirectToLogin();
    }

    return response;
  };

  axios.interceptors.request.use((config) => {
    const url = config?.url || "";

    if (!isApiRequest(url) && !config?.baseURL) {
      return config;
    }

    const token = getToken();

    if (!token) {
      return config;
    }

    if (isTokenExpired(token)) {
      return rejectExpiredSession();
    }

    config.headers = config.headers || {};

    const currentAuthorization = config.headers.Authorization || config.headers.authorization;

    if (!hasUsableAuthorization(currentAuthorization)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        redirectToLogin();
      }

      return Promise.reject(error);
    }
  );
}
