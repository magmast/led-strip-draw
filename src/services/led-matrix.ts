import { Color } from "@/types/color";

const LENGTH_CHRC_UUID = "410f7f12-e051-4b5d-a8ed-7d5619727b34";
const INDEX_CHRC_UUID = "85289f22-baa7-447b-acb2-d961c06ecabf";
const COLOR_CHRC_UUID = "0c903aa6-de65-44c4-9cde-8873267e16c0";

const MAX_COLOR_DATA_SIZE = 18;

export class LEDMatrix {
  static SERVICE_UUID = "4fd3af2a-10e8-474f-84d7-722bcfd3efc3";

  static async open(device: BluetoothDevice): Promise<LEDMatrix> {
    const server = await device.gatt!.connect();
    const service = await server.getPrimaryService(LEDMatrix.SERVICE_UUID);
    const lengthChrc = await service.getCharacteristic(LENGTH_CHRC_UUID);
    const indexChrc = await service.getCharacteristic(INDEX_CHRC_UUID);
    const colorChrc = await service.getCharacteristic(COLOR_CHRC_UUID);
    return new LEDMatrix(device, lengthChrc, indexChrc, colorChrc);
  }

  #device: BluetoothDevice;

  #lengthChrc: BluetoothRemoteGATTCharacteristic;

  #indexChrc: BluetoothRemoteGATTCharacteristic;

  #colorChrc: BluetoothRemoteGATTCharacteristic;

  private constructor(
    device: BluetoothDevice,
    lengthChrc: BluetoothRemoteGATTCharacteristic,
    indexChrc: BluetoothRemoteGATTCharacteristic,
    colorChrc: BluetoothRemoteGATTCharacteristic,
  ) {
    this.#device = device;
    this.#lengthChrc = lengthChrc;
    this.#indexChrc = indexChrc;
    this.#colorChrc = colorChrc;
  }

  async getLength(): Promise<number> {
    const value = await this.#lengthChrc.readValue();
    return value.getUint16(0, true);
  }

  async setColor(index: number, color: Color): Promise<void>;

  async setColor(color: Color[]): Promise<void>;

  async setColor(
    indexOrColors: number | Color[],
    color?: Color,
  ): Promise<void> {
    if (typeof indexOrColors === "number") {
      return await this.#setColorAtIndex(indexOrColors, color!);
    } else {
      return await this.#setColors(indexOrColors);
    }
  }

  async #setColorAtIndex(index: number, color: Color): Promise<void> {
    await this.#setIndex(index);

    const buffer = new ArrayBuffer(3);
    const view = new DataView(buffer);
    view.setUint8(0, color.r);
    view.setUint8(1, color.g);
    view.setUint8(2, color.b);
    await this.#colorChrc.writeValue(buffer);
  }

  async #setColors(colors: Color[]) {
    for (let i = 0; i < colors.length; i += MAX_COLOR_DATA_SIZE / 3) {
      await this.#setIndex(i);

      const size = Math.min(colors.length - i, MAX_COLOR_DATA_SIZE / 3);
      const buffer = new ArrayBuffer(size * 3);
      const view = new DataView(buffer);
      const chunk = colors.slice(i, i + size);
      chunk.forEach((color, j) => {
        const offset = j * 3;
        view.setUint8(offset, color.r);
        view.setUint8(offset + 1, color.g);
        view.setUint8(offset + 2, color.b);
      });

      await this.#colorChrc.writeValue(buffer);
    }
  }

  async #setIndex(index: number): Promise<void> {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint16(0, index, true);
    await this.#indexChrc.writeValue(buffer);
  }

  async disconnect(): Promise<void> {
    await this.#device.gatt?.disconnect();
  }
}
