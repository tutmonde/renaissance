/**
 * @file Файл исполнителя команд MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import type AuthService from '../../core/services/auth.js'
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

  constructor(options: MrimExecutorOptions) {
    super()
    this.authService = options.authService
  }

  public async execute(
    packet: MrimPacket,
    client: MrimClient,
  ): Promise<boolean | Packet[]> {
    const commandContext = { packet, client }

    switch (packet.header.commandCode) {
      case 0x1001: // NOTE: CS_HELLO
        return await new MrimHelloCommand().execute(commandContext)
      case 0x1006: // NOTE: CS_PING
        return await new MrimPingCommand().execute(commandContext)
      case 0x1038: {
        // NOTE: CS_LOGIN2
        const command = new MrimLoginCommand({ authService: this.authService })
        return await command.execute(commandContext)
      }
      default:
        return Promise.resolve(false)
    }
  }
}
