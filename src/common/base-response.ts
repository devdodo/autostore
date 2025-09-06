export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}


