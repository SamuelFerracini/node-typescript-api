import './util/module-alias'

import expressPino from 'express-pino-logger'
import { Server } from '@overnightjs/core'
import bodyParser from 'body-parser'
import * as http from 'http'
import cors from 'cors'

import { ForecastController } from './controllers/forecast'
import { BeachesController } from './controllers/beaches'
import { UsersController } from './controllers/users'
import { AuthController } from './controllers/auth'

import * as database from './database'
import logger from './logger'

export class SetupServer extends Server {
  private server?: http.Server

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
    this.app.use(
      expressPino({
        logger
      })
    )
    this.app.use(
      cors({
        origin: '*'
      })
    )
  }

  private setupControllers() {
    const forecastController = new ForecastController()
    const beachesController = new BeachesController()
    const usersController = new UsersController()
    const authController = new AuthController()

    this.addControllers([
      forecastController,
      beachesController,
      usersController,
      authController
    ])
  }

  private async setupDatabase() {
    await database.connect()
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      logger.info('Server listening on port: ' + this.port)
    })
  }

  public async close(): Promise<void> {
    await database.close()
    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server?.close((err) => {
          if (err) return reject(err)

          resolve(true)
        })
      })
    }
  }

  public getApp() {
    return this.app
  }
}
