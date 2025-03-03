/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл MRIM-клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import type { UUID } from 'node:crypto'
import { randomUUID } from 'node:crypto'
import type { Buffer } from 'node:buffer'

import type MrimExecutor from '../../processor/executors/mrim.js'
import type { MrimPacket } from '../../protocol/factories/mrim.js'
import type MrimPacketFactory from '../../protocol/factories/mrim.js'
import type MrimPacketReader from '../../protocol/readers/mrim.js'

import type { TcpClientOptions } from './tcp.js'
import TcpClient from './tcp.js'

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
    if (packet === true) {
      return // NOTE: Клиент отправил только часть пакета
    }
    if (packet === false) {
      return this.close() // NOTE: Клиент отправил плохой пакет
    }

    const packets = await this.executor.execute(packet, this)
    if (packets === true) {
      return // NOTE: Сервер выполнил команду, но не отправил результат
    }
    if (packets === false) {
      return this.close() // NOTE: Клиент отправил некорректную команду
    }

    // NOTE: Отправка результаты команды
    for (const packetToSend of packets) {
      const data = this.factory.toBuffer(packetToSend as MrimPacket)
      this.send(data)
    }
  }

  protected onClose(): void {
    void 0
  }
}
