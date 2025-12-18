import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  AxiosError
} from 'axios'

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  success: boolean;
  message: string;
  error: null | { message: string, [key: string]: any; };
  [key: string]: any;
}

export interface Pagination {
  currentPage: number,
  totalPages: number,
  totalBlogs: number,
  hasNextPage: boolean,
  hasPrevPage: boolean,
  limit: number
}

interface RequestConfig extends AxiosRequestConfig {
  needToken?: boolean;
}

class Request {
  private instance: AxiosInstance
  private baseConfig: AxiosRequestConfig = {
    baseURL: import.meta.dev ? "/bg.life.tires/" : (import.meta.env.VITE_LIFE_URL ?? "https://life.tires/api/"),
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  }

  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create(Object.assign({}, this.baseConfig, config))
    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {

        return config
      },
      (error: AxiosError) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const res = response.data as ApiResponse<any>
        if (res.success) {
          return res as unknown as AxiosResponse
        } else {
          const message = errorHandler(res) || '未知错误'
          useToast().error(message);
          return Promise.reject(new Error(message))
        }
      },
      (error: AxiosError) => {
        const res = error.response?.data as ApiResponse<any>
        const message = errorHandler(res) || '未知错误';
        useToast().error(message);
        return Promise.reject(new Error(message))
      }
    )
  }

  public async request<T = any, D = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    return this.instance.request<any, ApiResponse<T>, D>(config)
  }

  public get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url, params })
  }

  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  public delete<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url, params })
  }

  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }
}

export const api = new Request()

export default Request

/**
 * 错误处理函数
 * @param res 错误的响应
 * @returns 错误信息
 */
function errorHandler(res: ApiResponse<any> | undefined): string {
  if (!res) {
    return '网络请求失败'
  }
  const code = res.code?.toString() || 'unknown'
  let message = res.message || res.error || '请求出错'
  // 错误处理

  return message
}
