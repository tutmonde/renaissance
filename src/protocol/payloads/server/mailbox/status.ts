/**
 * @file Файл полезных данных статуса почтового ящика
 * @author synzr <mikhail@autism.net.ru>
 */

import { Buffer } from 'node:buffer'

import BinaryData, {
  IntegerTypes,
  PositionFrom,
} from '../../../shared/binary.js'

/**
 * Параметры полезных данных статуса почтового ящика
 */
interface MrimMailboxStatusServerPayloadOptions {
  /**
   * Количество непрочитанных сообщений
   */
  unreadCount: number
}

/**
 * Полезные данные приветствия от сервера
 */
export default class MrimMailboxStatusServerPayload extends BinaryData {
  public constructor(options: MrimMailboxStatusServerPayloadOptions) {
    super({ buffer: Buffer.alloc(4) })
    this.writeInteger(IntegerTypes.INT32, options.unreadCount)
  }

  /**
   * Количество непрочитанных сообщений
   */
  public get unreadCount(): number {
    this.seek(0, PositionFrom.START)
    return this.readInteger(IntegerTypes.UINT32)
  }

  public set unreadCount(interval: number) {
    this.seek(0, PositionFrom.START)
    this.writeInteger(IntegerTypes.UINT32, interval)
  }
}
