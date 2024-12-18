/**
 * @file Реализация декодера пакетов MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimPacketHeader from '../protocol/common/header.js'
import { EventEmitter } from 'node:events'
import assert from 'node:assert/strict'
import MrimPacket from '../protocol/packet.js'

/**
 * Состояние декодера пакетов MRIM
 */
enum MrimClientDecoderState {
  /**
   * Означает, что декодер ожидает данных заголовка пакета
   */
  HEADER_WAIT = 0,
  /**
   * Означает, что декодер ожидает сырых полезных данных пакета
   */
  PAYLOAD_WAIT = 1
}

/**
 * Декодер необработанных данных пакетов MRIM
 */
export default class MrimClientDecoder extends EventEmitter {
  private state: MrimClientDecoderState = MrimClientDecoderState.HEADER_WAIT
  private stack: Buffer[] = []

  /**
   * Записать необработанных данных в декодер
   * @param data Необработанные данные
   */
  public write(data: Buffer): void {
    try {
      switch (this.state) {
        case MrimClientDecoderState.HEADER_WAIT:
          return this.handleRawHeader(data)
        case MrimClientDecoderState.PAYLOAD_WAIT:
          return this.handleRawPayload(data)
      }
    } catch (error) {
      this.emit('error', error)
    }
  }

  //#region Получение сырого заголовка
  /**
   * Обработка сырого заголовка
   * @param data Сырые данные
   */
  private handleRawHeader(data: Buffer): void {
    const isHeader = this.validateMagicHeader(data)
    assert(isHeader, `bad header data, length: 0x${data.length.toString(16)}`)

    // NOTE: если заголовок получен с полезными данными,
    //       то сразу декодируем
    const payloadLength = this.getPayloadLength(data)
    if (data.length - payloadLength !== 0) {
      return this.decodePacketFromBuffer(data)
    }

    this.state = MrimClientDecoderState.PAYLOAD_WAIT
    this.stack.push(data)
  }

  /**
   * Проверка магического заголовка пакета
   * @param headerData Сырые данные заголовка
   * @returns Результат проверки
   */
  private validateMagicHeader(headerData: Buffer): boolean {
    return headerData.readUInt32LE(0) === MrimPacketHeader.MAGIC_HEADER
  }

  /**
   * Получение размера полезных данных из заголовка
   * @param headerData Сырые данные заголовка
   * @returns Размер полезных данных
   */
  private getPayloadLength(headerData: Buffer): number {
    return headerData.readUInt32LE(16)
  }
  //#endregion

  /**
   * Обработка сырых полезных данных
   * @param data Сырые полезных данных
   */
  private handleRawPayload(data: Buffer): void {
    this.state = MrimClientDecoderState.HEADER_WAIT
    this.stack.push(data)

    return this.decodePacketFromQueue()
  }

  //#region декодирование данных
  /**
   * Декодирование пакета из стека сырых данных
   */
  private decodePacketFromQueue(): void {
    const buffer = Buffer.concat(this.stack)
    this.stack.length = 0 // NOTE: очистка стека

    return this.decodePacketFromBuffer(buffer)
  }

  /**
   * Декодирование пакета из сырых данных
   * @param data Сырые данные
   */
  private decodePacketFromBuffer(data: Buffer): void {
    const header = new MrimPacketHeader(data)

    assert(
      data.length === MrimPacketHeader.HEADER_SIZE + header.payloadLength,
      'bad complete packet data'
    )

    const packet =
      header.payloadLength > 0
        ? new MrimPacket(header, data.subarray(MrimPacketHeader.HEADER_SIZE))
        : new MrimPacket(header)

    this.emit('packet', packet)
  }
  //#endregion
}
