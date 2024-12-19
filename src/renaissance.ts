/**
 * @file Начальная точка приложения
 * @author synzr <mikhail@autism.net.ru>
 */

import 'dotenv/config'

import MrimServer from './server/index.js'
import Settings from './settings.js'
import pino from 'pino'

/**
 * Запуск приложения
 */
export const bootstrap = () => {
  const settings = new Settings()
  const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    },
    level: settings.logLevel
  })

  const server = new MrimServer(settings, logger)

  server.listen(2041)
}

if (process.argv[1] === import.meta.filename) {
  bootstrap()
}
