/**
 * @file Файл репозиторий пользователей с хранилищем в памяти программы
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Logger } from 'pino'

import type User from '../../entries/user.js'
import UserEntity from '../../entity/user.js'
import { getUserIdFromParams } from '../../utils/user.js'

import UserRepository from './abstract.js'

/**
 * Настройки репозитория пользователей с хранилищем в памяти программы
 */
interface MemoryUserRepositoryOptions {
  users: User[]
  logger: Logger
}

/**
 * Репозиторий пользователей с хранилищем в памяти программы
 */
export default class MemoryUserRepository extends UserRepository {
  /**
   * Пользователи
   */
  private readonly users: User[]

  /**
   * Логгер
   */
  private readonly logger: Logger

  constructor(options: MemoryUserRepositoryOptions) {
    super()

    this.users = options.users
    this.logger = options.logger
  }

  public async create(user: Partial<User>): Promise<UserEntity | false> {
    // NOTE: Проверка уникальности локальной части
    const previousEntry = await this.getByLocalpart(user.localpart!)
    if (previousEntry) {
      this.logger.debug(
        `MemoryUserRepository: user with localpart ${user.localpart} is already exists`,
      )
      return false
    }

    // NOTE: Создание пользователя
    this.users.push({
      id: this.users.length,
      localpart: user.localpart!,
      password: user.password!,
    })
    this.logger.debug(
      `MemoryUserRepository: user with localpart ${user.localpart} created`,
    )

    return new UserEntity({ entry: this.users.at(-1)!, repository: this })
  }

  /**
   * Получение пользователя по значению в поле записи пользователя
   * @param value Значение
   * @param field Поле в записи пользователя
   * @returns Сущность пользователя, либо значение false (значит, что пользователь не найден)
   */
  private getByField(value: unknown, field: string): UserEntity | false {
    // @ts-expect-error NOTE: да, все будет нормально, не ссы
    const userIndex = this.users.findIndex(user => user[field] === value)

    if (userIndex !== -1) {
      this.logger.debug(
        `MemoryUserRepository: user found by specific field; ${field}=${value}`,
      )

      const entry = this.users[userIndex]
      return new UserEntity({ entry, repository: this })
    }

    this.logger.debug(
      `MemoryUserRepository: user not found by specific field; ${field}=${value}`,
    )
    return false
  }

  public async getById(id: number): Promise<UserEntity | false> {
    return this.getByField(id, 'id')
  }

  public async getByLocalpart(localpart: string): Promise<UserEntity | false> {
    return this.getByField(localpart, 'localpart')
  }

  public async changePassword(
    user: UserEntity | User | number,
    password: string,
  ): Promise<void> {
    const userId = getUserIdFromParams(user)
    const userIndex = this.users.findIndex(otherUser => otherUser.id === userId)

    if (userIndex !== -1) {
      this.logger.debug(
        `MemoryUserRepository: password of user ${userId} was changed`,
      )
      this.users[userIndex].password = password
    }
  }
}
