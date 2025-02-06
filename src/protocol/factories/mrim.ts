/**
 * @file Файл абстрактной фабрики пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import type { AddressInfo } from 'node:net'
import { Buffer } from 'node:buffer'
import assert from 'node:assert/strict'

import PacketFactory from './abstract.js'
import BasePacket from '../packet.js'

import { HEADER_SIZE, MAGIC_HEADER } from '../constants.js'

/**
 * Заголовок пакета MRIM
 */
interface MrimPacketHeader {
  /**
   * Версия протокола
   */
  protocolVersion: {
    /**
     * Мажорная версия
     */
    major: number
    /**
     * Минорная версия
     */
    minor: number
  }
  /**
   * Номер последовательности пакета
   */
  sequenceNumber: number
  /**
   * Код команды
   */
  commandCode: number
  /**
   * Размер полезных данных
   */
  payloadLength: number
  /**
   * Адрес источника пакета
   */
  sourceAddress: AddressInfo
}

/**
 * Пакет MRIM
 */
export type MrimPacket = BasePacket<MrimPacketHeader, Buffer | null>

/**
 * Абстрактная фабрика пакетов
 */
export default class MrimPacketFactory extends PacketFactory {
  /**
   * Смещение версии протокола
   */
  private static PROTOCOL_VERSION_OFFSET = 4

  /**
   * Смещение адрес источника
   */
  private static SOURCE_ADDRESS_OFFSET = 20

  public fromBuffer(data: Buffer): MrimPacket {
    let header: MrimPacketHeader | Buffer = data.subarray(0, HEADER_SIZE)
    header = this.readHeader(header)

    let payload: Buffer | null = null
    if (header.payloadLength > 0) {
      assert(
        data.length === HEADER_SIZE + header.payloadLength,
        'bad message length'
      )

      payload = data.subarray(HEADER_SIZE)
    }

    return { header: header as MrimPacketHeader, payload }
  }

  /**
   * Читание заголовка пакета из необработанных данных
   * @param data Необработанные данные
   * @returns Заготовок пакета
   */
  private readHeader(data: Buffer): MrimPacketHeader {
    return {
      protocolVersion: this.readProtocolVersion(data),
      sequenceNumber: data.readUint32LE(8),
      commandCode: data.readUint32LE(12),
      payloadLength: data.readUint32LE(16),
      sourceAddress: this.readSourceAddress(data)
    }
  }

  /**
   * Читание версии протокола из необработанных данных
   * @param data Необработанные данные
   * @returns Версия протокола
   */
  private readProtocolVersion(
    data: Buffer
  ): MrimPacketHeader['protocolVersion'] {
    return {
      major: data.readUInt16LE(MrimPacketFactory.PROTOCOL_VERSION_OFFSET + 2),
      minor: data.readUInt16LE(MrimPacketFactory.PROTOCOL_VERSION_OFFSET)
    }
  }

  /**
   * Читание адрес источника из необработанных данных
   * @param data Необработанные данные
   * @returns Адрес источника
   */
  private readSourceAddress(data: Buffer): AddressInfo {
    // NOTE: 0xdeadbeef -> "222.173.190.239"
    let address: number[] | string = [0, 0, 0, 0]
    address = address.map((_, index) =>
      data.readInt8(MrimPacketFactory.SOURCE_ADDRESS_OFFSET + index)
    )
    address = address.map(String).join('.')

    return {
      address: address as string,
      port: data.readUint32LE(),
      family: 'ipv4'
    }
  }

  public toBuffer(packet: MrimPacket): Buffer {
    packet.header.payloadLength =
      packet.payload?.length !== packet.header.payloadLength
        ? (packet.payload?.length ?? 0)
        : packet.header.payloadLength

    const header = this.writeHeader(packet.header)
    if (!packet.payload) {
      return header
    }

    return Buffer.concat([header, packet.payload])
  }

  /**
   * Написание заголовка пакета в виде необработанных данных
   * @param header Заголовок пакета
   * @returns Необработанные данные
   */
  private writeHeader(header: MrimPacketHeader): Buffer {
    const result = Buffer.alloc(HEADER_SIZE)
    result.writeUint32LE(MAGIC_HEADER)

    this.writeProtocolHeader(header.protocolVersion, result)

    result.writeUint32LE(header.sequenceNumber, 8)
    result.writeUint32LE(header.commandCode, 12)
    result.writeUint32LE(header.payloadLength, 16)

    this.writeSourceAddress(header.sourceAddress, result)
    return result
  }

  /**
   * Написание версия протокола в виде необработанных данных
   * @param protocolVersion Версия протокола
   * @param data Необработанные данные
   */
  private writeProtocolHeader(
    protocolVersion: MrimPacketHeader['protocolVersion'],
    data: Buffer
  ): void {
    data.writeUint16LE(
      protocolVersion.major,
      MrimPacketFactory.PROTOCOL_VERSION_OFFSET + 2
    )

    data.writeUint16LE(
      protocolVersion.minor,
      MrimPacketFactory.PROTOCOL_VERSION_OFFSET
    )
  }

  /**
   * Написание адреса источника пакета в виде необработанных данных
   * @param sourceAddress Адрес источника
   * @param data Необработанные данные
   */
  private writeSourceAddress(sourceAddress: AddressInfo, data: Buffer): void {
    const address = sourceAddress.address.split('.').map(Number)
    address.forEach((value, index) =>
      data.writeInt8(value, MrimPacketFactory.SOURCE_ADDRESS_OFFSET + index)
    )

    data.writeUint32LE(
      sourceAddress.port,
      MrimPacketFactory.SOURCE_ADDRESS_OFFSET + 4
    )
  }
}
