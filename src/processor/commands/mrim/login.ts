/**
 * @file Файл команды сервера пинга
 * @author synzr <mikhail@autism.net.ru>
 */

import UserEntity from '../../../core/entity/user.js'
import type AuthService from '../../../core/services/auth.js'

import { MrimPacket } from '../../../protocol/factories/mrim.js'
import MrimLoginClientPayload from '../../../protocol/payloads/client/login.js'
import MrimContactListServerPayload, {
  MrimContactListServerStatusCode
} from '../../../protocol/payloads/server/contacts.js'
import MrimMailboxStatusServerPayload from '../../../protocol/payloads/server/mailbox/status.js'
import MrimObjectServerPayload from '../../../protocol/payloads/server/object.js'
import MrimPacketHeader from '../../../protocol/shared/mrim/header.js'

import MrimCommand, { type MrimCommandContext } from './abstract.js'

/**
 * Параметры команды логина от клиента
 */
interface LoginCommandOptions {
  authService: AuthService
}

/**
 * Команда входа в систему
 */
export default class MrimLoginCommand extends MrimCommand {
  /**
   * Сервис аутентификации
   */
  private readonly authService: AuthService

  constructor(options: LoginCommandOptions) {
    super()
    this.authService = options.authService
  }

  /**
   * Создание ответа об успешной авторизации
   * @param header Заголовок пакета
   * @returns Пакет ответа об успешной авторизации в массиве
   */
  private acknowledge(header: MrimPacketHeader): MrimPacket[] {
    header.commandCode = 0x1004 // NOTE: SC_LOGIN_ACK
    return [{ header, payload: null }]
  }

  /**
   * Создания отказа от авторизации
   * @param header Заголовок пакета
   * @returns Пакет отказа от авторизации в массиве
   */
  private reject(header: MrimPacketHeader): MrimPacket[] {
    header.commandCode = 0x1005 // NOTE: SC_LOGIN_REJ
    return [{ header, payload: null }]
  }

  /**
   * Создание пустых пакетов для работоспособности клиента
   * @param context Контекст исполнения команды
   * @param user Пользователь
   * @returns Пакеты для работоспособности клиента
   */
  private generateDummyPackets(
    context: MrimCommandContext,
    user: UserEntity
  ): MrimPacket[] {
    // NOTE: Создание пакета списка контактов
    const contactListHeader = new MrimPacketHeader({
      buffer: context.packet.header.buffer
    })
    contactListHeader.commandCode = 0x1037 // NOTE: SC_CONTACT_LIST2

    const contactListPayload = new MrimContactListServerPayload({
      statusCode: MrimContactListServerStatusCode.OK,
      groups: []
    })

    // NOTE: Создание пакета статуса почтового ящика
    const mailboxStatusHeader = new MrimPacketHeader({
      buffer: context.packet.header.buffer
    })
    mailboxStatusHeader.commandCode = 0x1033 // NOTE: SC_MAILBOX_STATUS

    const mailboxStatusPacket = new MrimMailboxStatusServerPayload({
      unreadCount: 0
    })

    // NOTE: Создание пакета информации о пользователе
    const userInfoHeader = new MrimPacketHeader({
      buffer: context.packet.header.buffer
    })
    userInfoHeader.commandCode = 0x1015 // NOTE: SC_USER_INFO

    const userInfoPayload = new MrimObjectServerPayload()
    userInfoPayload.set('MRIM.NICKNAME', user.getLocalpart()) // TODO(@synzr): добавить псевдоним пользователя
    userInfoPayload.set('MESSAGES.TOTAL', '0')
    userInfoPayload.set('MESSAGES.UNREAD', '0')
    userInfoPayload.set(
      'client.endpoint', // TODO(@synzr, @veselcraft): ???
      `127.0.0.1:${context.client.remotePort}`
    )

    return [
      {
        header: userInfoHeader,
        payload: userInfoPayload
      },
      {
        header: contactListHeader,
        payload: contactListPayload
      },
      {
        header: mailboxStatusHeader,
        payload: mailboxStatusPacket
      }
    ]
  }

  public async execute(context: MrimCommandContext): Promise<MrimPacket[]> {
    // NOTE: Проверка наличия данных в пакете
    if (!context.packet.payload) {
      return this.reject(context.packet.header)
    }

    const payload = new MrimLoginClientPayload({
      buffer: context.packet.payload!.buffer
    })

    // NOTE: Авторизация пользователя
    const user = await this.authService.login(
      payload.address.split('@')[0],
      payload.password
    )
    if (!user) {
      return this.reject(context.packet.header)
    }
    return [
      ...this.acknowledge(context.packet.header),
      ...this.generateDummyPackets(context, user)
    ]
  }
}
