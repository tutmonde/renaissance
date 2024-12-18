/**
 * @file Описание интерфейса исполнителя команды
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimPacket from '../../protocol/packet.js'
import MrimClient from '../index.js'

/**
 * Либо пакет протокола MRIM, либо ничего
 */
export type MrimPacketOrNothing = MrimPacket | undefined | null

/**
 * Интерфейс исполнителя команды
 */
export default interface ICommand {
  execute(
    client: MrimClient,
    packet: MrimPacket
  ): Promise<MrimPacketOrNothing> | MrimPacketOrNothing
}
