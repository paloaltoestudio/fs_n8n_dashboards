export interface MicRow {
  row_number: number;
  process_id: string;
  success: boolean;
  api_process_id: string;
  error: string;
  timestamp: string;
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
