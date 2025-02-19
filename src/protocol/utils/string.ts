/**
 * @file Файл с утилитами для работы со строками в данных протокола
 * @author synzr <mikhail@autism.net.ru>
 */

import { decode, encode } from 'windows-1251'

/**
 * Читание строки из необработанных данных
 * @param data Необработанные данные
 * @param offset Смещение по данным (по умолчанию - 0)
 * @returns Строка
 */
export function readString(data: Buffer, offset: number = 0): string {
  const length = data.readUint32LE(offset)
  const raw = data.subarray(offset + 4, offset + length + 4)

  // NOTE: Декодирование из CP-1251 (the worst encoding ever)
  return decode(raw.toString(), { mode: 'replacement' })
}

/**
 * Перевод строки в формат необработанных данных
 * @param value Строка
 * @returns Необработанные данные
 */
export function writeString(value: string): Buffer {
  // NOTE: Кодирование в CP-1251
  const raw = encode(value)

  // NOTE: Запись длины в бинарном виде
  const length = Buffer.alloc(4)
  length.writeUInt32LE(raw.length)

  return Buffer.concat([length, Buffer.from(raw, 'binary')])
}
