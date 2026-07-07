import { buildCguUrl, buildLoginUrl } from "canopui";

const AUTH_PORTAL_URL =
  import.meta.env.VITE_AUTH_PORTAL_URL ?? "http://localhost:3200";

export function loginUrl(): string {
  return buildLoginUrl({ authPortalUrl: AUTH_PORTAL_URL });
}

export function cguUrl(legalNoticeAnchor?: string): string {
  return buildCguUrl({ authPortalUrl: AUTH_PORTAL_URL, legalNoticeAnchor });
}
