/* eslint-disable perfectionist/sort-imports */

/**
 * @file Файл MRIM-клиента
 * @author synzr <mikhail@autism.net.ru>
 */

import type { UUID } from 'node:crypto'
import { randomUUID } from 'node:crypto'
import type { Buffer } from 'node:buffer'

import type { Logger } from 'pino'

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
  logger: Logger
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
   * Логгер
   */
  private readonly logger: Logger

  /**
   * Внутренний идентификатор клиента
   */
  private readonly id: UUID

  constructor(options: MrimClientOptions) {
    super(options)

    this.reader = options.reader
    this.factory = options.factory
    this.executor = options.executor
    this.logger = options.logger

    this.id = randomUUID()

    this.logger.info(`MrimClient: client ${this.id} connected`)
  }

  protected async onData(data: Buffer): Promise<void> {
    const packet = this.reader.read({ data, id: this.id })
    if (packet === true) {
      this.logger.trace(`MrimClient: client ${this.id} did sent only part of packet`)
      return
    }
    if (packet === false) {
      this.logger.warn(`MrimClient: client ${this.id} did sent bad packet`)
      return this.close()
    }

    const { commandCode, payloadLength } = packet.header
    if (commandCode !== 0x1006) { // NOTE: CS_PING
      this.logger.debug(
        `MrimClient: client ${this.id} did sent command; commandCode=${commandCode}, payloadLength=${payloadLength}`,
      )
    } else {
      this.logger.trace(
        `MrimClient: client ${this.id} did sent command; commandCode=${commandCode}, payloadLength=${payloadLength}`,
      )
    }

    const packets = await this.executor.execute(packet, this)
    if (packets === true) {
      if (packet.header.commandCode !== 0x1006) { // NOTE: CS_PING
        this.logger.debug(
          `MrimClient: server did execute command from client ${this.id}, but didn't send any response`,
        )
      } else {
        this.logger.trace(
          `MrimClient: server did execute command from client ${this.id}, but didn't send any response`,
        )
      }

      return
    }
    if (packets === false) {
      this.logger.warn(
        `MrimClient: client ${this.id} did sent bad command`,
      )
      return this.close()
    }

    // NOTE: Отправка результаты команды
    for (const packetToSend of packets) {
      const data = this.factory.toBuffer(packetToSend as MrimPacket)

      this.logger.trace(
        `MrimClient: server did sent command to client ${this.id}; size=${data.length}`,
      )
      this.send(data)
    }

    this.logger.debug(
      `MrimClient: server did sent ${packets.length} commands to client ${this.id}`,
    )
  }

  protected onError(error: Error): void {
    this.logger.error(`MrimClient: client ${this.id} handler got error: ${error.message}`)
    this.logger.trace(error)
  }

  protected onClose(): void {
    this.socket.removeAllListeners()
    this.server.removeDisconnectedClients()

    this.logger.info(`MrimClient: client ${this.id} disconnected`)
  }
}
