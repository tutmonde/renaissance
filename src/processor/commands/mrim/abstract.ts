/**
 * @file Файл абстрактной команды MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Logger } from 'pino'

import type MrimClient from '../../../network/clients/mrim.js'
import type { MrimPacket } from '../../../protocol/factories/mrim.js'
import type { CommandContext } from '../abstract.js'
import Command from '../abstract.js'

/**
 * Настройки команды MRIM
 */
export interface MrimCommandOptions {
  logger: Logger
}

export interface MrimCommandContext extends CommandContext {
  packet: MrimPacket
  client: MrimClient
}

export default abstract class MrimCommand extends Command {
  /**
   * Логгер
   */
  protected readonly logger: Logger

  public constructor(options: MrimCommandOptions) {
    super()
    this.logger = options.logger
  }

  public abstract execute(
    context: MrimCommandContext
  ): Promise<boolean | MrimPacket[]>
}
