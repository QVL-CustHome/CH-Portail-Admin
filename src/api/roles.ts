import { request } from "./client";

export type Portal = "admin" | "drive" | "home";
export type RoleKind = "portal" | "sub";

export const PORTALS: Portal[] = ["admin", "drive", "home"];

export interface Role {
  id: string;
  name: string;
  portal: Portal;
  kind: RoleKind;
  created_at: string;
}

export interface CreateRoleInput {
  name: string;
  portal: Portal;
}

export function listRoles() {
  return request<Role[]>("/admin/roles");
}

export function createRole(input: CreateRoleInput) {
  return request<Role>("/admin/roles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteRole(id: string) {
  return request<void>(`/admin/roles/${id}`, { method: "DELETE" });
}
