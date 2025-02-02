import { createServer, Socket } from 'node:net'

import Server from './abstract.js'
import TcpClient from '../clients/tcp.js'

/**
 * Настройки TCP-сервера
 */
interface TcpServerOptions {
  port: number
}

/**
 * TCP-сервер
 */
export default class TcpServer extends Server {
  private static clientClass = TcpClient

  /**
   * Сырой TCP-сервер
   */
  private readonly server: ReturnType<typeof createServer>

  /**
   * Список клиентов
   */
  private clients: TcpClient[] = []

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
  protected handle(socket: Socket): void {
    const clientOptions = { socket, server: this }
    const client = new TcpServer.clientClass(clientOptions)

    this.clients.push(client)
  }

  /**
   * Удаление отключенных клиентов
   */
  public removeDisconnectedClients(this: TcpServer): void {
    this.clients = this.clients.filter((client) => client.connected())
  }

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
