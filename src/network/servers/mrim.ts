/**
 * @file Файл MRIM-сервера
 * @author synzr <mikhail@autism.net.ru>
 */

import TcpServer from './tcp.js'
import MrimClient from '../clients/mrim.js'

/**
 * MRIM-сервер
 */
// @ts-expect-error NOTE: нам clientClass нужен именно для переопределения
export default class MrimServer extends TcpServer {
  /**
   * Класс клиента
   */
  private static override clientClass = MrimClient
}
