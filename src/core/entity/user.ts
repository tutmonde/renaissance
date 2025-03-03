/**
 * @file Файл сущности пользователя
 * @author synzr <mikhail@autism.net.ru>
 */

import type User from '../entries/user.js'
import type UserRepository from '../repositories/user/abstract.js'
import { hashPassword } from '../utils/user.js'

import Entity from './abstract.js'

/**
 * Настройки сущности пользователя
 */
interface UserEntityOptions {
  entry: User
  repository: UserRepository
}

/**
 * Сущность пользователя
 */
export default class UserEntity extends Entity {
  /**
   * Идентификатор пользователя
   */
  private readonly id: number

  /**
   * Локальная часть адрес пользователя
   */
  private readonly localpart: string

  /**
   * Хэш пароля пользователя
   */
  private password: string

  /**
   * Репозиторий пользователей
   */
  private readonly repository: UserRepository

  constructor(options: UserEntityOptions) {
    super()

    this.id = options.entry.id
    this.localpart = options.entry.localpart
    this.password = options.entry.password

    this.repository = options.repository
  }

  public getId(): number {
    return this.id
  }

  /**
   * @returns Локальная часть адрес пользователя
   */
  public getLocalpart(): string {
    return this.localpart
  }

  /**
   * Проверка пароля пользователя
   * @param password Пароль пользователя
   * @returns Верный ли пароль?
   */
  public validatePassword(password: string): boolean {
    return hashPassword(password) === this.password
  }

  /**
   * Замена пароля пользователя
   * @param password Пароль пользователя в чистом виде
   */
  public changePassword(password: string): void {
    this.password = hashPassword(password)
    this.repository.changePassword(this, this.password)
  }
}
