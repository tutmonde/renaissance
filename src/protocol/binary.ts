/**
 * @file Файл бинарных данных
 * @author synzr <mikhail@autism.net.ru>
 */

import { Buffer } from 'node:buffer'
import { decode, encode } from 'windows-1251'

/**
 * Тип чисел
 */
export enum IntegerTypes {
  // 1 байт
  INT8 = -1,
  UINT8 = 1,
  // 2 байта
  INT16 = -2,
  UINT16 = 2,
  // 4 байта
  INT32 = -3,
  UINT32 = 3
}

/**
 * Место начала позиции
 */
export enum PositionFrom {
  START = 0,
  END = 1,
  CURRENT = 2
}

/**
 * Действие изменения размера данных
 */
export enum ResizeActionType {
  INCREASE = 1,
  DECREASE = -1
}

/**
 * Настройки бинарных данных
 */
interface BinaryDataOptions {
  buffer: Buffer
}

/**
 * Бинарные данные
 */
export default class BinaryData {
  /**
   * Необработанные бинарные данные
   */
  private buffer: Buffer

  /**
   * Смещение в данных
   */
  private offset: number = 0

  constructor(options: BinaryDataOptions) {
    this.buffer = options.buffer
  }

  /**
   * Читание числа из необработанных бинарных данных
   * @param integer Тип записи числа
   * @returns Число
   */
  public readInteger(integer: IntegerTypes): number {
    switch (integer) {
      // 1 байт
      case IntegerTypes.INT8:
        return this.buffer.readInt8(this.offset++)
      case IntegerTypes.UINT8:
        return this.buffer.readUInt8(this.offset++)
      // 2 байта
      case IntegerTypes.INT16: {
        const value = this.buffer.readInt16LE(this.offset)
        this.offset += 2

        return value
      }
      case IntegerTypes.UINT16: {
        const value = this.buffer.readUInt16LE(this.offset)
        this.offset += 2

        return value
      }
      // 4 байта
      case IntegerTypes.INT32: {
        const value = this.buffer.readInt32LE(this.offset)
        this.offset += 4

        return value
      }
      case IntegerTypes.UINT32: {
        const value = this.buffer.readUInt32LE(this.offset)
        this.offset += 4

        return value
      }
    }
  }

  /**
   * Запись число в необработанные бинарные данные
   * @param integer Тип записи числа
   * @param value Число
   * @returns Размер записанных данных
   */
  public writeInteger(
    integer: IntegerTypes,
    value: number,
  ): number {
    switch (integer) {
      // 1 байт
      case IntegerTypes.INT8: {
        this.buffer.writeInt8(value, this.offset++)
        return 1
      }
      case IntegerTypes.UINT8: {
        this.buffer.writeUInt8(value, this.offset++)
        return 1
      }
      // 2 байта
      case IntegerTypes.INT16: {
        this.buffer.writeInt16LE(value, this.offset)
        this.offset += 2

        return 2
      }
      case IntegerTypes.UINT16: {
        this.buffer.writeUInt16LE(value, this.offset)
        this.offset += 2

        return 2
      }
      // 4 байта
      case IntegerTypes.INT32: {
        this.buffer.writeInt32LE(value, this.offset)
        this.offset += 4

        return 4
      }
      case IntegerTypes.UINT32: {
        this.buffer.writeUInt32LE(value, this.offset)
        this.offset += 4

        return 4
      }
    }
  }

  /**
   * Читание строки из необработанных бинарных данных
   * @param offset Смещение строки (по умолчанию - 0)
   * @returns Строка
   */
  public readString(offset: number = 0): string {
    const dataLength = this.readInteger(IntegerTypes.UINT32)

    // NOTE: Декодирование из CP-1251 (the worst encoding ever)
    const dataOffset = offset + 4
    return decode(
      this.buffer
        .subarray(dataOffset, dataOffset + dataLength)
        .toString('binary'),
      { mode: 'replacement' }
    )
  }

  /**
   * Запись строки в необработанные бинарные данные
   * @param value Строка
   * @returns Размер записанных данных
   */
  public writeString(value: string): number {
    // NOTE: Кодирование в CP-1251
    const data = encode(value)
    if (this.buffer.length - this.offset < data.length + 4) {
      throw new Error('Buffer is too small')
    }

    // NOTE: Запись буфера
    let dataLength = data.length
    const dataOffset = this.offset + 4

    this.writeInteger(IntegerTypes.UINT32, this.offset)
    this.buffer.write(data, dataOffset, 'binary')

    // NOTE: Возвращение размера записанных данных
    dataLength += 4
    this.offset += dataLength

    return dataLength
  }

  /**
   * Изменение размера бинарных данных
   * @param action Действие изменения размера данных
   * @param size Размерность действия в байтах
   */
  public resize(action: ResizeActionType, size: number): void {
    if (action === ResizeActionType.DECREASE) {
      this.buffer = this.buffer.subarray(0, this.buffer.length - size)
      return
    }

    this.buffer = Buffer.concat([this.buffer, Buffer.alloc(size).fill(0)])
  }

  /**
   * Смещение по данным
   * @param position Позиция смещения
   * @param from Место начала позиции
   */
  // TODO(synzr): Сообщение ошибки получше надо
  public seek(position: number, from: PositionFrom): void {
    switch (from) {
      case PositionFrom.START: {
        if (position > this.buffer.length - 1) {
          throw new Error('Offset boundary error')
        }

        this.offset = position
        break
      }
      case PositionFrom.CURRENT: {
        if (this.offset + position > this.buffer.length - 1) {
          throw new Error('Offset boundary error')
        }

        this.offset += position
        break
      }
      case PositionFrom.END: {
        if (0 < this.buffer.length - position) {
          throw new Error('Offset boundary error')
        }

        this.offset = this.buffer.length - position
        break
      }
    }
  }
}
