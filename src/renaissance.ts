/**
 * @file Начальная точка приложения
 * @author synzr <mikhail@autism.net.ru>
 */

import process from 'node:process'

import MrimServer from './network/servers/mrim.js'

import 'dotenv/config'

// import Settings from './settings.js'
// import pino from 'pino'

/**
 * Запуск приложения
 */
export function bootstrap() {
  // const settings = new Settings()
  // const logger = pino({
  //   transport: {
  //     target: 'pino-pretty',
  //     options: { colorize: true }
  //   },
  //   level: settings.logLevel
  // })

  const server = new MrimServer({ port: 2041 })
  server.start()
}

if (process.argv[1] === import.meta.filename) {
  bootstrap()
}
