/**
 * @file Файл абстрактного исполнителя команд
 * @author synzr <mikhail@autism.net.ru>
 */

import Client from '../../network/clients/abstract.js'
import { Packet } from '../../protocol/packet.js'

/**
 * Абстрактный исполнитель команд
 */
export default abstract class Executor {
  /**
   * Исполнение команды из пакета
   * @param packet Пакет
   * @param client Клиент
   * @returns Пакет(ы) результата исполнителя команды, либо булевое значение
   *          (true = выполнено успешно, но нет результата, false = выполнено безуспешно)
   */
  public abstract execute(
    packet: Packet,
    client: Client
  ): Promise<boolean | Packet[]>
}
