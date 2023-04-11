import { Response } from 'express'
import mongoose from 'mongoose'
import { ECUSTOM_VALIDATION } from '@src/models/user'
import logger from '@src/logger'
import APIError, { IAPIError } from '@src/util/errors/api-error'

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(res: Response, error: unknown): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error)
      res.status(clientErrors.code).send(
        APIError.format({
          code: clientErrors.code,
          message: clientErrors.error
        })
      )
    } else {
      logger.error(error)
      res
        .status(500)
        .send(APIError.format({ code: 500, message: 'Something went wrong!' }))
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): {
    code: number
    error: string
  } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) =>
        err.name === 'ValidatorError' &&
        err.kind === ECUSTOM_VALIDATION.DUPLICATED
    )

    if (duplicatedKindErrors.length) return { code: 409, error: error.message }

    return { code: 422, error: error.message }
  }

  protected sendErrorResponse(res: Response, apiError: IAPIError) {
    return res.status(apiError.code).send(APIError.format(apiError))
  }
}
