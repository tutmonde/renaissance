/**
 * @file Файл исполнителя команд MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimClient from '../../network/clients/mrim.js'

import { MrimPacket } from '../../protocol/factories/mrim.js'
import { Packet } from '../../protocol/packet.js'

import HelloCommand from '../commands/mrim/hello.js'
import PingCommand from '../commands/mrim/ping.js'

import AuthService from '../../core/services/auth.js'

import Executor from './abstract.js'
import LoginCommand from '../commands/mrim/login.js'

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

  public execute(
    packet: MrimPacket,
    client: MrimClient
  ): Promise<boolean | Packet[]> {
    const commandContext = { packet, client }

    switch (packet.header.commandCode) {
      case 0x1001: // NOTE: CS_HELLO
        return new HelloCommand().execute(commandContext)
      case 0x1006: // NOTE: CS_PING
        return new PingCommand().execute(commandContext)
      case 0x1038: {
        // NOTE: CS_LOGIN2
        const command = new LoginCommand({ authService: this.authService })
        return command.execute(commandContext)
      }
      default:
        return Promise.resolve(false)
    }
  }
}
