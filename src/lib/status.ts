import type { CanopStatusTone } from "canopui";
import type { AccountStatus } from "../api/admin";

export const statusTone: Record<AccountStatus, CanopStatusTone> = {
  active: "success",
  pending_validation: "warning",
  disabled: "error",
};
