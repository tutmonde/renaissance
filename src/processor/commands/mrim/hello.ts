/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл команды сервера приветствия
 * @author synzr <mikhail@autism.net.ru>
 */

import type { MrimPacket } from '../../../protocol/factories/mrim.js'
import MrimHelloServerPayload from '../../../protocol/payloads/server/hello.js'

import type { MrimCommandContext } from './abstract.js'
import MrimCommand from './abstract.js'

/**
 * Команда приветствия сервера от клиента
 */
export default class MrimHelloCommand extends MrimCommand {
  public async execute(context: MrimCommandContext): Promise<MrimPacket[]> {
    const header = context.packet.header
    header.commandCode = 0x1002 // NOTE: SC_HELLO_ACK

    // TODO(synzr): получение интервала из конфигурации
    const payload = new MrimHelloServerPayload({ interval: 5 })
    return [{ header, payload }]
  }
}
