import MrimServer from './server.js'

export const bootstrap = () => {
  // TODO: Конструктор сервера, настройка сервера через переменные окружения
  const server = new MrimServer()
  server.listen(2041)
}

if (require.main === module) {
  bootstrap()
}
