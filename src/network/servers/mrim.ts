/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл MRIM-сервера
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Socket } from 'node:net'

import MemoryUserRepository from '../../core/repositories/user/memory.js'
import AuthService from '../../core/services/auth.js'
import { hashPassword } from '../../core/utils/user.js'
import MrimExecutor from '../../processor/executors/mrim.js'
import MrimPacketFactory from '../../protocol/factories/mrim.js'
import MrimPacketReader from '../../protocol/readers/mrim.js'
import MrimClient from '../clients/mrim.js'

import type { TcpServerOptions } from './tcp.js'
import TcpServer from './tcp.js'

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

    // TODO(synzr): фу
    this.executor = new MrimExecutor({
      authService: new AuthService({
        repository: new MemoryUserRepository([
          {
            id: 1,
            localpart: 'synzr',
            password: hashPassword('synzr'),
          },
        ]),
      }),
    })
  }

  protected handle(socket: Socket): void {
    const clientOptions = {
      socket,
      server: this,
      reader: this.reader,
      factory: this.factory,
      executor: this.executor,
    }
    const client = new MrimClient(clientOptions)

    this.clients.push(client)
  }
}
