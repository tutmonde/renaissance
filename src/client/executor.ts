/**
 * @file Реализация исполнителя команд протокола MRIM
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimPacket from '../protocol/packet.js'
import HelloCommand from './commands/hello.js'
import ICommand, { MrimPacketOrNothing } from './commands/base.js'
import EventEmitter from 'node:events'
import MrimClient from './index.js'

/**
 * Состояния задач исполнителя команд
 */
enum MrimClientExecutorTaskState {
  /**
   * Означает, что задача находится в очереди
   */
  IN_QUEUE,
  /**
   * Означает, что задача находится в исполнении
   */
  IN_PROGRESS,
  /**
   * Означает, что задача завершилась успешно
   */
  DONE,
  /**
   * Означает, что задача завершилась с ошибкой
   */
  ERROR
}

/**
 * Интерфейс задачи исполнителя команд
 */
interface MrimClientExecutorTask {
  /**
   * Клиентский пакет протокола MRIM
   */
  clientPacket: MrimPacket
  /**
   * Серверный пакет протокола MRIM
   */
  serverPacket?: MrimPacket
  /**
   * Состояние задачи
   */
  state: MrimClientExecutorTaskState
  /**
   * Ошибка, возникшая при выполнении задачи
   */
  error?: Error
}

/**
 * Событие завершения задачи
 */
export class DoneEvent {
  /**
   * Номер последовательности вызова команды
   */
  public sequenceNumber: number
  /**
   * Серверный пакет протокола MRIM
   */
  public serverPacket?: MrimPacket

  public constructor(sequenceNumber: number, serverPacket?: MrimPacket) {
    this.sequenceNumber = sequenceNumber
    this.serverPacket = serverPacket
  }
}

/**
 * Событие завершения задачи ошибкой
 */
export class ErrorEvent {
  /**
   * Номер последовательности вызова команды
   */
  public sequenceNumber: number
  /**
   * Ошибка, возникшая при выполнении задачи
   */
  public error: Error

  public constructor(sequenceNumber: number, error: Error) {
    this.sequenceNumber = sequenceNumber
    this.error = error
  }
}

/**
 * Исполнитель команд протокола MRIM
 */
export default class MrimClientExecutor extends EventEmitter {
  private readonly commands: Map<number, ICommand> = new Map([
    [0x1001, new HelloCommand()] // NOTE: MRIM_CS_HELLO
  ])

  private queue: MrimClientExecutorTask[] = []
  private readonly client: MrimClient
  private interval!: NodeJS.Timeout | null

  public constructor(client: MrimClient) {
    super()
    this.client = client
  }

  //#region Обработка очереди исполнения команд
  /**
   * Опрашивание очереди исполнения команд
   */
  private poll(): void {
    if (this.queue.length === 0) {
      return
    }

    const task = this.queue[0]
    switch (task.state) {
      case MrimClientExecutorTaskState.IN_QUEUE:
        return this.handleInQueue(task)
      case MrimClientExecutorTaskState.DONE:
        return this.handleDone(task)
      case MrimClientExecutorTaskState.ERROR:
        return this.handleError(task)
    }
  }

  /**
   * Обработка задачи, находящейся в очереди
   * @param task Задача
   */
  private handleInQueue(task: MrimClientExecutorTask): void {
    task.state = MrimClientExecutorTaskState.IN_PROGRESS

    /**
     * Обработчик получения серверного пакета
     * после успешного выполнения команды
     *
     * @param serverPacket Серверный пакет протокола MRIM
     */
    const handleServerPacket = (serverPacket: MrimPacketOrNothing) => {
      if (serverPacket) {
        task.serverPacket = serverPacket
      }

      task.state = MrimClientExecutorTaskState.DONE
    }

    /**
     * Обертка выполнения команды
     */
    const executionWrapper = () => {
      try {
        const { commandCode } = task.clientPacket.header

        // NOTE: проверка, если команда вообще реализована
        const isCommandImplemented = this.commands.has(commandCode)
        if (!isCommandImplemented) {
          throw new Error(`command ${commandCode} is not implemented`)
        }

        // NOTE: выполнение команды
        const command = this.commands.get(commandCode) as ICommand
        const execution = command.execute(this.client, task.clientPacket)

        if (execution instanceof Promise) {
          return execution.then(handleServerPacket)
        } else {
          const serverPacket = execution
          return handleServerPacket(serverPacket)
        }
      } catch (error: unknown) {
        task.state = MrimClientExecutorTaskState.ERROR
        task.error = error as Error
      }
    }

    setImmediate(executionWrapper)
  }

  /**
   * Обработка задачи, завершившейся успешно
   * @param task Задача
   */
  private handleDone(task: MrimClientExecutorTask): void {
    this.queue.shift()

    const { sequenceNumber } = task.clientPacket.header
    const { serverPacket } = task

    // NOTE: Отправка события завершения задачи
    const event = new DoneEvent(sequenceNumber, serverPacket)
    this.emit('done', event)
  }

  /**
   * Обработка задачи, завершившейся с ошибкой
   * @param task Задача
   */
  private handleError(task: MrimClientExecutorTask): void {
    this.queue.shift()

    const { sequenceNumber } = task.clientPacket.header
    const { error } = task

    // NOTE: Отправка события завершения задачи с ошибкой
    const event = new ErrorEvent(sequenceNumber, error as Error)
    this.emit('error', event)
  }
  //#endregion

  //#region Включение/отключение обработки очереди
  /**
   * Включить исполнитель команд
   */
  public enable(): void {
    if (this.interval) {
      return
    }

    this.interval = setInterval(
      this.poll.bind(this),
      this.client.server.settings.pingIntervalDuration
    )
  }

  /**
   * Отключить исполнитель команд
   */
  public disable(): void {
    if (!this.interval) {
      return
    }

    clearInterval(this.interval!)
    this.interval = null
  }
  //#endregion

  /**
   * Добавить пакет в очередь исполнения команд
   * @param packet Пакет протокола MRIM
   */
  public enqueue(packet: MrimPacket): void {
    const task: MrimClientExecutorTask = {
      clientPacket: packet,
      state: MrimClientExecutorTaskState.IN_QUEUE
    }

    this.queue.push(task)
  }

  /**
   * Очистить очередь исполнения команд
   */
  public clear(): void {
    if (this.queue.length <= 1) {
      return
    }

    // NOTE: если IN_QUEUE, то 0. если что-то другое, то 1.
    const startIndex = Number(
      this.queue[0].state !== MrimClientExecutorTaskState.IN_QUEUE
    )
    this.queue.splice(startIndex, this.queue.length - 2)
  }
}
