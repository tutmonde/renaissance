import { AddressInfo, createServer, Server, Socket } from 'node:net'
import MrimClientRegistry from './registry.js'
import MrimClient from './client.js'

type Callback = (error?: Error) => void

/**
 * Реализация MRIM-сервера
 * @see https://github.com/tutmonde/mrim-docs
 */
export default class MrimServer {
  public readonly registry: MrimClientRegistry
  private readonly raw: Server

  constructor() {
    this.registry = new MrimClientRegistry()

    const connectionListener = this.connectionListener.bind(this)
    this.raw = createServer(connectionListener)
  }

  /**
   * Слушатель подключений к серверу
   * @param socket Сырое подключение к клиенту
   */
  private connectionListener(socket: Socket): void {
    const client = new MrimClient(socket, this)
    this.registry.register(client)
  }

  /**
   * Порт прослушивателя сервера
   */
  public get port(): number | null {
    return this.raw.listening
      ? (this.raw.address() as AddressInfo).port // NOTE: приведение типов, бу
      : null
  }

  /**
   * Прослушивание порта сервера
   *
   * @param port Порт прослушивания
   * @param callback Функция обратного вызова после инициализации прослушивателя
   *
   * @returns Сервер
   */
  public listen(port: number, callback?: Callback): MrimServer {
    this.raw.listen(port, callback)
    return this
  }
}
