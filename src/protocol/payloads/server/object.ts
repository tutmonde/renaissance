/**
 * @file Файл полезных данных неструктурного объекта
 * @author synzr <mikhail@autism.net.ru>
 */

import { Buffer } from 'node:buffer'

import BinaryData, {
  PositionFrom,
  ResizeActionType,
} from '../../shared/binary.js'

/**
 * Полезные данные неструктурного объекта
 */
export default class MrimObjectServerPayload extends BinaryData {
  public constructor() {
    super({ buffer: Buffer.alloc(0) })
  }

  /**
   * Добавление параметра в полезные данные
   *
   * WARN: Функция не проверяет, что параметр уже существует
   *       и просто добавляет его в конец
   * @param key Ключ параметра
   * @param value Значение параметра
   */
  public set(key: string, value: string): void {
    this.seek(0, PositionFrom.END)
    this.resize(ResizeActionType.INCREASE, key.length + value.length + 8)

    this.writeString(key)
    this.writeString(value)
  }

  /**
   * Преобразование полезных данных в карту
   */
  public toMap(): Map<string, string> {
    const result = new Map()

    this.seek(0, PositionFrom.START)
    while (this.offset < this.length) {
      result.set(this.readString(), this.readString())
    }

    return result
  }

  /**
   * Получение значения параметра из полезных данных
   * @param key Ключ параметра
   * @returns Значение параметра или undefined, если параметр не найден
   */
  public get(key: string): string | undefined {
    return this.toMap().get(key)
  }
}
