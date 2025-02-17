/**
 * @file Файл абстрактного фабрики сущностей
 * @author synzr <mikhail@autism.net.ru>
 */

import Entry from '../../entries/entry.js'
import Entity from '../abstract.js'

/**
 * Абстрактная фабрика сущностей
 */
export default abstract class EntityFactory {
  /**
   * Создание сущности из записи
   * @param entry Запись
   * @returns Сущность
   */
  public abstract fromEntry(entry: Entry): Entity

  /**
   * Создание записи из сущности
   * @param entity Сущность
   * @returns Запись
   */
  public abstract toEntry(entity: Entity): Entry
}
