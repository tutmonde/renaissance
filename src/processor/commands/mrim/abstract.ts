/**
 * @file Файл абстрактной команды MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import type MrimClient from '../../../network/clients/mrim.js'
import type { MrimPacket } from '../../../protocol/factories/mrim.js'
import type { CommandContext } from '../abstract.js'
import Command from '../abstract.js'

export interface MrimCommandContext extends CommandContext {
  packet: MrimPacket
  client: MrimClient
}

export default abstract class MrimCommand extends Command {
  public abstract execute(
    context: MrimCommandContext
  ): Promise<boolean | MrimPacket[]>
}
