export interface MicRow {
  row_number: number;
  process_id: string;
  success: boolean;
  api_process_id: string;
  error: string;
  timestamp: string;
  /** Optional run/batch identifier (e.g. "20260906"). Google Sheets may return this as a number; absent on older rows logged before this column existed. */
  execution?: string | number;
}

export interface WabaQualityRow {
  row_number: number;
  timestamp: string;
  quality_rating: string;
  status: string;
  verified_name: string;
  action_taken: string;
  last_row: string;
}

export interface AuditData {
  MIC: MicRow[];
  waba_quality_checks: WabaQualityRow[];
}
