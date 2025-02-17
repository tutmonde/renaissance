/**
 * @file Файл интерфейса сообщения
 * @author synzr <mikhail@autism.net.ru>
 */

/**
 * Сообщение
 */
export default interface BasePacket<Header, Payload> {
  header: Header
  payload: Payload
}

/**
 * Неизвестное сообщение
 */
export type Packet = BasePacket<unknown, unknown>
