import { Request, Response } from 'express'

import { ClassMiddleware, Controller, Post } from '@overnightjs/core'

import { Beach } from '../models/beach'
import mongoose from 'mongoose'
import { authMiddleware } from '@src/middlewares/auth'
import logger from '@src/logger'
import { BaseController } from '.'

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response) {
    try {
      const beach = new Beach({ ...req.body, user: req.decoded?.id })

      const result = await beach.save()

      return res.status(201).send(result)
    } catch (error) {
      return this.sendCreateUpdateErrorResponse(res, error)
    }
  }
}
