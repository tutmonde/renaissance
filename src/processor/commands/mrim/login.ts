/**
 * @file Файл команды сервера пинга
 * @author synzr <mikhail@autism.net.ru>
 */

import UserEntity from '../../../core/entity/user.js'
import AuthService from '../../../core/services/auth.js'
import { MrimPacket } from '../../../protocol/factories/mrim.js'
import { createEmptyPacket } from '../../../protocol/utils/packet.js'
import { readString, writeString } from '../../../protocol/utils/string.js'
import Command, { CommandContext } from '../abstract.js'

interface LoginCommandOptions {
  authService: AuthService
}

interface LoginPayloadData {
  /**
   * Логин пользователя (то есть, локальная часть адреса)
   */
  login: string

  /**
   * Пароль пользователя
   */
  password: string

  /**
   * Статус пользователя
   */
  status: number

  /**
   * Юзер-агент (идентификатор клиента пользователя)
   */
  userAgent: string
}

export default class LoginCommand extends Command {
  /**
   * Сервис аутентификации
   */
  private readonly authService: AuthService

  constructor (options: LoginCommandOptions) {
    super()
    this.authService = options.authService
  }

  /**
   * Читание информации из необработанных полезных данных
   * @param payload Необработанные полезные данные
   * @returns Информация
   */
  private parsePayload(payload: Buffer): LoginPayloadData {
    const login = readString(payload) // NOTE: Логин пользователя
    const password = readString(payload, login.length + 4) // NOTE: Пароль пользователя
    const status = payload.readUInt32LE(login.length + password.length + 8) // NOTE: Статус пользователя
    const userAgent = readString(payload, login.length + password.length + 12) // NOTE: Юзер-агент

    return { login, password, status, userAgent }
  }

  /**
   * Создание пустого пакета группы контактов
   * @param baseHeader Основа заголовока
   * @returns Пакет
   */
  private createContactListPacket(baseHeader: MrimPacket['header']): MrimPacket {
    const packet = createEmptyPacket(baseHeader, 0x1037) // NOTE: SC_CONTACT_LIST2

    // NOTE: Пустые полезные данные
    packet.payload = Buffer.concat([
      Buffer.alloc(8).fill(0),
      writeString('us'),
      writeString('uussuus')
    ])

    return packet
  }

  /**
   * Создание пустого пакета статус почтового ящика
   * @param baseHeader Основа заголовока
   * @returns Пакет
   */
  private createMailboxStatusPacket(baseHeader: MrimPacket['header']): MrimPacket {
    const packet = createEmptyPacket(baseHeader, 0x1033) // NOTE: SC_MAILBOX_STATUS
    packet.payload = Buffer.alloc(4).fill(0)

    return packet
  }

  /**
   * Создание пустого пакета информации о текущем пользователе
   * @param baseHeader Основа заголовока
   * @param user Сущность пользователя
   * @returns Пакет
   */
  private createUserInfoPacket(
    baseHeader: MrimPacket['header'],
    user: UserEntity
  ): MrimPacket {
    const packet = createEmptyPacket(baseHeader, 0x1015) // NOTE: SC_USER_INFO

    packet.payload = Buffer.concat([
      // NOTE: Имя/Ник пользователя
      writeString('MRIM.NICKNAME'),
      writeString(user.getLocalpart()),
      // NOTE: Количество пришедших писем на электронную почту
      writeString('MESSAGES.TOTAL'),
      Buffer.alloc(4).fill(0),
      // NOTE: Количество непрочитанных сообщений на эл. почте
      writeString('MESSAGES.UNREAD'),
      Buffer.alloc(4).fill(0),
      // NOTE: Неизвестное значение
      writeString('client.endpoint'),
      writeString('127.0.0.1:13562'),
    ])

    return packet
  }

  public async execute(context: CommandContext): Promise<MrimPacket[]> {
    const payload = this.parsePayload(context.packet.payload! as Buffer)
    const header = context.packet.header as MrimPacket['header']

    // NOTE: Войти в систему через сервис аутентификации
    const user = await this.authService.login(
      payload.login.split('@')[0],
      payload.password
    )
    if (user === false) {
      return [
        // NOTE: SC_LOGIN_REJ
        createEmptyPacket(header, 0x1005)
      ]
    }

    return [
      // NOTE: SC_LOGIN_ACK
      createEmptyPacket(header, 0x1004),
      this.createContactListPacket(header),
      this.createMailboxStatusPacket(header),
      this.createUserInfoPacket(header, user),
    ]
  }
}
