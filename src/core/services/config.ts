/* eslint-disable perfectionist/sort-imports */
/**
 * @file Файл сервиса конфигурации
 * @author synzr <mikhail@autism.net.ru>
 */

import fs from 'node:fs'
import process from 'node:process'

import YAML from 'yaml'

import type User from '../entries/user.js'

/**
 * Конфигурация из файла
 */
interface FileConfig {
  /**
   * Настройки сервера
   */
  server?: {
    /**
     * Порт сервера
     */
    port?: number

    /**
     * Настройки, связанные с MRIM
     */
    mrim?: {
      /**
       * Интервал пингов c
       */
      ping_interval?: number
    }
  }

  /**
   * Настройки репозиториев
   */
  repositories?: {
    /**
     * Репозиторий пользователей
     */
    user?: {
      /**
       * Хранилище данных пользователей
       */
      storage?: 'memory' | 'mysql'

      /**
       * Список пользователей
       */
      entries?: User[]
    }
  }

  /**
   * Настройки логирования
   */
  log?: {
    /**
     * Уровень логирования
     */
    level?: string
  }

  /**
   * Настройки подключения к MySQL
   */
  mysql?: {
    /**
     * URI подключения
     */
    connection_uri?: string
  }
}

/**
 * Сервис конфигурации
 */
export default class ConfigService {
  private fileConfig?: FileConfig

  constructor(path?: string) {
    // NOTE: читаем конфиг из файла если указан путь
    if (path) {
      this.loadFromFile(path)
    }
  }

  private loadFromFile(path: string): void {
    const config = fs.readFileSync(path, { encoding: 'utf-8' })
    this.fileConfig = YAML.parse(config) as FileConfig
  }

  /**
   * @returns Порт сервера
   */
  public getServerPort(): number {
    return this.fileConfig?.server?.port ?? Number.parseInt(
      process.env.SERVER_PORT ?? '3000',
    )
  }

  /**
   * @returns Интервал пингов
   */
  public getPingInterval(): number {
    return this.fileConfig?.server?.mrim?.ping_interval ?? Number.parseInt(
      process.env.MRIM_PING_INTERVAL ?? '1000',
    )
  }

  /**
   * @returns Хранилище данных пользователей
   */
  public getUserRepositoryStorage(): string {
    return this.fileConfig?.repositories?.user?.storage ?? process.env.USER_STORAGE ?? 'memory'
  }

  /**
   * @returns Список пользователей
   */
  public getUserRepositoryEntries(): User[] {
    return this.fileConfig?.repositories?.user?.entries ?? []
  }

  /**
   * @returns Уровень логирования
   */
  public getLogLevel(): string {
    return this.fileConfig?.log?.level ?? process.env.LOG_LEVEL ?? 'info'
  }

  /**
   * @returns URI подключения к MySQL
   */
  public getMysqlConnectionUri(): string {
    return this.fileConfig?.mysql?.connection_uri ?? process.env.MYSQL_CONNECTION_URI ?? ''
  }
}
