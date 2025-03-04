/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл MRIM-сервера
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Socket } from 'node:net'

import MemoryUserRepository from '../../core/repositories/user/memory.js'
import AuthService from '../../core/services/auth.js'
import MrimExecutor from '../../processor/executors/mrim.js'
import MrimPacketFactory from '../../protocol/factories/mrim.js'
import MrimPacketReader from '../../protocol/readers/mrim.js'
import MrimClient from '../clients/mrim.js'
import ConfigService from '../../core/services/config.js'
import type UserRepository from '../../core/repositories/user/abstract.js'

import TcpServer from './tcp.js'

interface MrimServerOptions {
  configPath?: string
}

/**
 * MRIM-сервер
 */
export default class MrimServer extends TcpServer {
  /**
   * Репозиторий пользователей
   */
  private readonly userRepository: UserRepository

  /**
   * Сервис аутентификации
   */
  private readonly authService: AuthService

  /**
   * Читатель пакетов
   */
  private readonly reader: MrimPacketReader

  /**
   * Фабрика пакетов
   */
  private readonly factory: MrimPacketFactory

  /**
   * Исполнитель команд
   */
  private readonly executor: MrimExecutor

  constructor(options: MrimServerOptions) {
    // NOTE: Создание сервиса конфигурации и получение TCP-порта сервера
    const configService = new ConfigService(options.configPath)
    super({ configService })

    // NOTE: Создание фабрики и читателя пакетов
    this.factory = new MrimPacketFactory({ logger: this.logger })
    this.reader = new MrimPacketReader({ factory: this.factory, logger: this.logger })

    // NOTE: Создание репозиториев
    const userRepositoryStorage = configService.getUserRepositoryStorage()
    switch (userRepositoryStorage) {
      case 'memory':
        this.userRepository = new MemoryUserRepository({ users: [], logger: this.logger })
        break
      default:
        throw new Error(`Unknown user repository storage: ${userRepositoryStorage}`)
    }

    // NOTE: Создание сервисов
    this.authService = new AuthService({
      repository: this.userRepository,
      logger: this.logger,
    })

    // NOTE: Создание исполнителя команд
    this.executor = new MrimExecutor({
      authService: this.authService,
      logger: this.logger,
      configService,
    })
  }

  protected handle(socket: Socket): void {
    const client = new MrimClient({
      socket,
      server: this,
      reader: this.reader,
      factory: this.factory,
      executor: this.executor,
      logger: this.logger,
    })

    this.clients.push(client)
  }
}
