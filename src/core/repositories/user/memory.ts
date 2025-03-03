/**
 * @file Файл репозиторий пользователей с хранилищем в памяти программы
 * @author synzr <mikhail@autism.net.ru>
 */

import type User from '../../entries/user.js'
import UserEntity from '../../entity/user.js'
import { getUserIdFromParams } from '../../utils/user.js'

import UserRepository from './abstract.js'

/**
 * Репозиторий пользователей с хранилищем в памяти программы
 */
export default class MemoryUserRepository extends UserRepository {
  /**
   * Пользователи
   */
  private readonly users: User[]

  constructor(users: User[]) {
    super()
    this.users = users
  }

  public async create(user: Partial<User>): Promise<UserEntity | false> {
    // NOTE: Проверка уникальности локальной части
    const previousEntry = await this.getByLocalpart(user.localpart!)
    if (previousEntry) {
      return false
    }

    // NOTE: Создание пользователя
    this.users.push({
      id: this.users.length,
      localpart: user.localpart!,
      password: user.password!,
    })
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
      const entry = this.users[userIndex]
      return new UserEntity({ entry, repository: this })
    }

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
    const userIndex = this.users.findIndex(
      otherUser => otherUser.id === getUserIdFromParams(user),
    )

    if (userIndex !== -1) {
      this.users[userIndex].password = password
    }
  }
}
