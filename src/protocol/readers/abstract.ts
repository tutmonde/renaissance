/**
 * @file Файл абстрактного читателя пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import { EventEmitter } from 'node:events'
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
export default abstract class PacketReader extends EventEmitter {
  /**
   * Читание сообщения из необработанных данных
   * @param options Настройки
   * @returns Сообщение, либо булевое значение (true = часть сообщения прочитано, false = неправильные данные)
   */
  public abstract read(options: PacketReadOptions): UnknownMessage | boolean
}
