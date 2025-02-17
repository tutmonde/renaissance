/**
 * @file Файл сущности пользователя
 * @author synzr <mikhail@autism.net.ru>
 */

import User from '../entries/user.js';
import UserRepository from '../repositories/user/abstract.js'

import Entity from './abstract.js'

import crypto from 'node:crypto'

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

  constructor(entry: User, repository: UserRepository) {
    super()

    this.id = entry.id
    this.localpart = entry.localpart
    this.password = entry.password

    this.repository = repository
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

  public validatePassword(password: string): boolean {
    const hash = crypto.createHash('md5').update(password).digest('hex')
    return this.password.toLowerCase() === hash.toLowerCase()
  }

  public changePassword(password: string): void {
    this.password = crypto.createHash('md5').update(password).digest('hex')
  }
}
