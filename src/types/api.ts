/**
 * Canonical API response envelope.
 *
 * Mirrors the backend `org.os.gitbase.common.ApiResponseEntity<T>` and the
 * `ApiResponse*` schemas in `backend/docs/openapi.yaml` (the single source of truth).
 *
 * Every endpoint returns this shape. Service methods unwrap `.data.data` to hand
 * callers the bare payload `T`.
 */
export interface ApiResponse<T> {
  timestamp: string | null;
  success: boolean;
  message: string | null;
  httpStatus: string;
  error?: string | null;
  data: T;
}
