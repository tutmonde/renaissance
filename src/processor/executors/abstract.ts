/**
 * @file Файл абстрактного исполнителя команд
 * @author synzr <mikhail@autism.net.ru>
 */

import { UnknownPacket } from '../../protocol/packet.js'

/**
 * Абстрактный исполнитель команд
 */
export default abstract class Executor {
  /**
   * Исполнение команды из пакета
   * @param packet Пакет
   * @returns Пакет(ы) результата исполнителя команды, либо булевое значение
   *          (true = выполнено успешно, но нет результата, false = выполнено безуспешно)
   */
  public abstract execute(packet: UnknownPacket): UnknownPacket[] | boolean
}
