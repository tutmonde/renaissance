/**
 * @file Реализация настроек сервера
 * @author synzr <mikhail@autism.net.ru>
 */

/**
 * Настройки сервера
 */
export default class Settings {
  // NOTE: 2041 - это стандартный порт для MRIM-сервера
  private static DEFAULT_SERVER_PORT = 2041
  private static DEFAULT_PING_INTERVAL_SECS = 10
  private static DEFAULT_EXECUTOR_POLL_INTERVAL_MS = 100
  private static DEFAULT_LOG_LEVEL = 'info'

  /**
   * Получение значения переменной окружения или значения по умолчанию
   * @param name Название переменной окружения
   * @param defaultValue Значение по умолчанию
   * @returns Значение переменной окружения или значение по умолчанию
   */
  private getEnvironmentVariableOrDefault<T>(name: string, defaultValue: T): T {
    return process.env[name]
      ? (process.env[name] as unknown as T)
      : defaultValue
  }

  /**
   * Порт сервера
   */
  public get serverPort(): number {
    return this.getEnvironmentVariableOrDefault(
      'SERVER_PORT',
      Settings.DEFAULT_SERVER_PORT
    )
  }

  /**
   * Интервал проверки подключения со стороны клиента
   */
  public get pingIntervalDuration(): number {
    return this.getEnvironmentVariableOrDefault(
      'PING_INTERVAL_SECS',
      Settings.DEFAULT_PING_INTERVAL_SECS
    )
  }

  /**
   * Интервал опроса исполнителя команд
   */
  public get executorPollInterval(): number {
    return this.getEnvironmentVariableOrDefault(
      'EXECUTOR_POLL_INTERVAL_MS',
      Settings.DEFAULT_EXECUTOR_POLL_INTERVAL_MS
    )
  }

  /**
   * Уровень логирования
   */
  public get logLevel(): string {
    return this.getEnvironmentVariableOrDefault(
      'LOG_LEVEL',
      Settings.DEFAULT_LOG_LEVEL
    )
  }
}
