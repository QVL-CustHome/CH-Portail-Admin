import { request } from "./client";

export interface Role {
  id: string;
  name: string;
  created_at: string;
}

export interface CreateRoleInput {
  name: string;
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
