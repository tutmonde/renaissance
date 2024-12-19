/**
 * @file Начальная точка приложения
 * @author synzr <mikhail@autism.net.ru>
 */

import pino from 'pino'
import MrimServer from './server/index.js'
import Settings from './settings.js'
import 'dotenv/config'

/**
 * Запуск приложения
 */
export const bootstrap = () => {
  const settings = new Settings()

  // TODO: Возможность настроить уровень логирования
  const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    },
    level: 'debug'
  })

  const server = new MrimServer(settings, logger)

  server.listen(2041)
}

if (process.argv[1] === import.meta.filename) {
  bootstrap()
}
