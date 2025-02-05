/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @file Файл MRIM-клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import { randomUUID, UUID } from 'node:crypto'

import MrimPacketReader from '../../protocol/readers/mrim.js'
import TcpClient, { TcpClientOptions } from './tcp.js'

interface MrimClientOptions extends TcpClientOptions {
  reader: MrimPacketReader
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
   * Внутренний идентификатор клиента
   */
  private readonly id: UUID

  constructor(options: MrimClientOptions) {
    super(options)
    this.reader = options.reader
    this.id = randomUUID()
  }

  protected onData(data: Buffer): void {
    const readerResult = this.reader.read({ data, id: this.id })

    if (!readerResult) {
      return this.close() // NOTE: Клиент отправил плохой пакет
    }

    if (typeof readerResult === 'boolean') {
      return // NOTE: Клиент отправил только часть пакета
    }

    return // TODO: Реализовать MRIMCommandExecutor
  }

  protected onClose(): void {
    void 0
  }
}
