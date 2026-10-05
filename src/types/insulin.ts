export type StockAlertLevel =
  | "ok"
  | "low"
  | "critical"
  | "unknown";

export type ContainerAlertLevel =
  | "ok"
  | "expiring_soon"
  | "expired";

export type InsulinType =
  | "Regular"
  | "NPH"
  | "Glargina"
  | "Lispro";

export type Insulin = {
  id: number;
  name: string;
  insulin_type: InsulinType | null;
  concentration_units_per_ml: string;
  container_volume_ml: string;
  open_validity_days: number;
  active: boolean;
  created_at: string;
};

export type InsulinSummary = {
  insulin_id: number;
  insulin_name: string;
  current_stock_units: string;
  average_daily_consumption_units: string | null;
  history_days_used: number;
  estimated_days_remaining: string | null;
  estimated_end_date: string | null;
  projection_available: boolean;
  stock_alert_level: StockAlertLevel;
  container_alert_level: ContainerAlertLevel;
  container_alert_days: number | null;
};

export type InsulinWithSummary = {
  insulin: Insulin;
  summary: InsulinSummary;
};

export type CreateInsulinPayload = {
  name: string;
  insulin_type: InsulinType;
  concentration_units_per_ml: number;
  container_volume_ml: number;
  open_validity_days: number;
};

export type UpdateInsulinPayload =
  CreateInsulinPayload & {
    active: boolean;
  };