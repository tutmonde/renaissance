/**
 * @file Файл команды сервера приветствия
 * @author synzr <mikhail@autism.net.ru>
 */

import { MrimPacket } from '../../../protocol/factories/mrim.js'
import Command, { CommandContext } from '../abstract.js'

export default class HelloCommand extends Command {
  public execute(context: CommandContext): MrimPacket[] {
    const packet = context.packet as MrimPacket

    const payload = Buffer.alloc(4)
    payload.writeUInt32BE(5) // TODO: settings here

    return [
      {
        header: {
          ...packet.header,
          commandCode: 0x1002,
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
