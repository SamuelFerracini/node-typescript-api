import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IRequestConfig extends AxiosRequestConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any
export interface IResponse<T = any> extends AxiosResponse<T> {}

export class Request {
  constructor(private readonly request = axios) {}

  async get<T>(
    url: string,
    config: IRequestConfig = {}
  ): Promise<IResponse<T>> {
    return this.request.get<T, IResponse<T>>(url, config)
  }

  static isRequestError(error: Error): boolean {
    return !!(
      (error as AxiosError).response && (error as AxiosError).response?.status
    )
  }

  static extractErrorData(
    error: unknown
  ): Pick<AxiosResponse, 'data' | 'status'> {
    const axiosError = error as AxiosError
    if (axiosError.response && axiosError.response.status) {
      return {
        data: axiosError.response.data,
        status: axiosError.response.status
      }
    }

    throw Error(`The error ${error} is not a Request Error`)
  }
}
