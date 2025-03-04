/**
 * @file Файл полезных данных логина от клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import BinaryData, { IntegerTypes, PositionFrom } from '../../shared/binary.js'

/**
 * Полезные данные логина от клиента
 */
export default class MrimLoginClientPayload extends BinaryData {
  /**
   * Смещение пароля
   */
  private get passwordOffset(): number {
    return this.address.length + 4
  }

  /**
   * Смещение статуса
   */
  private get statusOffset(): number {
    return this.address.length + this.password.length + 8
  }

  /**
   * Смещение юзер-агента
   */
  private get userAgentOffset(): number {
    return this.address.length + this.password.length + 12
  }

  /**
   * Адрес пользователя
   */
  public get address(): string {
    this.seek(0, PositionFrom.START)
    return this.readString()
  }

  public set address(login: string) {
    this.seek(0, PositionFrom.START)
    this.writeString(login)
  }

  /**
   * Пароль пользователя
   */
  public get password(): string {
    this.seek(this.passwordOffset, PositionFrom.START)
    return this.readString()
  }

  public set password(password: string) {
    this.seek(this.passwordOffset, PositionFrom.START)
    this.writeString(password)
  }

  /**
   * Статус пользователя
   */
  public get status(): number {
    this.seek(this.statusOffset, PositionFrom.START)
    return this.readInteger(IntegerTypes.INT32)
  }

  public set status(status: number) {
    this.seek(this.statusOffset, PositionFrom.START)
    this.writeInteger(IntegerTypes.INT32, status)
  }

  /**
   * Юзер-агент (идентификатор клиента пользователя)
   */
  public get userAgent(): string {
    this.seek(this.userAgentOffset, PositionFrom.START)
    return this.readString()
  }

  public set userAgent(userAgent: string) {
    this.seek(this.userAgentOffset, PositionFrom.START)
    this.writeString(userAgent)
  }
}
