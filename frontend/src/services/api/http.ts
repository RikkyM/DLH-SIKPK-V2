import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE;

export const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
});

// http.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (
//       error?.response?.status === 401 &&
//       error?.config?.url?.includes("/api/v1/user")
//     ) {
//       return Promise.resolve(error.response);
//     }
//     return Promise.reject(error);
//   },
// );
