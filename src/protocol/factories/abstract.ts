/**
 * @file Файл абстрактной фабрики пакетов
 * @author synzr <mikhail@autism.net.ru>
 */

import { UnknownMessage } from '../message.js'

/**
 * Абстрактная фабрика пакетов
 */
export default abstract class PacketFactory {
  /**
   * Создание сообщения из необработанных данных
   * @param data Необработанные данные
   * @returns Сообщение
   */
  public abstract fromBuffer(data: Buffer): UnknownMessage

  /**
   * Создание необработанных данных из сообщения
   * @param message Сообщение
   * @returns Необработанные данные
   */
  public abstract toBuffer(message: UnknownMessage): Buffer
}
