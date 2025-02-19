/**
 * @file Файл с утилитами для работы со сообщением
 * @author synzr <mikhail@autism.net.ru>
 */

import { MrimPacket } from '../factories/mrim.js'

/**
 * Создать пакет без полезных данных
 * @param baseHeader Основа заголовока
 * @param commandCode Код команды
 * @returns Пакет без полезных данных
 */
export function createEmptyPacket(
  baseHeader: MrimPacket['header'],
  commandCode: number
): MrimPacket {
  return {
    header: {
      ...baseHeader,
      payloadLength: 0,
      commandCode,
      sourceAddress: {
        address: '0.0.0.0',
        port: 0,
        family: 'ipv4'
      }
    },
    payload: null
  }
}
