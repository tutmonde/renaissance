/**
 * @file Файл репозиторий пользователей с хранилищем в памяти программы
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { Logger } from 'pino'

import type User from '../../entries/user.js'
import UserEntity from '../../entity/user.js'
import { getUserIdFromParams } from '../../utils/user.js'

import UserRepository from './abstract.js'

/**
 * Настройки репозитория пользователей с хранилищем на сервере MySQL
 */
interface MysqlUserRepositoryOptions {
  pool: Pool
  logger: Logger
}

/**
 * Репозиторий пользователей с хранилищем на сервере MySQL
 */
export default class MysqlUserRepository extends UserRepository {
  /**
   * Пул подключений к серверу MySQL
   */
  private readonly pool: Pool

  /**
   * Логгер
   */
  private readonly logger: Logger

  public constructor(options: MysqlUserRepositoryOptions) {
    super()

    this.pool = options.pool
    this.logger = options.logger
  }

  public async create(user: Partial<User>): Promise<UserEntity | false> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO `user` (`user`.`localpart`, `user`.`password`) VALUES (?, ?)',
      [user.localpart!, user.password!],
    )

    this.logger.info(`MysqlUserRepository: user with localpart ${user.localpart!} created`)
    return new UserEntity({
      // @ts-expect-error не ссы, все будет нормально
      entry: { ...user, id: result.insertId },
      repository: this,
    })
  }

  public async getById(id: number): Promise<UserEntity | false> {
    const [results] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM `user` WHERE `user`.`id` = ?',
      [id],
    )

    if (results.length === 0) {
      this.logger.warn(`MysqlUserRepository: user with id ${id} not found`)
      return false
    }

    this.logger.debug(`MysqlUserRepository: user with id ${id} found`)
    return new UserEntity({
      entry: results[0] as unknown as User,
      repository: this,
    })
  }

  public async getByLocalpart(localpart: string): Promise<UserEntity | false> {
    const [results] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM `user` WHERE `user`.`localpart` = ?',
      [localpart],
    )

    if (results.length === 0) {
      this.logger.warn(`MysqlUserRepository: user with localpart ${localpart} not found`)
      return false
    }

    this.logger.trace(`MysqlUserRepository: user with localpart ${localpart} found`)
    return new UserEntity({
      entry: results[0] as unknown as User,
      repository: this,
    })
  }

  public async changePassword(
    user: UserEntity | User | number,
    password: string,
  ): Promise<void> {
    const userId = getUserIdFromParams(user)
    const [result] = await this.pool.execute<ResultSetHeader>(
      'UPDATE `user` SET `user`.`password` = ? WHERE `user`.`id` = ?',
      [password, userId],
    )

    if (result.affectedRows === 0) {
      return this.logger.warn(
        `MysqlUserRepository: user with id ${userId} not found`,
      )
    }

    this.logger.trace(
      `MysqlUserRepository: password for user with id ${userId} changed`,
    )
  }
}
