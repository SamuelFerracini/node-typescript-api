import bodyParser from 'body-parser'
import './util/module-alias'

import { Server } from '@overnightjs/core'
import { ForecastController } from './controllers/forecast.controller'

import * as database from './database'

export class SetupServer extends Server {
  constructor(private readonly port = 3000) {
    super()
  }

  public async init() {
    this.setupExpress()
    this.setupControllers()

    await this.setupDatabase()
  }

  private setupExpress() {
    this.app.use(bodyParser.json())
  }

  private setupControllers() {
    const forecastController = new ForecastController()

    this.addControllers([forecastController])
  }

  private async setupDatabase() {
    await database.connect()
  }

  public async close() {
    await database.close()
  }

  public getApp() {
    return this.app
  }
}
