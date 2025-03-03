/**
 * @file Файл сервиса аутентификации
 * @author synzr <mikhail@autism.net.ru>
 */

import type UserEntity from '../entity/user.js'
import type UserRepository from '../repositories/user/abstract.js'
import { hashPassword } from '../utils/user.js'

/**
 * Настройки сервиса аутентификации
 */
interface AuthServiceOptions {
  repository: UserRepository
}

/**
 * Сервис аутентификации
 */
// TODO(synzr): добавить запись сессии
export default class AuthService {
  /**
   * Репозиторий пользователей
   */
  private readonly repository: UserRepository

  constructor(options: AuthServiceOptions) {
    this.repository = options.repository
  }

  /**
   * Регистрация пользователя в системе
   *
   * WARN: Рекомендуется использовать случайно сгенерированный пароль
   * по причине использования слабого метода хэширования
   * @param localpart Локальная часть адреса пользователя
   * @param password Пароль пользователя
   * @returns Сущность пользователя
   */
  public async register(
    localpart: string,
    password: string,
  ): Promise<UserEntity | false> {
    return await this.repository.create({
      localpart,
      password: hashPassword(password),
    })
  }

  /**
   * Войти пользователя в систему
   * @param localpart Локальная часть адреса пользователя
   * @param password Пароль пользователя
   * @returns Сущность пользователя
   */
  public async login(
    localpart: string,
    password: string,
  ): Promise<UserEntity | false> {
    // NOTE: Получение пользователя по локальной части адреса
    const user = await this.repository.getByLocalpart(localpart)
    if (!user) {
      return user
    }

    // NOTE: Возвращение пользователя, если пароль верный
    return user.validatePassword(password) ? user : false
  }
}
