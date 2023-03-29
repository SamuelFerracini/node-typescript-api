import bodyParser from 'body-parser'
import './util/module-alias'

import { Server } from '@overnightjs/core'
import { ForecastController } from './controllers/forecast.controller'

export class SetupServer extends Server {
  constructor(private readonly port = 3000) {
    super()
  }

  public init() {
    this.setupExpress()
    this.setupControllers()
  }

  private setupExpress() {
    this.app.use(bodyParser.json())
  }

  private setupControllers() {
    const forecastController = new ForecastController()

    this.addControllers([forecastController])
  }

  public getApp() {
    return this.app
  }
}
