/**
 * @file Файл абстрактного декодера пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import { EventEmitter } from 'node:events'
import Message from '../message.js'

/**
 * Абстрактный декодер пакетов
 */
export default abstract class PacketDecoder extends EventEmitter {
  /**
   * Декодирование сообщения из необработанных данных
   * @param data Необработанные данные
   */
  public abstract decode(data: Buffer): Message<unknown, unknown>
}
