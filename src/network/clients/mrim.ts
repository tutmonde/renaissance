/**
 * @file Файл MRIM-клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import TcpClient, { TcpClientOptions } from './tcp.js'

import { randomUUID, UUID } from 'node:crypto'

import MrimPacketReader from '../../protocol/readers/mrim.js'
import MrimPacketFactory, { MrimPacket } from '../../protocol/factories/mrim.js'
import MrimExecutor from '../../processor/executors/mrim.js'

interface MrimClientOptions extends TcpClientOptions {
  reader: MrimPacketReader
  factory: MrimPacketFactory
  executor: MrimExecutor
}

/**
 * MRIM-клиента
 */
export default class MrimClient extends TcpClient {
  /**
   * Читатель пакетов
   */
  private readonly reader: MrimPacketReader

  /**
   * Фабрика пакетов
   */
  private readonly factory: MrimPacketFactory

  /**
   * Исполнитель команд
   */
  private readonly executor: MrimExecutor

  /**
   * Внутренний идентификатор клиента
   */
  private readonly id: UUID

  constructor(options: MrimClientOptions) {
    super(options)

    this.reader = options.reader
    this.factory = options.factory
    this.executor = options.executor

    this.id = randomUUID()
  }

  protected async onData(data: Buffer): Promise<void> {
    const packet = this.reader.read({ data, id: this.id })

    if (!packet) {
      return this.close() // NOTE: Клиент отправил плохой пакет
    }

    if (typeof packet === 'boolean') {
      return // NOTE: Клиент отправил только часть пакета
    }

    const packets = await this.executor.execute(packet, this)
    if (packets === true) {
      return // NOTE: Сервер выполнил команду, но не отправил результат
    }
    if (packets === false) {
      return this.close() // NOTE: Клиент отправил некорректную команду
    }

    // NOTE: Отправка результаты команды
    for (const packet of packets) {
      const data = this.factory.toBuffer(packet as MrimPacket)
      this.send(data)
    }
  }

  protected onClose(): void {
    console.log('onClose')
    void 0
  }
}
