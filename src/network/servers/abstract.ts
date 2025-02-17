/**
 * @file Файл абстрактного сервера
 * @author synzr <mikhail@autism.net.ru>
 */

export default abstract class Server {
  /**
   * Получение состояния сервера (запущен/не запущен)
   */
  public abstract running(): boolean

  /**
   * Запуск сервера
   */
  public abstract start(): void

  /**
   * Остановка сервера
   */
  public abstract stop(): void
}
