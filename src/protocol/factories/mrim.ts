/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл абстрактной фабрики пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import { Buffer } from 'node:buffer'

import type { Logger } from 'pino'

import type BasePacket from '../shared/packet.js'
import { HEADER_SIZE } from '../constants.js'
import BinaryData from '../shared/binary.js'
import MrimPacketHeader from '../shared/mrim/header.js'

import PacketFactory from './abstract.js'

/**
 * Опции фабрики пакетов MRIM
 */
interface MrimPacketFactoryOptions {
  logger: Logger
}

/**
 * Пакет MRIM
 */
export type MrimPacket = BasePacket<MrimPacketHeader, BinaryData | null>

/**
 * Абстрактная фабрика пакетов
 */
export default class MrimPacketFactory extends PacketFactory {
  /**
   * Логгер
   */
  private readonly logger: Logger

  public constructor(options: MrimPacketFactoryOptions) {
    super()
    this.logger = options.logger
  }

  public fromBuffer(data: Buffer): MrimPacket {
    // NOTE: Чтение заголовка
    const header = new MrimPacketHeader({
      buffer: data.subarray(0, HEADER_SIZE),
    })
    if (header.commandCode !== 0x1006) { // NOTE: CS_PING
      this.logger.debug(
        `MrimPacketFactory: read header; commandCode=${header.commandCode}; payloadLength=${header.payloadLength}`,
      )
    }

    // NOTE: Чтение полезных данных
    let payload = null
    if (header.payloadLength > 0) {
      payload = new BinaryData({
        buffer: data.subarray(HEADER_SIZE, HEADER_SIZE + header.payloadLength),
      })

      if (header.commandCode !== 0x1006) { // NOTE: CS_PING
        this.logger.debug(
          `MrimPacketFactory: read ${payload.length} bytes of payload`,
        )
      }
    }

    return { header, payload }
  }

  public toBuffer(packet: MrimPacket): Buffer {
    // NOTE: Уточнение длины данных в заголовке
    packet.header.payloadLength = packet.payload?.length ?? 0

    // NOTE: Установка пустого адреса и порта источника
    packet.header.sourceAddress = {
      address: '0.0.0.0',
      port: 0,
      family: 'ipv4',
    }

    if (!packet.payload) {
      return packet.header.buffer
    }

    // NOTE: Формирование конченого буфера
    this.logger.debug(
      `MrimPacketFactory: created buffer for packet; commandCode=${packet.header.commandCode}; payloadLength=${packet.payload.length}`,
    )
    return Buffer.concat([packet.header.buffer, packet.payload.buffer])
  }
}
