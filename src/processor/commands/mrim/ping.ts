/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @file Файл команды сервера пинга
 * @author synzr <mikhail@autism.net.ru>
 */

import Command, { CommandContext } from '../abstract.js'

export default class PingCommand extends Command {
  // TODO(synzr): Реализовать отключения клиента
  //              при отсутствии выполнения данной команды на постоянку
  public async execute(_context: CommandContext): Promise<true> {
    return true
  }
}
