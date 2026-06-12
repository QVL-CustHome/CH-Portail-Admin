import { request } from "./client";

export type AccountStatus = "active" | "pending_validation" | "disabled";

export interface AdminUser {
  user_id: string;
  name: string;
  email: string;
  roles: string[];
  status: AccountStatus;
  whitelist_only: boolean;
  allowed_ips: string[];
  created_at: string;
}

export interface UserListResponse {
  users: AdminUser[];
  page: number;
  limit: number;
  total: number;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  email?: string;
  status?: AccountStatus;
}

export function listUsers(params: ListUsersParams = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.email) qs.set("email", params.email);
  if (params.status) qs.set("status", params.status);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request<UserListResponse>(`/admin/users${suffix}`);
}

export function listPendingUsers() {
  return request<UserListResponse>("/admin/users/pending");
}

export function updateUserStatus(id: string, status: AccountStatus) {
  return request<AdminUser>(`/admin/users/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function updateUser(id: string, name: string, email: string) {
  return request<AdminUser>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, email }),
  });
}

export function updateUserRoles(id: string, roles: string[]) {
  return request<AdminUser>(`/admin/users/${id}/roles`, {
    method: "PUT",
    body: JSON.stringify({ roles }),
  });
}

export function updateUserPassword(id: string, password: string) {
  return request<void>(`/admin/users/${id}/password`, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });
}

export function updateUserWhitelist(id: string, whitelistOnly: boolean, allowedIps: string[]) {
  return request<AdminUser>(`/admin/users/${id}/whitelist`, {
    method: "PUT",
    body: JSON.stringify({ whitelist_only: whitelistOnly, allowed_ips: allowedIps }),
  });
}

export function deleteUser(id: string) {
  return request<void>(`/admin/users/${id}`, { method: "DELETE" });
}
