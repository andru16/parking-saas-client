export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[] | { field?: string; message: string }[] | null;
  timestamp: string;
}
