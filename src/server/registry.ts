/**
 * @file Реализация регистра клиентов MRIM-сервера
 * @author synzr <mikhail@autism.net.ru>
 */

import EventEmitter from 'node:events'
import MrimClient from '../client/index.js'
import { UUID } from 'node:crypto'

/**
 * Регистр клиентов MRIM-сервера
 */
export default class MrimClientRegistry extends EventEmitter {
  private readonly clients: Map<UUID, MrimClient> = new Map()

  /**
   * Количество зарегистрированных клиентов
   */
  public get clientCount(): number {
    return this.clients.size
  }

  /**
   * Регистрация клиента в регистре
   *
   * @param client MRIM-клиент
   * @returns Регистр
   */
  public register(client: MrimClient): MrimClientRegistry {
    // NOTE: Выбросить ошибку, если клиент уже зарегистрирован
    const isClientRegistered = this.clients.has(client.id)
    if (isClientRegistered) {
      throw new Error('Client already registered')
    }

    // NOTE: Добавить клиента в регистр
    this.clients.set(client.id, client)
    this.emit('register', client)

    return this
  }

  /**
   * Удаление клиента из регистра
   *
   * @param client MRIM-клиент
   * @returns Регистр
   */
  public deregister(client: MrimClient): MrimClientRegistry {
    // NOTE: Выбросить ошибку, если клиент не зарегистрирован
    const isClientRegistered = this.clients.has(client.id)
    if (!isClientRegistered) {
      throw new Error('Client not registered')
    }

    // NOTE: Удалить клиента из регистра
    this.clients.delete(client.id)
    this.emit('deregister', client)

    return this
  }
}
