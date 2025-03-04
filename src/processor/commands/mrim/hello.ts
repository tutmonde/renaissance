/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл команды сервера приветствия
 * @author synzr <mikhail@autism.net.ru>
 */

import type ConfigService from '../../../core/services/config.js'
import type { MrimPacket } from '../../../protocol/factories/mrim.js'
import MrimHelloServerPayload from '../../../protocol/payloads/server/hello.js'

import type { MrimCommandContext, MrimCommandOptions } from './abstract.js'
import MrimCommand from './abstract.js'

/**
 * Настройки команды приветствия сервера от клиента
 */
interface MrimHelloCommandOptions extends MrimCommandOptions {
  configService: ConfigService
}

/**
 * Команда приветствия сервера от клиента
 */
export default class MrimHelloCommand extends MrimCommand {
  /**
   * Сервис конфигурации
   */
  private readonly configService: ConfigService

  public constructor(options: MrimHelloCommandOptions) {
    super(options)
    this.configService = options.configService
  }

  public async execute(context: MrimCommandContext): Promise<MrimPacket[]> {
    const header = context.packet.header
    header.commandCode = 0x1002 // NOTE: SC_HELLO_ACK

    const payload = new MrimHelloServerPayload({
      interval: this.configService.getPingInterval(),
    })

    return [{ header, payload }]
  }
}
