/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл TCP-сервера
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Socket } from 'node:net'
import { createServer } from 'node:net'

import type { Logger } from 'pino'
import { pino } from 'pino'

import type ConfigService from '../../core/services/config.js'
import TcpClient from '../clients/tcp.js'

import Server from './abstract.js'

/**
 * Настройки TCP-сервера
 */
export interface TcpServerOptions {
  configService: ConfigService
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
   * Порт прослушивания
   */
  private readonly port: number

  /**
   * Список клиентов
   */
  protected clients: TcpClient[] = []

  /**
   * Сервис конфигурации
   */
  protected readonly configService: ConfigService

  /**
   * Логгер
   */
  protected readonly logger: Logger

  constructor(options: TcpServerOptions) {
    super()

    this.configService = options.configService

    this.server = createServer(this.handle.bind(this))
    this.port = this.configService.getServerPort()

    this.logger = pino({
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
      level: this.configService.getLogLevel(),
    })
    this.logger.debug('TcpServer: initialized')
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
    this.logger.info(`TcpServer: started; port ${this.port}`)
  }

  public stop(this: TcpServer): void {
    this.server.close()
    this.logger.info('TcpServer: stopped')
  }
}
