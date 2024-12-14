import assert from 'node:assert/strict'
import { AddressInfo } from 'node:net'

type ProtocolVersion = { major: number; minor: number }

interface MrimPacketHeaderFields {
  protocolVersion: ProtocolVersion
  sequenceNumber: number
  commandCode: number
  payloadLength: number
  sourceAddress:
    | `${AddressInfo['address']}:${AddressInfo['port']}`
    | AddressInfo
}

export default class MrimPacketHeader {
  public static MAGIC_HEADER = 0xdeadbeef
  public static HEADER_SIZE = 0x2c

  private _protocolVersion!: Buffer
  private _sourceAddress!: Buffer

  public sequenceNumber!: number
  public commandCode!: number
  public payloadLength!: number

  constructor(fields: Buffer | MrimPacketHeaderFields) {
    if (fields instanceof Buffer) {
      this.decode(fields)
      return
    }

    this.initialize(fields as MrimPacketHeaderFields)
  }

  //#region Функции декодирования и инициализации
  /**
   * Декодирование заголовка пакета
   * @param data Сырые данные заголовка
   */
  private decode(data: Buffer): void {
    const magicHeader = data.readUInt32LE()
    assert(magicHeader === MrimPacketHeader.MAGIC_HEADER, 'bad header data')

    this._protocolVersion = data.subarray(4, 8)
    this.sequenceNumber = data.readUInt32LE(8)
    this.commandCode = data.readUint32LE(12)
    this.payloadLength = data.readUInt32LE(16)
    this._sourceAddress = data.subarray(20, 28) // NOTE: 4 байта IPv4 + 4 байта порта

    // NOTE: проверка, если зарезервированные байты не используются
    const reservedBytes = data.subarray(28, 44)
    assert(
      reservedBytes.every((byte) => byte === 0),
      'reserved bytes are not zero'
    )
  }

  /**
   * Кодирование версии протокола
   * @param protocolVersion Объект версии протокола
   * @returns Буфер с двумя 16-битным числами
   */
  private encodeProtocolVersion(protocolVersion: ProtocolVersion): Buffer {
    const buffer = Buffer.alloc(4)
    buffer.writeUInt16LE(protocolVersion.major, 0)
    buffer.writeUInt16LE(protocolVersion.minor, 2)
    return buffer
  }

  /**
   * Парсинг адреса источника
   * @param sourceAddress Строка IP-адреса с портом
   * @returns Объект с IP-адресом и портом
   */
  private parseSourceAddress(sourceAddress: string): AddressInfo {
    const [address, port] = sourceAddress.split(':')
    return { address, port: Number(port), family: 'v4' }
  }

  /**
   * Перевод адреса источника в бинарный формат
   * @param sourceAddress IP-адрес и портом
   * @returns Буфер с IP-адресом и портом
   */
  private encodeSourceAddress(sourceAddress: AddressInfo): Buffer {
    const buffer = Buffer.alloc(8)

    // NOTE: переводим IP-адрес в числовой формат
    let ipAddress = 0
    for (let i = 0; i < 4; i++) {
      ipAddress += +sourceAddress.address.split('.')[i] * 256 ** i
    }

    buffer.writeUInt32LE(ipAddress, 0)
    buffer.writeUInt16LE(+sourceAddress.port, 4)

    return buffer
  }

  /**
   * Инициализация заголовка пакета на основе данных из объекта
   * @param fields Объект с полями заголовка
   */
  private initialize(fields: MrimPacketHeaderFields): void {
    this._protocolVersion = this.encodeProtocolVersion(fields.protocolVersion)
    this.sequenceNumber = fields.sequenceNumber
    this.commandCode = fields.commandCode
    this.payloadLength = fields.payloadLength

    // NOTE: если адрес источника передан в виде строки, то парсим его
    if (typeof fields.sourceAddress === 'string') {
      fields.sourceAddress = this.parseSourceAddress(fields.sourceAddress)
    }

    this._sourceAddress = this.encodeSourceAddress(fields.sourceAddress)
  }
  //#endregion

  //#region Публичные поля версии протокола и адрес источника
  /**
   * Декодирование версии протокола
   * @param protocolVersion Сырые данные с версией протокола
   * @returns Объект с полями версии протокола
   */
  private decodeProtocolVersion(protocolVersion: Buffer): ProtocolVersion {
    return {
      major: protocolVersion.readUInt16LE(0),
      minor: protocolVersion.readUInt16LE(2)
    }
  }

  /**
   * Версия протокола
   */
  public get protocolVersion(): ProtocolVersion {
    return this.decodeProtocolVersion(this._protocolVersion)
  }

  public set protocolVersion(version: ProtocolVersion) {
    this._protocolVersion = this.encodeProtocolVersion(version)
  }

  /**
   * Декодирование адреса источника
   * @param sourceAddress Адрес источника
   * @returns Объект с полями адреса источника
   */
  private decodeSourceAddress(sourceAddress: Buffer): AddressInfo {
    const ipAddress = new Array<number>(4)
      .fill(0)
      .map((_, index: number) => sourceAddress.readInt8(index)) // NOTE: читаем каждый байт IP-адреса

    return {
      address: ipAddress.map(String).join('.'),
      port: sourceAddress.readUInt16LE(4),
      family: 'v4'
    }
  }

  /**
   * Адрес источника
   */
  public get sourceAddress(): AddressInfo {
    return this.decodeSourceAddress(this._sourceAddress)
  }

  public set sourceAddress(address: AddressInfo) {
    this._sourceAddress = this.encodeSourceAddress(address)
  }
  //#endregion

  /**
   * Кодирование заголовка пакета
   * @returns Буфер с заголовком пакета
   */
  public encode(): Buffer {
    const buffer = Buffer.alloc(MrimPacketHeader.HEADER_SIZE)

    buffer.writeUInt32LE(MrimPacketHeader.MAGIC_HEADER, 0)
    buffer.writeUInt32LE(this.sequenceNumber, 8)
    buffer.writeUint32LE(this.commandCode, 12)
    buffer.writeUInt32LE(this.payloadLength, 16)

    this._protocolVersion.copy(buffer, 4)
    this._sourceAddress.copy(buffer, 20)

    return buffer
  }
}
