/**
 * @file Файл полезных данных списка контактов
 * @author synzr <mikhail@autism.net.ru>
 */

import { Buffer } from 'node:buffer'

import BinaryData, { IntegerTypes, PositionFrom } from '../../shared/binary.js'

/**
 * Код статуса получения списка контактов
 */
export enum MrimContactListServerStatusCode {
  OK = 0,
  ERROR = 1,
  INTERNAL_ERROR = 2,
}

/**
 * Параметры полезных данных команды получения списка контактов
 */
interface MrimContactListServerPayloadOptions {
  /**
   * Код статуса получения списка контактов
   */
  statusCode: MrimContactListServerStatusCode

  /**
   * Группы контактов
   */
  // TODO: Создать класс для структуры группы контактов
  groups: []
}

/**
 * Полезные данные команды получения списка контактов
 */
// TODO: Возможность большего количества полей в структуре группы контактов
export default class MrimContactListServerPayload extends BinaryData {
  public constructor(options: MrimContactListServerPayloadOptions) {
    super({ buffer: Buffer.alloc(8) })
    this.writeInteger(IntegerTypes.INT32, options.statusCode)
    this.writeInteger(IntegerTypes.INT32, options.groups.length)
    this.writeString('us') // NOTE: Содержание структуры группы контактов
    this.writeString('uussuus') // NOTE: Содержание структуры контакта
  }

  /**
   * Код статуса получения списка контактов
   */
  public get statusCode(): MrimContactListServerStatusCode {
    this.seek(0, PositionFrom.START)
    return this.readInteger(IntegerTypes.INT32)
  }

  /**
   * Количеств полученных групп контактов
   */
  public get groupsCount(): number {
    this.seek(4, PositionFrom.START)
    return this.readInteger(IntegerTypes.INT32)
  }

  /**
   * Структура группы
   */
  public get groupStructure(): string {
    this.seek(8, PositionFrom.START)
    return this.readString()
  }

  /**
   * Смещение структуры контакта
   */
  private get contactStructureOffset(): number {
    return 12 + this.groupStructure.length
  }

  /**
   * Структура контакта
   */
  public get contactStructure(): string {
    this.seek(this.contactStructureOffset, PositionFrom.START)
    return this.readString()
  }
}
