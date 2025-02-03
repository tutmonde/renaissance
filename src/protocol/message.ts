/**
 * @file Файл интерфейса сообщения
 * @author synzr <mikhail@autism.net.ru>
 */

/**
 * Сообщение
 */
export default interface Message<Header, Payload> {
  header: Header
  payload: Payload
}
