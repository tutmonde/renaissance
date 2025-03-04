/**
 * @file Файл абстрактной фабрики пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Buffer } from 'node:buffer'

import type { Packet } from '../shared/packet.js'

/**
 * Абстрактная фабрика пакетов
 */
export default abstract class PacketFactory {
  /**
   * Создание пакета из необработанных данных
   * @param data Необработанные данные
   * @returns Пакет
   */
  public abstract fromBuffer(data: Buffer): Packet

  /**
   * Создание необработанных данных из пакета
   * @param packet Пакет
   * @returns Необработанные данные
   */
  public abstract toBuffer(packet: Packet): Buffer
}
