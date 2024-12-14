import MrimServer from './server/index.js'

export const bootstrap = () => {
  // TODO: Конструктор сервера, настройка сервера через переменные окружения
  const server = new MrimServer()
  server.listen(2041)
}

if (process.argv[1] === import.meta.filename) {
  bootstrap()
}
