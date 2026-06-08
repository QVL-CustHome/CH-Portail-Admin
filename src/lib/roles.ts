import type { Me } from "../api/auth";

export const ADMIN_ROLE = "admin";

export function isPortalAdmin(me: Me): boolean {
  return me.roles?.includes(ADMIN_ROLE) ?? false;
}
