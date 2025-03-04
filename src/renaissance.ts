/**
 * @file Начальная точка приложения
 * @author synzr <mikhail@autism.net.ru>
 */

import path from 'node:path'
import process from 'node:process'

import MrimServer from './network/servers/mrim.js'

import 'dotenv/config'

/**
 * Запуск приложения
 */
export function bootstrap() {
  const server = new MrimServer({
    configPath: path.join(import.meta.dirname, '../config.yaml'),
  })

  server.start()
}

if (process.argv[1] === import.meta.filename) {
  bootstrap()
}
