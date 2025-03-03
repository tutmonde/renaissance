/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @file Файл команды сервера пинга
 * @author synzr <mikhail@autism.net.ru>
 */

import { CommandContext } from '../abstract.js'
import MrimCommand from './abstract.js'

/**
 * Команда пинга сервера
 */
export default class MrimPingCommand extends MrimCommand {
  // TODO(synzr): Реализовать KeepAliveService
  public async execute(_context: CommandContext): Promise<true> {
    return true
  }
}
