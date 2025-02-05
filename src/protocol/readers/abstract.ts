/**
 * @file Файл абстрактного читателя пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import { UnknownMessage } from '../packet.js'

/**
 * Настройки читания сообщения
 */
export interface PacketReadOptions {
  data: Buffer
}

/**
 * Абстрактный читатель пакетов
 */
export default abstract class PacketReader {
  /**
   * Читание сообщения из необработанных данных
   * @param options Настройки
   * @returns Сообщение, либо булевое значение (true = часть сообщения прочитано, false = неправильные данные)
   */
  public abstract read(options: PacketReadOptions): UnknownMessage | boolean
}
