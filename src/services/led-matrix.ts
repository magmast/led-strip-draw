import { Color } from "@/types/color";

const INDEX_CHRC_UUID = "85289f22-baa7-447b-acb2-d961c06ecabf";
const COLOR_CHRC_UUID = "0c903aa6-de65-44c4-9cde-8873267e16c0";

export class LEDMatrix {
  static SERVICE_UUID = "4fd3af2a-10e8-474f-84d7-722bcfd3efc3";

  static async open(device: BluetoothDevice): Promise<LEDMatrix> {
    const server = await device.gatt!.connect();
    const service = await server.getPrimaryService(LEDMatrix.SERVICE_UUID);
    const indexChrc = await service.getCharacteristic(INDEX_CHRC_UUID);
    const colorChrc = await service.getCharacteristic(COLOR_CHRC_UUID);
    return new LEDMatrix(device, indexChrc, colorChrc);
  }

  #device: BluetoothDevice;

  #indexChrc: BluetoothRemoteGATTCharacteristic;

  #colorChrc: BluetoothRemoteGATTCharacteristic;

  private constructor(
    device: BluetoothDevice,
    indexChrc: BluetoothRemoteGATTCharacteristic,
    colorChrc: BluetoothRemoteGATTCharacteristic,
  ) {
    this.#device = device;
    this.#indexChrc = indexChrc;
    this.#colorChrc = colorChrc;
  }

  async setIndex(index: number): Promise<void> {
    const indexBuffer = new ArrayBuffer(2);
    const indexView = new DataView(indexBuffer);
    indexView.setInt16(0, index, true);
    await this.#indexChrc.writeValue(indexBuffer);
  }

  async setColor({ r, g, b }: Color): Promise<void> {
    const data = new Uint8Array([r, g, b]);
    await this.#colorChrc.writeValue(data);
  }

  async setColorAtIndex(index: number, color: Color): Promise<void> {
    await this.setIndex(index);
    await this.setColor(color);
  }

  async fill(color: Color): Promise<void> {
    await this.setColorAtIndex(-1, color);
  }

  async disconnect(): Promise<void> {
    await this.#device.gatt?.disconnect();
  }
}
