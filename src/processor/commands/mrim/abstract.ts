/**
 * @file Файл абстрактной команды MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import Command, { CommandContext } from '../abstract.js'

import { type MrimPacket } from '../../../protocol/factories/mrim.js'
import type MrimClient from '../../../network/clients/mrim.js'

export interface MrimCommandContext extends CommandContext {
  packet: MrimPacket
  client: MrimClient
}

export default abstract class MrimCommand extends Command {
  public abstract execute(
    context: MrimCommandContext
  ): Promise<boolean | MrimPacket[]>
}
