/**
 * @file Файл исполнителя команд MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimClient from '../../network/clients/mrim.js'

import { MrimPacket } from '../../protocol/factories/mrim.js'
import { Packet } from '../../protocol/packet.js'

import HelloCommand from '../commands/mrim/hello.js'
import PingCommand from '../commands/mrim/ping.js'

import Executor from './abstract.js'

/**
 * Исполнитель команд MRIM
 */
export default class MrimExecutor extends Executor {
  // TODO(synzr): Выполнение команд по очереди FIFO
  //              с ограничением на количество параллельных запросов
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
      default:
        return Promise.resolve(false)
    }
  }
}
