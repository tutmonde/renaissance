/**
 * @file Реализация MRIM-клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimPacket from '../protocol/packet.js'
import MrimClientDecoder from './decoder.js'
import MrimServer from '../server/index.js'
import { UUID } from 'node:crypto'
import { Socket } from 'node:net'
import MrimClientExecutor, { DoneEvent, ErrorEvent } from './executor.js'

/**
 * Состояние клиента
 */
export enum MrimClientState {
  /**
   * Означает, что клиент не поприветствовал сервер и не авторизовался
   */
  NO_HELLO_NO_AUTHORIZED,
  /**
   * Означает, что клиент поприветствовал сервер, но не авторизовался
   */
  HELLO_NO_AUTHORIZED,
  /**
   * Означает, что клиент поприветствовал сервер и авторизовался
   */
  HELLO_AUTHORIZED
}

/**
 * Реализация клиента в MRIM-сервере
 */
export default class MrimClient {
  public readonly id: UUID

  private readonly raw: Socket

  private readonly decoder: MrimClientDecoder
  private readonly executor: MrimClientExecutor

  /**
   * Сервер клиента
   */
  public readonly server: MrimServer
  /**
   * Состояние клиента
   */
  public state: MrimClientState = MrimClientState.NO_HELLO_NO_AUTHORIZED

  public constructor(socket: Socket, server: MrimServer) {
    this.id = crypto.randomUUID()

    this.raw = socket
    this.server = server

    this.decoder = new MrimClientDecoder()
    this.executor = new MrimClientExecutor(this)

    this.subscribe()
  }

  //#region Функции подписки и отписки
  /**
   * Подписка на события сырого подключения
   */
  private subscribe(): void {
    this.raw.on('data', this.onRawData.bind(this))
    this.raw.on('error', this.onRawError.bind(this))
    this.raw.on('close', this.onRawClose.bind(this))

    this.decoder.on('packet', this.onDecoderPacket.bind(this))
    this.decoder.on('error', this.onDecoderError.bind(this))

    this.executor.on('done', this.onExecutorDone.bind(this))
    this.executor.on('error', this.onExecutorError.bind(this))
    this.executor.enable()
  }

  /**
   * Отписка от событий сырого подключения
   */
  private unsubscribe(): void {
    this.raw.off('data', this.onRawData.bind(this))
    this.raw.off('error', this.onRawError.bind(this))
    this.raw.off('close', this.onRawClose.bind(this))

    this.decoder.off('packet', this.onDecoderPacket.bind(this))
    this.decoder.off('error', this.onDecoderError.bind(this))

    this.executor.off('done', this.onExecutorDone.bind(this))
    this.executor.off('error', this.onExecutorError.bind(this))
    this.executor.disable()
  }
  //#endregion

  //#region Обработчики событий сырого подключения
  /**
   * Обработчик события получения данных
   * @param data Необработанные данные
   */
  private onRawData(data: Buffer): void {
    this.decoder.write(data)
  }

  /**
   * Обработчик события закрытия подключения
   */
  private onRawClose(): void {
    this.server.registry.deregister(this)
    this.unsubscribe()
  }

  /**
   * Обработчик события ошибки при активном соединении
   * @param error Ошибка, возникшая при активном соединении
   * @todo Добавить полноценный логгер
   */
  private onRawError(error: Error): void {
    if (this.state === MrimClientState.NO_HELLO_NO_AUTHORIZED) {
      this.raw.destroy()
    }

    console.error('raw connection error:', error)
  }
  //#endregion

  //#region Обработчики событий декодера и исполнителя команд
  /**
   * Обработка полученного клиентского пакета протокола MRIM
   * @param clientPacket Пакет протокола MRIM
   */
  private onDecoderPacket(clientPacket: MrimPacket): void {
    this.executor.enqueue(clientPacket)
  }

  /**
   * Обработчик события ошибки декодера
   * @param error Ошибка, возникшая при декодировании пакета
   * @todo Добавить полноценный логгер
   */
  private onDecoderError(error: Error): void {
    if (this.state !== MrimClientState.HELLO_AUTHORIZED) {
      this.raw.destroy()
    }

    console.error('decoder error:', error)
  }

  /**
   * Обработка полученного серверного пакета протокола MRIM
   * @param event Событие удачного завершения выполнения команды
   */
  private onExecutorDone(event: DoneEvent): void {
    if (!event.serverPacket) {
      return
    }

    const encodedPacket = event.serverPacket.encode()
    this.raw.write(encodedPacket)
  }

  /**
   * Обработка ошибки при выполнении команды
   * @param event Событие завершения выполнения команды ошибкой
   * @todo Добавить полноценный логгер
   */
  private onExecutorError(event: ErrorEvent): void {
    if (this.state === MrimClientState.NO_HELLO_NO_AUTHORIZED) {
      this.raw.destroy()
    }

    console.error('executor error:', event.error)
  }
  //#endregion
}
