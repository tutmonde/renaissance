/**
 * @file Файл абстрактной команды
 * @author synzr <mikhail@autism.net.ru>
 */

import Client from '../../network/clients/abstract.js'
import { Packet } from '../../protocol/packet.js'

export interface CommandContext {
  packet: Packet
  client: Client
}

/**
 * Абстрактная команда
 */
export default abstract class Command {
  /**
   * Исполнение команды
   * @param packet Пакет
   * @returns Пакет(ы) результата команды, либо булевое значение
   *          (true = выполнено успешно, но нет результата, false = выполнено безуспешно)
   */
  public abstract execute(context: CommandContext): Promise<boolean | Packet[]>
}
