/**
 * @file Файл интерфейса сообщения
 * @author synzr <mikhail@autism.net.ru>
 */

import BinaryData from './binary.js'

/**
 * Сообщение
 */
export default interface BasePacket<Header, Payload extends BinaryData | null> {
  header: Header
  payload: Payload
}

/**
 * Неизвестное сообщение
 */
export type Packet = BasePacket<unknown, BinaryData | null>
