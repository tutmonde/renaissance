/**
 * @file Файл MRIM-сервера
 * @author synzr <mikhail@autism.net.ru>
 */

import { Socket } from 'node:net'
import TcpServer, { TcpServerOptions } from './tcp.js'

import MrimClient from '../clients/mrim.js'
import MrimPacketReader from '../../protocol/readers/mrim.js'
import MrimPacketFactory from '../../protocol/factories/mrim.js'
import MrimExecutor from '../../processor/executors/mrim.js'

/**
 * MRIM-сервер
 */
export default class MrimServer extends TcpServer {
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

  constructor(options: TcpServerOptions) {
    super(options)

    this.factory = new MrimPacketFactory()
    this.reader = new MrimPacketReader({ factory: this.factory })
    this.executor = new MrimExecutor()
  }

  protected handle(socket: Socket): void {
    const clientOptions = {
      socket,
      server: this,
      reader: this.reader,
      factory: this.factory,
      executor: this.executor
    }
    const client = new MrimClient(clientOptions)

    this.clients.push(client)
  }
}
