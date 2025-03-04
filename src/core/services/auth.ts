/**
 * @file Файл сервиса аутентификации
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Logger } from 'pino'

import type UserEntity from '../entity/user.js'
import type UserRepository from '../repositories/user/abstract.js'
import { hashPassword } from '../utils/user.js'

/**
 * Настройки сервиса аутентификации
 */
interface AuthServiceOptions {
  repository: UserRepository
  logger: Logger
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

  /**
   * Логгер
   */
  private readonly logger: Logger

  constructor(options: AuthServiceOptions) {
    this.repository = options.repository
    this.logger = options.logger
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
    this.logger.trace(`AuthService: creating user ${localpart}`)

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
      this.logger.trace(`AuthService: user ${localpart} not found`)
      return user
    }

    // NOTE: Возвращение пользователя, если пароль верный
    if (user.validatePassword(password)) {
      this.logger.trace(`AuthService: user ${localpart} authorized successfully`)
      return user
    }

    this.logger.warn(`AuthService: user ${localpart} not authorized`)
    return false
  }
}
