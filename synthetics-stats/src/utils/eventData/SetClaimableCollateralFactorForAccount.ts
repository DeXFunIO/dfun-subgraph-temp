import { BigInt } from "@graphprotocol/graph-ts";
import { Event2Data } from "../eventData";

/*
EventLog2: ClaimableCollateralUpdated

addressItems.initItems(3);
addressItems.setItem(0, "market", market);
addressItems.setItem(1, "token", token);
addressItems.setItem(2, "account", account);

uintItems.initItems(2);
uintItems.setItem(0, "timeKey", timeKey);
uintItems.setItem(1, "factor", factor);
*/

export class SetClaimableCollateralFactorForAccountEventData {
  constructor(private eventData: Event2Data) {}

  get market(): string {
    return this.eventData.getAddressItemString("market")!;
  }

  get token(): string {
    return this.eventData.getAddressItemString("token")!;
  }

  get account(): string {
    return this.eventData.getAddressItemString("account")!;
  }

  get timeKey(): string {
    return this.eventData.getUintItem("timeKey")!.toString();
  }

  get factor(): BigInt {
    return this.eventData.getUintItem("factor")!;
  }
}
