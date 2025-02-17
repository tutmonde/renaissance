/**
 * @file Файл команды сервера приветствия
 * @author synzr <mikhail@autism.net.ru>
 */

import { MrimPacket } from '../../../protocol/factories/mrim.js'
import Command, { CommandContext } from '../abstract.js'

export default class HelloCommand extends Command {
  public async execute(context: CommandContext): Promise<MrimPacket[]> {
    const packet = context.packet as MrimPacket

    const payload = Buffer.alloc(4)
    payload.writeUInt32BE(5) // TODO: настройки сюда

    return [
      {
        header: {
          ...packet.header,
          commandCode: 0x1002, // NOTE: SC_HELLO_ACK
          sourceAddress: {
            address: '0.0.0.0',
            port: 0,
            family: 'ipv4'
          }
        },
        payload
      }
    ]
  }
}
