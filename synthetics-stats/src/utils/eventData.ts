import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  EventLogEventDataAddressItemsItemsStruct,
  EventLogEventDataUintItemsItemsStruct,
  EventLogEventDataStruct,
  EventLogEventDataAddressItemsArrayItemsStruct,
  EventLogEventDataUintItemsArrayItemsStruct,
  EventLogEventDataBytesItemsItemsStruct,
  EventLogEventDataBytesItemsArrayItemsStruct,
  EventLogEventDataStringItemsArrayItemsStruct,
} from "../../generated/EventEmitter/EventEmitter";

import {
  EventLog1EventDataAddressItemsItemsStruct,
  EventLog1EventDataUintItemsItemsStruct,
  EventLog1EventDataStruct,
  EventLog1EventDataAddressItemsArrayItemsStruct,
  EventLog1EventDataUintItemsArrayItemsStruct,
  EventLog1EventDataBytesItemsItemsStruct,
  EventLog1EventDataBytesItemsArrayItemsStruct,
  EventLog1EventDataStringItemsArrayItemsStruct,
  EventLog1EventDataBytes32ItemsItemsStruct,
  EventLog1EventDataIntItemsItemsStruct
} from "../../generated/EventEmitter/EventEmitter";

import {
  EventLog2EventDataAddressItemsItemsStruct,
  EventLog2EventDataUintItemsItemsStruct,
  EventLog2EventDataStruct,
  EventLog2EventDataAddressItemsArrayItemsStruct,
  EventLog2EventDataUintItemsArrayItemsStruct,
  EventLog2EventDataBytesItemsItemsStruct,
  EventLog2EventDataBytesItemsArrayItemsStruct,
  EventLog2EventDataIntItemsItemsStruct,
  EventLog2EventDataStringItemsArrayItemsStruct,
  EventLog2EventDataBytes32ItemsItemsStruct
} from "../../generated/EventEmitter/EventEmitter";



export class EventData {
  constructor(public rawData: EventLogEventDataStruct) {}

  getAddressItem(key: string): Address | null {
    return getItemByKey<Address, EventLogEventDataAddressItemsItemsStruct>(
      this.rawData.addressItems.items,
      key
    );
  }

  getAddressItemString(key: string): string | null {
    let item = this.getAddressItem(key);

    if (item != null) {
      return item.toHexString();
    }

    return null;
  }

  getAddressArrayItem(key: string): Array<Address> | null {
    return getItemByKey<
      Array<Address>,
      EventLogEventDataAddressItemsArrayItemsStruct
    >(this.rawData.addressItems.arrayItems, key);
  }

  getAddressArrayItemString(key: string): Array<string> | null {
    let items = this.getAddressArrayItem(key);

    if (items != null) {
      let _items = items as Array<Address>;
      let stringsArray = new Array<string>(items.length);

      for (let i = 0; i < _items.length; i++) {
        let item = _items[i] as Address;
        stringsArray[i] = item.toHexString();
      }

      return stringsArray;
    }

    return null;
  }

  getStringItem(key: string): string | null {
    let items = this.rawData.stringItems.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].key == key) {
        return items[i].value;
      }
    }

    return null;
  }

  getStringArrayItem(key: string): Array<string> | null {
    return getItemByKey<
      Array<string>,
      EventLogEventDataStringItemsArrayItemsStruct
    >(this.rawData.stringItems.arrayItems, key);
  }

  getUintItem(key: string): BigInt | null {
    return getItemByKey<BigInt, EventLogEventDataUintItemsItemsStruct>(
      this.rawData.uintItems.items,
      key
    );
  }

  getUintArrayItem(key: string): Array<BigInt> | null {
    return getItemByKey<
      Array<BigInt>,
      EventLogEventDataUintItemsArrayItemsStruct
    >(this.rawData.uintItems.arrayItems, key);
  }

  getIntItem(key: string): BigInt | null {
    return getItemByKey<BigInt, EventLogEventDataUintItemsItemsStruct>(
      this.rawData.intItems.items as Array<
        EventLogEventDataUintItemsItemsStruct
      >,
      key
    );
  }

  getIntArrayItem(key: string): Array<BigInt> | null {
    return getItemByKey<
      Array<BigInt>,
      EventLogEventDataUintItemsArrayItemsStruct
    >(this.rawData.intItems.arrayItems, key);
  }

  getBytesItem(key: string): Bytes | null {
    return getItemByKey<Bytes, EventLogEventDataBytesItemsItemsStruct>(
      this.rawData.bytesItems.items,
      key
    );
  }

  getBytesArrayItem(key: string): Array<Bytes> | null {
    return getItemByKey<
      Array<Bytes>,
      EventLogEventDataBytesItemsArrayItemsStruct
    >(this.rawData.bytesItems.arrayItems, key);
  }

  getBytes32Item(key: string): Bytes | null {
    return getItemByKey<Bytes, EventLogEventDataBytesItemsItemsStruct>(
      this.rawData.bytes32Items.items as Array<
        EventLogEventDataBytesItemsItemsStruct
      >,
      key
    );
  }

  getBytes32ArrayItem(key: string): Array<Bytes> | null {
    return getItemByKey<
      Array<Bytes>,
      EventLogEventDataBytesItemsArrayItemsStruct
    >(this.rawData.bytes32Items.arrayItems, key);
  }

  // boolean type is not nullable in AssemblyScript, so we return false if the key is not found
  getBoolItem(key: string): boolean {
    let items = this.rawData.boolItems.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].key == key) {
        return items[i].value;
      }
    }

    return false;
  }
}


