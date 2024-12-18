/**
 * @file Начальная точка приложения
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimServer from './server/index.js'
import Settings from './settings.js'
import 'dotenv/config'

/**
 * Запуск приложения
 */
export const bootstrap = () => {
  const settings = new Settings()
  const server = new MrimServer(settings)

  server.listen(2041)
}

if (process.argv[1] === import.meta.filename) {
  bootstrap()
}
