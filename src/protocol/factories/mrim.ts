/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл абстрактной фабрики пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import { Buffer } from 'node:buffer'

import type BasePacket from '../shared/packet.js'
import { HEADER_SIZE } from '../constants.js'
import BinaryData from '../shared/binary.js'
import MrimPacketHeader from '../shared/mrim/header.js'

import PacketFactory from './abstract.js'

/**
 * Пакет MRIM
 */
export type MrimPacket = BasePacket<MrimPacketHeader, BinaryData | null>

/**
 * Абстрактная фабрика пакетов
 */
export default class MrimPacketFactory extends PacketFactory {
  public fromBuffer(data: Buffer): MrimPacket {
    const header = new MrimPacketHeader({
      buffer: data.subarray(0, HEADER_SIZE),
    })

    let payload = null
    if (header.payloadLength > 0) {
      payload = new BinaryData({
        buffer: data.subarray(HEADER_SIZE, HEADER_SIZE + header.payloadLength),
      })
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

    return Buffer.concat([packet.header.buffer, packet.payload.buffer])
  }
}
