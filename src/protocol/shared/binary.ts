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
export interface BinaryDataOptions {
  buffer: Buffer
}

/**
 * Бинарные данные
 */
export default class BinaryData {
  /**
   * Необработанные бинарные данные
   */
  private _buffer: Buffer

  /**
   * Смещение в данных
   */
  private _offset: number = 0

  constructor(options: BinaryDataOptions) {
    this._buffer = options.buffer
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
        return this._buffer.readInt8(this._offset++)
      case IntegerTypes.UINT8:
        return this._buffer.readUInt8(this._offset++)
      // 2 байта
      case IntegerTypes.INT16: {
        const value = this._buffer.readInt16LE(this._offset)
        this._offset += 2

        return value
      }
      case IntegerTypes.UINT16: {
        const value = this._buffer.readUInt16LE(this._offset)
        this._offset += 2

        return value
      }
      // 4 байта
      case IntegerTypes.INT32: {
        const value = this._buffer.readInt32LE(this._offset)
        this._offset += 4

        return value
      }
      case IntegerTypes.UINT32: {
        const value = this._buffer.readUInt32LE(this._offset)
        this._offset += 4

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
  public writeInteger(integer: IntegerTypes, value: number): void {
    switch (integer) {
      // 1 байт
      case IntegerTypes.INT8: {
        this._buffer.writeInt8(value, this._offset++)
        return
      }
      case IntegerTypes.UINT8: {
        this._buffer.writeUint8(value, this._offset++)
        return
      }
      // 2 байта
      case IntegerTypes.INT16: {
        this._buffer.writeInt16LE(value, this._offset)
        this._offset += 2

        return
      }
      case IntegerTypes.UINT16: {
        this._buffer.writeUint16LE(value, this._offset)
        this._offset += 2

        return
      }
      // 4 байта
      case IntegerTypes.INT32: {
        this._buffer.writeInt32LE(value, this._offset)
        this._offset += 4

        return
      }
      case IntegerTypes.UINT32: {
        this._buffer.writeUInt32LE(value, this._offset)
        this._offset += 4

        return
      }
    }
  }

  /**
   * Читание строки из необработанных бинарных данных
   * @returns Строка
   */
  public readString(): string {
    const dataLength = this.readInteger(IntegerTypes.UINT32)

    // NOTE: Декодирование из CP-1251 (the worst encoding ever)
    const result = decode(
      this._buffer
        .subarray(this._offset, this._offset + dataLength)
        .toString('binary'),
      { mode: 'replacement' }
    )

    // NOTE: Установка смещения
    this._offset += dataLength
    return result
  }

  /**
   * Запись строки в необработанные бинарные данные
   * @param value Строка
   */
  public writeString(value: string): void {
    // NOTE: Кодирование в CP-1251
    const data = Buffer.from(encode(value))
    if (this._buffer.length - this._offset < 4 + data.length) {
      this.resize(ResizeActionType.INCREASE, 4 + data.length)
    }

    // NOTE: Запись буфера
    this.writeInteger(IntegerTypes.UINT32, data.length)
    this._buffer.set(data, this._offset)

    // NOTE: Обновление смещения
    this._offset += data.length
  }

  /**
   * Изменение размера бинарных данных
   * @param action Действие изменения размера данных
   * @param size Размерность действия в байтах
   */
  public resize(action: ResizeActionType, size: number): void {
    if (action === ResizeActionType.DECREASE) {
      this._buffer = this._buffer.subarray(0, this._buffer.length - size)
      return
    }

    this._buffer = Buffer.concat([this._buffer, Buffer.alloc(size).fill(0)])
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
        if (position > this._buffer.length - 1) {
          throw new Error('Offset boundary error')
        }

        this._offset = position
        break
      }
      case PositionFrom.CURRENT: {
        if (this._offset + position > this._buffer.length - 1) {
          throw new Error('Offset boundary error')
        }

        this._offset += position
        break
      }
      case PositionFrom.END: {
        if (this._buffer.length - position < 0) {
          throw new Error('Offset boundary error')
        }

        this._offset = this._buffer.length - position
        break
      }
    }
  }

  /**
   * Копия буфера бинарных данных
   */
  public get buffer(): Buffer {
    return Buffer.from(this._buffer)
  }

  /**
   * Текцщая позиция в бинарных данных
   */
  public get offset(): number {
    return this._offset
  }

  /**
   * Длина бинарных данных
   */
  public get length(): number {
    return this._buffer.length
  }
}
