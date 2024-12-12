/* eslint-disable @typescript-eslint/no-unused-vars */
import { AddressInfo, createServer, Server, Socket } from 'node:net'

type Callback = (error?: Error) => void

/**
 * Реализация сервера-протокола MRIM.
 * @see https://github.com/tutmonde/mrim-docs
 */
export default class MrimServer {
  private readonly raw: Server

  constructor() {
    const connectionListener = this.connectionListener.bind(this)
    this.raw = createServer(connectionListener)
  }

  /**
   * Слушатель подключений к серверу
   * @param _socket Сырое подключение к клиенту
   */
  private connectionListener(_socket: Socket) {
    void 0 // TODO: Инициализация класса клиента, добавление в регистр клиентов
  }

  public get port(): number | null {
    return this.raw.listening
      ? (this.raw.address() as AddressInfo).port // NOTE: приведение типов, бу
      : null
  }

  /**
   * Прослушивание порта сервера
   *
   * @param port Порт прослушивания
   * @param callback Функция обратного вызова после инициализации прослушивается
   *
   * @returns Сервер
   */
  public listen(port: number, callback?: Callback): MrimServer {
    this.raw.listen(port, callback)
    return this
  }
}
