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
   * @returns Сущность пользователя
   */
  public abstract create(user: Partial<User>): Promise<UserEntity>

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
}
