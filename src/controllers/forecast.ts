import { Request, Response } from 'express'

import { ClassMiddleware, Controller, Get } from '@overnightjs/core'

import { authMiddleware } from '@src/middlewares/auth'
import { Forecast } from '@src/services/forecast'
import { Beach } from '@src/models/beach'

const forecast = new Forecast()

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  @Get('')
  public async getForecastForgeLoggedUser(req: Request, res: Response) {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id })

      const forecastData = await forecast.processForecastForBeaches(beaches)

      return res.send(forecastData)
    } catch (error) {
      return res.status(500).send({ error: 'Internal server error' })
    }
  }
}
