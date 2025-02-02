import { createServer, Socket } from 'node:net'

import Server from './abstract.js'

/**
 * Настройки абстрактного TCP-сервера
 */
interface TcpServerOptions {
  port: number
}

/**
 * Абстрактный TCP-сервер
 */
export default abstract class TcpServer extends Server {
  /**
   * Сырой TCP-сервер
   */
  private readonly server: ReturnType<typeof createServer>

  /**
   * Порт прослушивания
   */
  private readonly port: number

  constructor(options: TcpServerOptions) {
    super()

    this.server = createServer()
    this.port = options.port
  }

  /**
   * Обработчик подключения
   * @param socket Сокет подключения
   */
  protected abstract handle(socket: Socket): void

  public running(this: TcpServer): boolean {
    return this.server.listening
  }

  public start(this: TcpServer): void {
    this.server.listen(this.port)
  }

  public stop(this: TcpServer): void {
    this.server.close()
  }
}
