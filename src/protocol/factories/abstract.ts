/**
 * @file Файл абстрактной фабрики пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Buffer } from 'node:buffer'

import { UnknownPacket } from '../packet.js'

/**
 * Абстрактная фабрика пакетов
 */
export default abstract class PacketFactory {
  /**
   * Создание пакета из необработанных данных
   * @param data Необработанные данные
   * @returns Пакет
   */
  public abstract fromBuffer(data: Buffer): UnknownPacket

  /**
   * Создание необработанных данных из пакета
   * @param packet Пакет
   * @returns Необработанные данные
   */
  public abstract toBuffer(packet: UnknownPacket): Buffer
}
