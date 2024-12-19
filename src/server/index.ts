/**
 * @file Реализация MRIM-сервера
 * @author synzr <mikhail@autism.net.ru>
 */

import { AddressInfo, createServer, Server, Socket } from 'node:net'
import MrimClientRegistry from './registry.js'
import MrimClient from '../client/index.js'
import Settings from '../settings.js'
import { Logger } from 'pino'

type Callback = (error?: Error) => void

/**
 * MRIM-сервер
 * @see https://github.com/tutmonde/mrim-docs
 */
export default class MrimServer {
  /**
   * Регистр клиентов
   */
  public readonly registry: MrimClientRegistry
  /**
   * Глобальные настройки
   */
  public readonly settings: Settings
  /**
   * Глобальный логгер
   */
  public readonly logger: Logger

  private readonly raw: Server

  public constructor(settings: Settings, logger: Logger) {
    this.registry = new MrimClientRegistry()
    this.registry.on('register', this.onRegistryRegister.bind(this))
    this.registry.on('deregister', this.onRegistryDeregister.bind(this))

    this.settings = settings
    this.logger = logger

    const connectionListener = this.connectionListener.bind(this)
    this.raw = createServer(connectionListener)
  }

  //#region Обработчики событии регистра
  /**
   * Обработчик события регистрации клиента в регистре
   * @param client Клиент
   */
  private onRegistryRegister(client: MrimClient): void {
    this.logger.info({ clientId: client.id }, `Client registered: ${client.id}`)
  }

  /**
   * Обработчик события удаления клиента из регистра
   * @param client Клиент
   */
  private onRegistryDeregister(client: MrimClient): void {
    this.logger.info(
      { clientId: client.id },
      `Client deregistered: ${client.id}`
    )
  }
  //#endregion

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
    this.logger.info({ listeningPort: port }, `Listening on port ${port}`)

    return this
  }
}
