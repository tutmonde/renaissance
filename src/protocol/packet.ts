/**
 * @file Файл интерфейса сообщения
 * @author synzr <mikhail@autism.net.ru>
 */

/**
 * Сообщение
 */
export default interface Packet<Header, Payload> {
  header: Header
  payload: Payload
}

/**
 * Неизвестное сообщение
 */
export type UnknownPacket = Packet<unknown, unknown>
