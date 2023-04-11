import { SetupServer } from './server'
import logger from './logger'
import config from 'config'

enum EExitStatus {
  FAILURE = 1,
  SUCCESS = 0
}

// Listen to unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  )
  // lets throw the error and let the uncaughtException handle below handle it
  throw reason
})

process.on('uncaughtException', (error) => {
  logger.error(`App exiting due to an uncaught exception: ${error}`)
  process.exit(EExitStatus.FAILURE)
})
;(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'))
    await server.init()
    server.start()

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']
    exitSignals.map((sig) =>
      process.on(sig, async () => {
        try {
          await server.close()
          logger.info(`App exited with SUCCESS`)
          process.exit(EExitStatus.SUCCESS)
        } catch (error) {
          logger.error(`App exited with error: ${error}`)
          process.exit(EExitStatus.FAILURE)
        }
      })
    )
  } catch (error) {
    logger.error(`App exited with error: ${error}`)
    process.exit(EExitStatus.FAILURE)
  }
})()
