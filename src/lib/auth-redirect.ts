const AUTH_PORTAL_URL =
  import.meta.env.VITE_AUTH_PORTAL_URL ?? "http://localhost:3000";

export function loginUrl(): string {
  const redirect = encodeURIComponent(window.location.href);
  return `${AUTH_PORTAL_URL}/login?redirect=${redirect}`;
}
