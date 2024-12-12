import EventEmitter from 'node:events'
import MrimClient from './client.js'
import { UUID } from 'node:crypto'

/**
 * Регистр клиентов MRIM-сервера
 */
export default class MrimClientRegistry extends EventEmitter {
  private readonly clients: Map<UUID, MrimClient> = new Map()

  public get clientCount(): number {
    return this.clients.size
  }

  /**
   * Регистрация клиента в регистре
   * @param client MRIM-клиент
   * @returns Регистр
   */
  public register(client: MrimClient): MrimClientRegistry {
    const isClientRegistered = this.clients.has(client.id)

    if (isClientRegistered) {
      throw new Error('Client already registered')
    }

    this.clients.set(client.id, client)
    this.emit('register', client)

    return this
  }

  /**
   * Удаление клиента из регистра
   * @param client MRIM-клиент
   * @returns Регистр
   */
  public deregister(client: MrimClient): MrimClientRegistry {
    const isClientRegistered = this.clients.has(client.id)

    if (!isClientRegistered) {
      throw new Error('Client not registered')
    }

    this.clients.delete(client.id)
    this.emit('deregister', client)

    return this
  }
}
