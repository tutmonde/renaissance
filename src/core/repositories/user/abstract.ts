/**
 * @file Файл абстрактный репозиторий пользователей
 * @author synzr <mikhail@autism.net.ru>
 */

import UserEntity from '../../entity/user.js'
import User from '../../entries/user.js'

/**
 * Абстрактный репозиторий пользователей
 */
export default abstract class UserRepository {
  /**
   * Создание пользователя в репозиторий
   * @param user Запись пользователя
   * @returns Сущность пользователя, либо значение false
   *          (значит, что заданная локальная часть адреса уже используется)
   */
  public abstract create(user: Partial<User>): Promise<UserEntity | false>

  /**
   * Получение пользователя по идентификатору записи
   * @param id Идентификатор записи пользователя
   * @returns Сущность пользователя, либо значение false (значит, что пользователь не найден)
   */
  public abstract getById(id: number): Promise<UserEntity | false>

  /**
   * Получение пользователя по локальной части адреса
   * @param localpart Локальная часть адреса пользователя
   * @returns Сущность пользователя, либо значение false (значит, что пользователь не найден)
   */
  public abstract getByLocalpart(localpart: string): Promise<UserEntity | false>

  /**
   * Изменение хэша пароля пользователя
   * @param user Пользователь (либо сущность, либо запись, либо идентификатор запись)
   * @param password Новый хэш пароля пользователя
   */
  public abstract changePassword(
    user: UserEntity | User | number,
    password: string
  ): Promise<void>
}
