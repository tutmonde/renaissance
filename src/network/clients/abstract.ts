/**
 * @file Файл абстрактного клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Buffer } from 'node:buffer'

/**
 * Абстрактный клиент
 */
export default abstract class Client {
  /**
   * Получение состояния клиента (подключен/не подключен)
   */
  public abstract connected(): boolean

  /**
   * Отправка данных клиенту
   * @param data Бинарные данные для отправки
   */
  public abstract send(data: Buffer): void
}
