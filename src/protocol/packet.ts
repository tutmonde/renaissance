/**
 * @file Скрипт простого класса-обертки для пакета MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimPacketHeader from './common/header.js'

/**
 * Пакет протокола MRIM
 */
export default class MrimPacket {
  /**
   * Заголовок пакета
   */
  public header: MrimPacketHeader
  /**
   * Полезные данные пакета
   */
  public payload?: Buffer

  public constructor(header: MrimPacketHeader, payload?: Buffer) {
    this.header = header
    this.payload = payload
  }

  /**
   * Кодирование пакета в сырые данные
   * @returns Закодированные данные пакета
   */
  public encode(): Buffer {
    const header = this.header.encode()
    return this.payload ? Buffer.concat([header, this.payload]) : header
  }
}
