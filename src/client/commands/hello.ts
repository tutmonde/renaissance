/**
 * @file Реализация исполнителя команды приветствия
 * @author synzr <mikhail@autism.net.ru>
 */

import MrimClient, { MrimClientState } from '../index.js'
import MrimPacket from '../../protocol/packet.js'
import assert from 'node:assert/strict'
import ICommand from './base.js'
import MrimPacketHeader from '../../protocol/common/header.js'

/**
 * Исполнитель команды приветствия
 */
export default class HelloCommand implements ICommand {
  /**
   * Выполнение команды
   * @param client Клиент, который выполняет команду
   * @param packet Пакет, который прислал клиент
   * @returns Пакет с результатами выполнения команды
   */
  public execute(client: MrimClient, packet: MrimPacket): MrimPacket {
    // NOTE: Проверка, если клиент до этого вызова команды
    //       не приветствовался с сервером
    assert(
      client.state === MrimClientState.NO_HELLO_NO_AUTHORIZED,
      'weird behavior; client does hello again'
    )

    client.state = MrimClientState.HELLO_NO_AUTHORIZED
    return this.buildResult(packet)
  }

  /**
   * Сборка ответа на результата выполнения команды
   *
   * @param clientPacket Пакет, который прислал клиент
   * @returns Готовый пакет с интервалом проверки соединения в секундах
   *
   * @todo Добавить возможность поставить свой интервал через настройки сервера
   */
  private buildResult(clientPacket: MrimPacket): MrimPacket {
    const header = new MrimPacketHeader({
      protocolVersion: clientPacket.header.protocolVersion,
      sequenceNumber: clientPacket.header.sequenceNumber,
      commandCode: 0x1002, // NOTE: MRIM_SC_HELLO_ACK
      payloadLength: 4,
      sourceAddress: '0.0.0.0:0'
    })

    // NOTE: Полезные данные настолько простые,
    //       что в отдельном классе смысла нету
    const payload = Buffer.alloc(4)
    payload.writeUInt32BE(10)

    return new MrimPacket(header, payload)
  }
}
