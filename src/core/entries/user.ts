/**
 * @file Файл интерфейс записи пользователя
 * @author synzr <mikhail@autism.net.ru>
 */

import type Entry from './base.js'

/**
 * Интерфейс записи пользователя
 */
export default interface User extends Entry {
  /**
   * Локальная часть адрес пользователя
   */
  localpart: string

  /**
   * Хэш пароля пользователя
   */
  password: string
}
