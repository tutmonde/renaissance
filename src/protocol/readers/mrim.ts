/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл читателя пакетов MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import { Buffer } from 'node:buffer'

import type { Logger } from 'pino'

import type MrimPacketFactory from '../factories/mrim.js'
import { HEADER_SIZE, MAGIC_HEADER } from '../constants.js'

import type { PacketReadOptions } from './abstract.js'
import PacketReader from './abstract.js'

/**
 * Настройки читателя пакетов MRIM
 */
interface MrimPacketReaderOptions {
  factory: MrimPacketFactory
  logger: Logger
}

/**
 * Настройки читания пакетов MRIM
 */
interface MrimPacketReadOptions extends PacketReadOptions {
  id: string
}

/**
 * Читатель пакетов MRIM
 */
export default class MrimPacketReader extends PacketReader {
  /**
   * Фабрика пакетов
   */
  private readonly factory: MrimPacketFactory

  /**
   * Логгер
   */
  private readonly logger: Logger

  /**
   * Стеки сообщений
   */
  private readonly stacks: Map<string, Buffer[]> = new Map()

  public constructor(options: MrimPacketReaderOptions) {
    super()

    this.factory = options.factory
    this.logger = options.logger
  }

  public read(options: MrimPacketReadOptions) {
    // NOTE: Проверка, если заготовок в стеках есть
    const wasThereHeaderBefore = this.stacks.has(options.id)
    if (wasThereHeaderBefore) {
      const datum = [...this.stacks.get(options.id)!, options.data]
      const dataAsBuffer = Buffer.concat(datum)

      // NOTE: Проверка, если пакет полный
      const payloadLength = this.getPayloadLength(dataAsBuffer)
      const isDataFull = HEADER_SIZE + payloadLength === options.data.length
      if (!isDataFull) {
        const leftToEnd = HEADER_SIZE + payloadLength - options.data.length
        this.logger.trace(
          `MrimPacketReader: client ${options.id} packet isn't full; waiting for next ${leftToEnd} bytes`,
        )

        this.stacks.set(options.id, datum)
        return true
      }

      // NOTE: Очистка стека и передача данных в фабрику
      this.stacks.delete(options.id)
      this.logger.trace(`MrimPacketReader: client ${options.id} packet is full now; stack deleted`)
      return this.factory.fromBuffer(dataAsBuffer)
    }

    // NOTE: Проверка на наличие магического заголовка пакета
    const isHeaderIncluded = this.validateMagicHeader(options.data)
    if (!isHeaderIncluded || options.data.length < HEADER_SIZE) {
      this.logger.warn(`MrimPacketReader: client ${options.id} did sent bad data`)
      return false
    }

    // NOTE: Проверка на наличие полезных данных пакета
    const payloadLength = this.getPayloadLength(options.data)
    const isPayloadIncluded
      = HEADER_SIZE + payloadLength === options.data.length
    if (!isPayloadIncluded) {
      this.logger.trace(
        `MrimPacketReader: client ${options.id} packet isn't full; created stack`,
      )
      this.stacks.set(options.id, [options.data])

      return true
    }

    // NOTE: Передача данных в фабрику
    this.logger.trace(`MrimPacketReader: client ${options.id} packet is full`)
    return this.factory.fromBuffer(options.data)
  }

  /**
   * Проверка на наличие магического заголовка пакета
   * @param data Необработанные данные
   * @returns Результат проверки
   */
  private validateMagicHeader(data: Buffer): boolean {
    return data.readUInt32LE() === MAGIC_HEADER
  }

  /**
   * Получение размера полезных данных из необработанных данных
   * @param data Необработанные данные
   * @returns Размер полезных данных
   */
  private getPayloadLength(data: Buffer): number {
    return data.readUInt32LE(16)
  }
}
