/**
 * @file Файл полезных данных приветствия от сервера
 * @author synzr <mikhail@autism.net.ru>
 */

import { Buffer } from 'node:buffer'

import BinaryData, { IntegerTypes, PositionFrom } from '../../shared/binary.js'

/**
 * Параметры полезных данных приветствия от сервера
 */
interface MrimHelloServerPayloadOptions {
  /**
   * Интервал обмена пингами
   */
  interval: number
}

/**
 * Полезные данные приветствия от сервера
 */
export default class MrimHelloServerPayload extends BinaryData {
  public constructor(options: MrimHelloServerPayloadOptions) {
    super({ buffer: Buffer.alloc(4) })
    this.writeInteger(IntegerTypes.INT32, options.interval)
  }

  /**
   * Интервал обмена пингами
   */
  public get interval(): number {
    this.seek(0, PositionFrom.START)
    return this.readInteger(IntegerTypes.UINT32)
  }

  public set interval(interval: number) {
    this.seek(0, PositionFrom.START)
    this.writeInteger(IntegerTypes.UINT32, interval)
  }
}