export class Event1Data {
  constructor(public rawData: EventLog1EventDataStruct) {}

  getAddressItem(key: string): Address | null {
    return getItemByKey<Address, EventLog1EventDataAddressItemsItemsStruct>(
      this.rawData.addressItems.items,
      key
    );
  }

  getAddressItemString(key: string): string | null {
    let item = this.getAddressItem(key);

    if (!(item===null)) {
      return item.toHexString();
    }

    return null;
  }

  getAddressArrayItem(key: string): Array<Address> | null {
    return getItemByKey<
      Array<Address>,
      EventLog1EventDataAddressItemsArrayItemsStruct
    >(this.rawData.addressItems.arrayItems, key);
  }

  getAddressArrayItemString(key: string): Array<string> | null {
    let items = this.getAddressArrayItem(key);

    if (items != null) {
      let _items = items as Array<Address>;
      let stringsArray = new Array<string>(items.length);

      for (let i = 0; i < _items.length; i++) {
        let item = _items[i] as Address;
        stringsArray[i] = item.toHexString();
      }

      return stringsArray;
    }

    return null;
  }

  getStringItem(key: string): string | null {
    let items = this.rawData.stringItems.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].key == key) {
        return items[i].value;
      }
    }

    return null;
  }

  getStringArrayItem(key: string): Array<string> | null {
    return getItemByKey<
      Array<string>,
      EventLog1EventDataStringItemsArrayItemsStruct
    >(this.rawData.stringItems.arrayItems, key);
  }

  getUintItem(key: string): BigInt | null {
    return getItemByKey<BigInt, EventLog1EventDataUintItemsItemsStruct>(
      this.rawData.uintItems.items,
      key
    );
  }

  getUintArrayItem(key: string): Array<BigInt> | null {
    return getItemByKey<
      Array<BigInt>,
      EventLog1EventDataUintItemsArrayItemsStruct
    >(this.rawData.uintItems.arrayItems, key);
  }

  getIntItem(key: string): BigInt | null {
    return getItemByKey<BigInt, EventLog1EventDataIntItemsItemsStruct>(
      this.rawData.intItems.items,
      key
    );
  }

  getIntArrayItem(key: string): Array<BigInt> | null {
    return getItemByKey<
      Array<BigInt>,
      EventLog1EventDataUintItemsArrayItemsStruct
    >(this.rawData.intItems.arrayItems, key);
  }

  getBytesItem(key: string): Bytes | null {
    return getItemByKey<Bytes, EventLog1EventDataBytesItemsItemsStruct>(
      this.rawData.bytesItems.items,
      key
    );
  }

  getBytesArrayItem(key: string): Array<Bytes> | null {
    return getItemByKey<
      Array<Bytes>,
      EventLog1EventDataBytesItemsArrayItemsStruct
    >(this.rawData.bytesItems.arrayItems, key);
  }

  getBytes32Item(key: string): Bytes | null {
    return getItemByKey<Bytes, EventLog1EventDataBytes32ItemsItemsStruct>(
      this.rawData.bytes32Items.items,
      key
    );
  }

  getBytes32ArrayItem(key: string): Array<Bytes> | null {
    return getItemByKey<
      Array<Bytes>,
      EventLog1EventDataBytesItemsArrayItemsStruct
    >(this.rawData.bytes32Items.arrayItems, key);
  }

  // boolean type is not nullable in AssemblyScript, so we return false if the key is not found
  getBoolItem(key: string): boolean {
    let items = this.rawData.boolItems.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].key == key) {
        return items[i].value;
      }
    }

    return false;
  }
}


