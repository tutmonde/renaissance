/**
 * @file Файл абстрактного читателя пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import { Packet } from '../shared/packet.js'

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
   * Читание пакета из необработанных данных
   * @param options Настройки
   * @returns Пакет, либо булевое значение
   *          (true = часть сообщения прочитано, false = неправильные данные)
   */
  public abstract read(options: PacketReadOptions): Packet | boolean
}
