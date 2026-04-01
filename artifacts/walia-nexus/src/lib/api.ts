import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

export function initApi() {
  // Set base URL to the vite proxy target or relative
  // The API is served under /api
  setBaseUrl(import.meta.env.BASE_URL.replace(/\/$/, ""));
  
  // Set auth token getter
  setAuthTokenGetter(() => {
    return localStorage.getItem("walia_token");
  });
}
