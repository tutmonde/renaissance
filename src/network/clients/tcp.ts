/* eslint-disable jsdoc/check-param-names */

/**
 * @file Файл TCP-клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import type { Buffer } from 'node:buffer'
import type { Socket } from 'node:net'

import type TcpServer from '../servers/tcp.js'

import Client from './abstract.js'

/**
 * Настройки TCP-клиента
 */
export interface TcpClientOptions {
  socket: Socket
  server: TcpServer
}

/**
 * TCP-клиент
 */
export default class TcpClient extends Client {
  /**
   * Сокет подключения клиента
   */
  protected readonly socket: Socket

  /**
   * Сервер, к которому подключен клиент
   */
  protected readonly server: TcpServer

  constructor(options: TcpClientOptions) {
    super()

    this.socket = options.socket
    this.socket.on('data', this.onData.bind(this))
    this.socket.on('close', this.onClose.bind(this))
    this.socket.on('error', this.onError.bind(this))

    this.server = options.server
  }

  /**
   * Порт удаленного подключения
   */
  public get remotePort(): number {
    return this.socket.remotePort as number
  }

  /**
   * Обработчик необработанных бинарных данных
   * @param data Необработанные данные
   */
  protected onData(this: TcpClient, _data: Buffer): void {
    throw new Error('implementation missing')
  }

  /**
   * Обработчик закрытия подключения
   */
  protected onClose(this: TcpClient): void {
    this.socket.removeAllListeners()
    this.server.removeDisconnectedClients()
  }

  /**
   * Обработчик ошибки во время обработки подключения
   * @param error Ошибка
   */
  protected onError(this: TcpClient, _error: Error): void {
    throw new Error('implementation missing')
  }

  public connected(this: TcpClient): boolean {
    return this.socket.readyState === 'open'
  }

  public send(this: TcpClient, data: Buffer): void {
    this.socket.write(data)
  }

  public close(this: TcpClient): void {
    this.socket.end()
  }
}
