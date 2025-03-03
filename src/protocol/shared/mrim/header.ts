/**
 * @file Файл заголовка пакета MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import type { AddressInfo } from 'node:net'
import BinaryData, { IntegerTypes, PositionFrom } from '../binary.js'

/**
 * Версия протокола
 */
export interface ProtocolVersion {
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
 * Заголовок пакета MRIM
 */
export default class MrimPacketHeader extends BinaryData {
  /**
   * Читание версии прокотола из необработанных данных
   * @returns Заготовок пакета
   */
  public readProtocolVersion(): ProtocolVersion {
    const protocolVersion = this.readInteger(IntegerTypes.UINT32)

    // NOTE: https://web.archive.org/web/20110510111551if_/http://agent.mail.ru/ru/proto.h
    return {
      major: (protocolVersion & 0xffff0000) >> 16,
      minor: protocolVersion & 0x0000ffff
    }
  }

  /**
   * Запись версии протокола в необработанные данные
   * @param protocolVersion Версия протокола
   */
  public writeProtocolVersion(protocolVersion: ProtocolVersion): void {
    this.writeInteger(
      IntegerTypes.UINT32,
      (protocolVersion.major << 16) | protocolVersion.minor
    )
  }

  /**
   * Читание адреса источника из необработанных данных
   * @returns Адрес источника
   */
  public readSourceAddress(): AddressInfo {
    const address = this.readInteger(IntegerTypes.UINT32)

    return {
      address: `${address >> 24}.${(address >> 16) & 0xff}.${(address >> 8) & 0xff}.${address & 0xff}`,
      port: this.readInteger(IntegerTypes.UINT32),
      family: 'ipv4' // NOTE: протокол MRIM поддерживает только IPv4
    }
  }

  /**
   * Запись адреса источника в необработанные данные
   * @param sourceAddress Адрес источника
   */
  public writeSourceAddress(sourceAddress: AddressInfo): void {
    const address = sourceAddress.address.split('.').map(Number)

    this.writeInteger(
      IntegerTypes.UINT32,
      (address[0] << 24) | (address[1] << 16) | (address[2] << 8) | address[3]
    )
    this.writeInteger(IntegerTypes.UINT32, sourceAddress.port)
  }

  /**
   * Версия протокола
   */
  public get protocolVersion(): ProtocolVersion {
    this.seek(4, PositionFrom.START)
    return this.readProtocolVersion()
  }

  public set protocolVersion(protocolVersion: ProtocolVersion) {
    this.seek(4, PositionFrom.START)
    this.writeProtocolVersion(protocolVersion)
  }

  /**
   * Номер последовательности
   */
  public get sequenceNumber(): number {
    this.seek(8, PositionFrom.START)
    return this.readInteger(IntegerTypes.UINT32)
  }

  public set sequenceNumber(sequenceNumber: number) {
    this.seek(8, PositionFrom.START)
    this.writeInteger(IntegerTypes.UINT32, sequenceNumber)
  }

  /**
   * Номер последовательности
   */
  public get commandCode(): number {
    this.seek(12, PositionFrom.START)
    return this.readInteger(IntegerTypes.UINT32)
  }

  public set commandCode(commandCode: number) {
    this.seek(12, PositionFrom.START)
    this.writeInteger(IntegerTypes.UINT32, commandCode)
  }

  /**
   * Длина полезных данных
   */
  public get payloadLength(): number {
    this.seek(16, PositionFrom.START)
    return this.readInteger(IntegerTypes.UINT32)
  }

  public set payloadLength(payloadLength: number) {
    this.seek(16, PositionFrom.START)
    this.writeInteger(IntegerTypes.UINT32, payloadLength)
  }

  /**
   * Адрес источника
   */
  public get sourceAddress(): AddressInfo {
    this.seek(20, PositionFrom.START)
    return this.readSourceAddress()
  }

  public set sourceAddress(sourceAddress: AddressInfo) {
    this.seek(20, PositionFrom.START)
    this.writeSourceAddress(sourceAddress)
  }
}
