import { Request, Response } from 'express'

import { ClassMiddleware, Controller, Post } from '@overnightjs/core'

import { Beach } from '../models/beach'
import mongoose from 'mongoose'
import { authMiddleware } from '@src/middlewares/auth'
import logger from '@src/logger'

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response) {
    try {
      const beach = new Beach({ ...req.body, user: req.decoded?.id })

      const result = await beach.save()

      return res.status(201).send(result)
    } catch (error) {
      logger.error(error)
      if (error instanceof mongoose.Error.ValidationError)
        return res.status(422).send({ error: error.message })

      return res.status(500).send({ error: 'Internal server error' })
    }
  }
}
