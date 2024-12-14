import MrimClientDecoder, { PacketEvent } from './decoder.js'
import MrimServer from './index.js'
import { UUID } from 'node:crypto'
import { Socket } from 'node:net'

/**
 * Реализация клиента в MRIM-сервере
 */
export default class MrimClient {
  public readonly id: UUID

  private readonly raw: Socket
  private readonly server: MrimServer
  private readonly decoder: MrimClientDecoder

  constructor(socket: Socket, server: MrimServer) {
    this.id = crypto.randomUUID()

    this.raw = socket
    this.server = server
    this.decoder = new MrimClientDecoder()

    this.subscribe()
  }

  //#region Функции подписки и отписки
  /**
   * Подписка на события сырого подключения
   */
  private subscribe(): void {
    this.raw.on('data', this.onData.bind(this))
    this.decoder.on('packet', this.onPacket.bind(this))

    this.raw.on('close', this.onClose.bind(this))
  }

  /**
   * Отписка от событий сырого подключения
   */
  private unsubscribe(): void {
    this.raw.off('data', this.onData)
    this.decoder.off('packet', this.onPacket)

    this.raw.off('close', this.onClose)
  }
  //#endregion

  //#region Обработчики событий сырого подключения
  /**
   * Обработчик события получения данных
   * @param data Необработанные данные
   */
  private onData(data: Buffer): void {
    this.decoder.write(data)
  }

  /**
   * Обработчик события закрытия подключения
   */
  private onClose(): void {
    this.server.registry.deregister(this)
    this.unsubscribe()
  }
  //#endregion

  private onPacket(event: PacketEvent<never>): void {
    console.log(event.header.commandCode)
  }
}
