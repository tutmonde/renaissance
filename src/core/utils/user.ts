/**
 * @file Файл с утилитами для работы с данными пользователя
 * @author synzr <mikhail@autism.net.ru>
 */

import crypto from 'node:crypto'

import type User from '../entries/user.js' // eslint-disable-line perfectionist/sort-imports
import UserEntity from '../entity/user.js'

/**
 * Хэширование пароля пользователя
 *
 * WARN: Используется MD5 по причине необходимости в совместимости версии протокола >1.22
 * @param password Пароль в чистом виде
 * @returns Пароль в виде хэша
 */
export function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex').toLowerCase()
}

/**
 * Получение идентификатора пользователя из параметров
 * @param user Параметр пользователя
 * @returns Идентификатор пользователя
 */
export function getUserIdFromParams(user: UserEntity | User | number): number {
  if (user instanceof UserEntity) {
    return user.getId()
  }

  if (typeof user === 'object') {
    return user.id
  }

  return user
}
