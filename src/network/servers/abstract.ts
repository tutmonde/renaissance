/**
 * @file Файл абстрактного сервера
 * @author synzr <mikhail@autism.net.ru>
 */

export abstract class Server {
  /**
   * Получение состояния сервера (запущен/не запущен)
   */
  abstract running(): boolean

  /**
   * Запуск сервера
   */
  abstract start(): void

  /**
   * Остановка сервера
   */
  abstract stop(): void
}
