import MrimPacketHeader from './common/header.js'

export default class MrimPacket<T> {
  public header: MrimPacketHeader
  public payload: T

  constructor(header: MrimPacketHeader, payload: T) {
    this.header = header
    this.payload = payload
  }

  public encode(): Buffer {
    const payload: Buffer =
      // @ts-expect-error NOTE: Класс полезных данных всегда должен иметь encode()
      this.payload instanceof Buffer ? this.payload : this.payload.encode()

    return Buffer.concat([this.header.encode(), payload])
  }
}