export class Event2Data {
  constructor(public rawData: EventLog2EventDataStruct) {}

  getAddressItem(key: string): Address | null {
    return getItemByKey<Address, EventLog2EventDataAddressItemsItemsStruct>(
      this.rawData.addressItems.items,
      key
    );
  }

  getAddressItemString(key: string): string | null {
    let item = this.getAddressItem(key);

    if (!(item===null)) {
      return item.toHexString();
    }

    return null;
  }

  getAddressArrayItem(key: string): Array<Address> | null {
    return getItemByKey<
      Array<Address>,
      EventLog2EventDataAddressItemsArrayItemsStruct
    >(this.rawData.addressItems.arrayItems, key);
  }

  getAddressArrayItemString(key: string): Array<string> | null {
    let items = this.getAddressArrayItem(key);

    if (items != null) {
      let _items = items as Array<Address>;
      let stringsArray = new Array<string>(items.length);

      for (let i = 0; i < _items.length; i++) {
        let item = _items[i] as Address;
        stringsArray[i] = item.toHexString();
      }

      return stringsArray;
    }

    return null;
  }

  getStringItem(key: string): string | null {
    let items = this.rawData.stringItems.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].key == key) {
        return items[i].value;
      }
    }

    return null;
  }

  getStringArrayItem(key: string): Array<string> | null {
    return getItemByKey<
      Array<string>,
      EventLog2EventDataStringItemsArrayItemsStruct
    >(this.rawData.stringItems.arrayItems, key);
  }

  getUintItem(key: string): BigInt | null {
    return getItemByKey<BigInt, EventLog2EventDataUintItemsItemsStruct>(
      this.rawData.uintItems.items,
      key
    );
  }

  getUintArrayItem(key: string): Array<BigInt> | null {
    return getItemByKey<
      Array<BigInt>,
      EventLog2EventDataUintItemsArrayItemsStruct
    >(this.rawData.uintItems.arrayItems, key);
  }

  getIntItem(key: string): BigInt | null {
    return getItemByKey<BigInt, EventLog2EventDataIntItemsItemsStruct>(
      this.rawData.intItems.items,
      key
    );
  }

  getIntArrayItem(key: string): Array<BigInt> | null {
    return getItemByKey<
      Array<BigInt>,
      EventLog2EventDataUintItemsArrayItemsStruct
    >(this.rawData.intItems.arrayItems, key);
  }

  getBytesItem(key: string): Bytes | null {
    return getItemByKey<Bytes, EventLog2EventDataBytesItemsItemsStruct>(
      this.rawData.bytesItems.items,
      key
    );
  }

  getBytesArrayItem(key: string): Array<Bytes> | null {
    return getItemByKey<
      Array<Bytes>,
      EventLog2EventDataBytesItemsArrayItemsStruct
    >(this.rawData.bytesItems.arrayItems, key);
  }

  getBytes32Item(key: string): Bytes | null {
    return getItemByKey<Bytes, EventLog2EventDataBytes32ItemsItemsStruct>(
      this.rawData.bytes32Items.items,
      key
    );
  }

  getBytes32ArrayItem(key: string): Array<Bytes> | null {
    return getItemByKey<
      Array<Bytes>,
      EventLog2EventDataBytesItemsArrayItemsStruct
    >(this.rawData.bytes32Items.arrayItems, key);
  }

  // boolean type is not nullable in AssemblyScript, so we return false if the key is not found
  getBoolItem(key: string): boolean {
    let items = this.rawData.boolItems.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].key == key) {
        return items[i].value;
      }
    }

    return false;
  }
}




class EventDataItem<T> extends ethereum.Tuple {
  get key(): string {
    return this[0].toString();
  }

  get value(): T {
    return this[1] as T;
  }
}

function getItemByKey<T, TItem extends EventDataItem<T>>(
  items: Array<TItem>,
  key: string
): T | null {
  for (let i = 0; i < items.length; i++) {
    if (items[i].key == key) {
      return items[i].value;
    }
  }

  return null;
}
