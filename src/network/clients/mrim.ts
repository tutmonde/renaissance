/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @file Файл MRIM-клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import TcpClient from './tcp.js'

/**
 * MRIM-клиента
 */
export default class MrimClient extends TcpClient {
  protected onData(data: Buffer): void {
    void 0 // TODO: переделать декодер пакетов и исполнитель команд
  }

  protected onClose(): void {
    void 0
  }
}
