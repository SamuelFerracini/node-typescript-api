import { Request, Response, NextFunction } from 'express'

import AuthService from '@src/services/auth'
import logger from '@src/logger'
import { error } from 'console'

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
) {
  const token = req.headers?.['x-access-token']

  try {
    const decoded = AuthService.decodeToken(token as string)

    req.decoded = decoded

    next()
  } catch (err) {
    logger.error(err)

    if (err instanceof Error)
      res.status?.(401).send({ code: 401, error: err.message })
    else res.status?.(401).send({ code: 401, error: 'Unknown auth error' })
  }
}
