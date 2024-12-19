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
  NO_HELLO_NO_AUTHORIZED = -2,
  /**
   * Означает, что клиент поприветствовал сервер, но не авторизовался
   */
  HELLO_NO_AUTHORIZED = -1,
  /**
   * Означает, что клиент поприветствовал сервер и авторизовался
   */
  HELLO_AUTHORIZED = 0
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
    this.server.logger.debug(
      { clientId: this.id },
      'Client subscribed to events'
    )

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
    this.server.logger.debug(
      { clientId: this.id },
      'Client unsubscribed from events'
    )

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
    this.server.logger.debug(
      { clientId: this.id, dataLength: data.length },
      `Client wrote ${data.length} bytes to the server`
    )

    this.decoder.write(data)
  }

  /**
   * Обработчик события закрытия подключения
   */
  private onRawClose(): void {
    this.server.logger.debug(
      { clientId: this.id },
      'Client closed the connection from server'
    )

    this.server.registry.deregister(this)
    this.unsubscribe()
  }

  /**
   * Обработчик события ошибки при активном соединении
   * @param error Ошибка, возникшая при активном соединении
   */
  private onRawError(error: Error): void {
    if (this.state === MrimClientState.NO_HELLO_NO_AUTHORIZED) {
      this.raw.destroy()
    }

    this.server.logger.error(
      { clientId: this.id, error },
      `Raw client connection error: ${error.message}`
    )
  }
  //#endregion

  //#region Обработчики событий декодера и исполнителя команд
  /**
   * Обработка полученного клиентского пакета протокола MRIM
   * @param clientPacket Пакет протокола MRIM
   */
  private onDecoderPacket(clientPacket: MrimPacket): void {
    const { sequenceNumber, commandCode } = clientPacket.header

    this.server.logger.debug(
      { clientId: this.id, sequenceNumber, commandCode },
      'Received the decoded packet from the decoder'
    )

    this.executor.enqueue(clientPacket)
  }

  /**
   * Обработчик события ошибки декодера
   * @param error Ошибка, возникшая при декодировании пакета
   */
  private onDecoderError(error: Error): void {
    if (this.state !== MrimClientState.HELLO_AUTHORIZED) {
      this.server.logger.warn(
        { clientId: this.id },
        'Client wrote the illegal data, weird behavior'
      )

      this.raw.destroy()
    }

    this.server.logger.error(
      { clientId: this.id, error },
      `Client decoder error: ${error.message}`
    )
  }

  /**
   * Обработка полученного серверного пакета протокола MRIM
   * @param event Событие удачного завершения выполнения команды
   */
  private onExecutorDone(event: DoneEvent): void {
    const { sequenceNumber, serverPacket } = event
    this.server.logger.debug(
      {
        clientId: this.id,
        sequenceNumber,
        hasResponse: serverPacket !== undefined
      },
      'Executor successfully executed the command'
    )

    if (!event.serverPacket) {
      return
    }

    const encodedPacket = event.serverPacket.encode()
    this.raw.write(encodedPacket)
  }

  /**
   * Обработка ошибки при выполнении команды
   * @param event Событие завершения выполнения команды ошибкой
   */
  private onExecutorError(event: ErrorEvent): void {
    const { error } = event

    if (this.state === MrimClientState.NO_HELLO_NO_AUTHORIZED) {
      this.server.logger.warn(
        { clientId: this.id },
        'Client tried to execute the illegal command, weird behavior'
      )

      this.raw.destroy()
    }

    this.server.logger.error(
      { clientId: this.id, error },
      `Executor error: ${error.message}`
    )
  }
  //#endregion
}
