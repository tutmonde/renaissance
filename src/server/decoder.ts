import MrimPacketHeader from '../protocol/common/header.js'
import { EventEmitter } from 'node:events'
import assert from 'node:assert/strict'

enum MrimClientDecoderState {
  HEADER_WAIT = 0,
  PAYLOAD_WAIT = 1
}

export class PacketEvent<T> extends Event {
  public readonly header: MrimPacketHeader
  public readonly payload?: T

  constructor(header: MrimPacketHeader, payload?: T) {
    super('PacketEvent')

    this.header = header
    this.payload = payload
  }
}

/**
 * Декодер необработанных данных пакетов MRIM
 */
export default class MrimClientDecoder extends EventEmitter {
  private state: MrimClientDecoderState = MrimClientDecoderState.HEADER_WAIT
  private queue: Buffer[] = []

  /**
   * Записать необработанных данных в декодер
   * @param data Необработанные данные
   */
  public write(data: Buffer): void {
    switch (this.state) {
      case MrimClientDecoderState.HEADER_WAIT:
        return this.handleRawHeader(data)
      case MrimClientDecoderState.PAYLOAD_WAIT:
        return this.handleRawPayload(data)
    }
  }

  //#region получение сырого заголовка
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
    this.queue.push(data)
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
    this.queue.push(data)

    return this.decodePacketFromQueue()
  }

  //#region декодирование данных
  /**
   * Декодирование пакета из очереди сырых данных
   */
  private decodePacketFromQueue(): void {
    const buffer = Buffer.concat(this.queue)
    this.queue.length = 0 // NOTE: очистка очереди

    return this.decodePacketFromBuffer(buffer)
  }

  /**
   * Декодирование пакета из сырых данных
   * @param data Сырые данные
   */
  private decodePacketFromBuffer(data: Buffer): void {
    const header = new MrimPacketHeader(data)

    if (header.payloadLength === 0) {
      const event = new PacketEvent(header)
      this.emit('packet', event)

      return
    }

    const payload = data.subarray(
      MrimPacketHeader.HEADER_SIZE,
      MrimPacketHeader.HEADER_SIZE + header.payloadLength
    )
    const event = new PacketEvent(header, payload)

    this.emit('packet', event)
  }
  //#endregion
}
