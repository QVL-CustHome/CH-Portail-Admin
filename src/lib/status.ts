import type { ChStatusTone } from "canopui";
import type { AccountStatus } from "../api/admin";

export const statusTone: Record<AccountStatus, ChStatusTone> = {
  active: "success",
  pending_validation: "warning",
  disabled: "error",
};
