import bodyParser from 'body-parser'
import './util/module-alias'

import { Server } from '@overnightjs/core'

import { ForecastController } from './controllers/forecast'
import { BeachesController } from './controllers/beaches'

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
    const beachesController = new BeachesController()

    this.addControllers([forecastController, beachesController])
  }

  private async setupDatabase() {
    await database.connect()
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.info('Server listening on port: ' + this.port)
    })
  }

  public async close() {
    await database.close()
  }

  public getApp() {
    return this.app
  }
}
