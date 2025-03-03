import type { Socket } from 'node:net'
import { createServer } from 'node:net'

import TcpClient from '../clients/tcp.js'

import Server from './abstract.js'

/**
 * Настройки TCP-сервера
 */
export interface TcpServerOptions {
  port: number
}

/**
 * TCP-сервер
 */
export default class TcpServer extends Server {
  /**
   * Сырой TCP-сервер
   */
  private readonly server: ReturnType<typeof createServer>

  /**
   * Список клиентов
   */
  protected clients: TcpClient[] = []

  /**
   * Порт прослушивания
   */
  private readonly port: number

  constructor(options: TcpServerOptions) {
    super()

    this.server = createServer(this.handle.bind(this))
    this.port = options.port
  }

  /**
   * Обработчик подключения
   * @param socket Сокет подключения
   */
  protected handle(socket: Socket): void {
    const clientOptions = { socket, server: this }
    const client = new TcpClient(clientOptions)

    this.clients.push(client)
  }

  /**
   * Удаление отключенных клиентов
   */
  public removeDisconnectedClients(this: TcpServer): void {
    this.clients = this.clients.filter(client => client.connected())
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
