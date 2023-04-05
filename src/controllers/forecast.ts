import { Request, Response } from 'express'

import { Controller, Get } from '@overnightjs/core'

import { Forecast } from '../services/forecast'
import { Beach } from '@src/models/beach'

const forecast = new Forecast()

@Controller('forecast')
export class ForecastController {
  @Get('')
  public async getForecastForgeLoggedUser(_: Request, res: Response) {
    const beaches = await Beach.find({})

    const forecastData = await forecast.processForecastForBeaches(beaches)

    return res.send(forecastData)
  }
}
