/**
 * @file Файл исполнителя команд MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Logger } from 'pino'

import type AuthService from '../../core/services/auth.js'
import type ConfigService from '../../core/services/config.js'
import type MrimClient from '../../network/clients/mrim.js'
import type { MrimPacket } from '../../protocol/factories/mrim.js'
import type { Packet } from '../../protocol/shared/packet.js'
import MrimHelloCommand from '../commands/mrim/hello.js'
import MrimLoginCommand from '../commands/mrim/login.js'
import MrimPingCommand from '../commands/mrim/ping.js'

import Executor from './abstract.js'

/**
 * Настройки исполнителя команд MRIM
 */
interface MrimExecutorOptions {
  authService: AuthService
  configService: ConfigService
  logger: Logger
}

/**
 * Исполнитель команд MRIM
 */
// TODO(synzr): Очередь FIFO с параллельными выполнениям
export default class MrimExecutor extends Executor {
  /**
   * Сервис аутентификации
   */
  private readonly authService: AuthService

  /**
   * Сервис конфигурации
   */
  private readonly configService: ConfigService

  /**
   * Логгер
   */
  private readonly logger: Logger

  constructor(options: MrimExecutorOptions) {
    super()

    this.authService = options.authService
    this.configService = options.configService
    this.logger = options.logger
  }

  public async execute(
    packet: MrimPacket,
    client: MrimClient,
  ): Promise<boolean | Packet[]> {
    const commandContext = { packet, client }

    switch (packet.header.commandCode) {
      case 0x1001: {
        const command = new MrimHelloCommand({
          logger: this.logger,
          configService: this.configService,
        })
        return await command.execute(commandContext)
      }
      case 0x1006: {
        const command = new MrimPingCommand({ logger: this.logger })
        return await command.execute(commandContext)
      }
      case 0x1038: {
        const command = new MrimLoginCommand({
          authService: this.authService,
          logger: this.logger,
        })
        return await command.execute(commandContext)
      }
      default:
        this.logger.warn(
          `MrimExecutor: unknown command; code = ${packet.header.commandCode}`,
        )
        return Promise.resolve(false)
    }
  }
}
