import httpStatusCodes from 'http-status-codes'

export interface IAPIError {
  message: string
  code: number
  codeAsString?: string
  description?: string
  documentation?: string
}

export interface IAPIErrorResponse extends Omit<IAPIError, 'codeAsString'> {
  error: string
}

export default class APIError {
  public static format(error: IAPIError): IAPIErrorResponse {
    return {
      message: error.message,
      code: error.code,
      error: error.codeAsString
        ? error.codeAsString
        : httpStatusCodes.getStatusText(error.code),
      documentation: error.documentation ?? undefined,
      description: error.description ?? undefined
    }
  }
}
