/**
 * @file Файл репозиторий пользователей с хранилищем в памяти программы
 * @author synzr <mikhail@autism.net.ru>
 */

import UserRepository from './abstract.js'
import User from '../../entries/user.js'
import UserEntity from '../../entity/user.js'

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

  public async create(user: Partial<User>): Promise<UserEntity> {
    const createdUser: User = {
      id: this.users.length,
      localpart: user.localpart!,
      password: user.password!
    }

    this.users.push(createdUser)
    return new UserEntity(createdUser, this)
  }

  private async getByField<T>(value: T, field: string): Promise<UserEntity | false> {
    // @ts-expect-error NOTE: да, все будет нормально, не ссы
    const userIndex = this.users.findIndex((user) => user[field] === value);

    if (userIndex !== -1) {
      return new UserEntity(this.users[userIndex], this);
    }

    return false;
  }

  public async getById(id: number): Promise<UserEntity | false> {
    return this.getByField(id, 'id')
  }

  public getByLocalpart(localpart: string): Promise<UserEntity | false> {
    return this.getByField(localpart, 'localpart')
  }
}
