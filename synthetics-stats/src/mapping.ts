import { Bytes, log } from "@graphprotocol/graph-ts";

import { EventLog, EventLog1, EventLog2, EventLogEventDataStruct,EventLog1EventDataStruct,EventLog2EventDataStruct } from "../generated/EventEmitter/EventEmitter";
import { Transfer } from "../generated/templates/MarketTokenTemplate/MarketToken";
import { MarketTokenTemplate } from "../generated/templates";
import { ClaimRef, DepositRef, MarketInfo, Order } from "../generated/schema";
import { BatchSend } from "../generated/BatchSender/BatchSender";

import {
  saveClaimableFundingFeeInfo as handleClaimableFundingUpdated,
  handleCollateralClaimAction,
  isFundingFeeSettleOrder,
  saveClaimActionOnOrderCancelled,
  saveClaimActionOnOrderCreated,
  saveClaimActionOnOrderExecuted
} from "./entities/claims";
import { getIdFromEvent, getOrCreateTransaction } from "./entities/common";
import {
  getSwapActionByFeeType,
  handlePositionImpactPoolDistributed,
  saveCollectedMarketFees,
  savePositionFeesInfo,
  savePositionFeesInfoWithPeriod,
  saveSwapFeesInfo,
  saveSwapFeesInfoWithPeriod
} from "./entities/fees";
import {
  getMarketInfo,
  saveMarketInfo,
  saveMarketInfoTokensSupply,
  saveMarketInfoMarketTokensSupplyFromPoolUpdated
} from "./entities/markets";
import {
  orderTypes,
  saveOrder,
  saveOrderCancelledState,
  saveOrderCollateralAutoUpdate,
  saveOrderExecutedState,
  saveOrderFrozenState,
  saveOrderSizeDeltaAutoUpdate,
  saveOrderUpdate
} from "./entities/orders";
import { savePositionDecrease, savePositionIncrease } from "./entities/positions";
import { getTokenPrice, handleOraclePriceUpdate } from "./entities/prices";
import { handleSwapInfo as saveSwapInfo } from "./entities/swaps";
import {
  saveOrderCancelledTradeAction,
  saveOrderCreatedTradeAction,
  saveOrderFrozenTradeAction,
  saveOrderUpdatedTradeAction,
  savePositionDecreaseExecutedTradeAction,
  savePositionIncreaseExecutedTradeAction,
  saveSwapExecutedTradeAction
} from "./entities/trades";
import { savePositionVolumeInfo, saveSwapVolumeInfo, saveVolumeInfo } from "./entities/volume";
import { EventData,Event1Data,Event2Data } from "./utils/eventData";
import { saveUserStat } from "./entities/user";
import {
  saveLiquidityProviderIncentivesStat,
  saveMarketIncentivesStat,
  saveUserGlpGmMigrationStatGmData,
  saveUserMarketInfo
} from "./entities/incentives/liquidityIncentives";
import { saveDistribution } from "./entities/distributions";
import { getMarketPoolValueFromContract } from "./contracts/getMarketPoolValueFromContract";
import { saveUserGmTokensBalanceChange } from "./entities/userBalance";
import { getMarketTokensSupplyFromContract } from "./contracts/getMarketTokensSupplyFromContract";
import { saveTradingIncentivesStat } from "./entities/incentives/tradingIncentives";
import {
  handleClaimableCollateralUpdated,
  handleCollateralClaimed,
  handleSetClaimableCollateralFactorForAccount,
  handleSetClaimableCollateralFactorForTime
} from "./entities/priceImpactRebate";

let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";


export function handleMarketTokenTransfer(event: Transfer): void {
  let marketAddress = event.address.toHexString();
  let from = event.params.from.toHexString();
  let to = event.params.to.toHexString();
  let value = event.params.value;

  // `from` user redeems or transfers out GM tokens
  if (from != ADDRESS_ZERO) {
    // LiquidityProviderIncentivesStat *should* be updated before UserMarketInfo
    saveLiquidityProviderIncentivesStat(from, marketAddress, "1w", value.neg(), event.block.timestamp.toI32());
    saveUserMarketInfo(from, marketAddress, value.neg());
    //let transaction = getOrCreateTransaction(event);
    //saveUserGmTokensBalanceChange(from, marketAddress, value.neg(), transaction, event.logIndex);
  }

  // `to` user receives GM tokens
  if (to != ADDRESS_ZERO) {
    // LiquidityProviderIncentivesStat *should* be updated before UserMarketInfo
    saveLiquidityProviderIncentivesStat(to, marketAddress, "1w", value, event.block.timestamp.toI32());
    saveUserMarketInfo(to, marketAddress, value);
   // let transaction = getOrCreateTransaction(event);
    //saveUserGmTokensBalanceChange(to, marketAddress, value, transaction, event.logIndex);
  }

  if (from == ADDRESS_ZERO) {
    saveMarketInfoTokensSupply(marketAddress, value);
  }

  if (to == ADDRESS_ZERO) {
    saveMarketInfoTokensSupply(marketAddress, value.neg());
  }
}

export function handleEventLog(event: EventLog): void {
  let eventName = event.params.eventName;
  let eventData = new EventData(event.params.eventData as EventLogEventDataStruct);

}

function handleEventLog1(event: EventLog1, network: string): void {
  let eventName = event.params.eventName;
  let eventData = new Event1Data(event.params.eventData);
  let eventId = getIdFromEvent(event);
  
  if (eventName == "MarketCreated") {
    saveMarketInfo(eventData);
    MarketTokenTemplate.create(eventData.getAddressItem("marketToken")!);
    return;
  }

  if (eventName == "OrderSizeDeltaAutoUpdated") {
    saveOrderSizeDeltaAutoUpdate(eventData);
    return;
  }

  if (eventName == "OrderCollateralDeltaAmountAutoUpdated") {
    saveOrderCollateralAutoUpdate(eventData);
    return;
  }

  if (eventName == "SwapInfo") {
    let transaction = getOrCreateTransaction(event);
    let tokenIn = eventData.getAddressItemString("tokenIn")!;
    let tokenOut = eventData.getAddressItemString("tokenOut")!;
    let amountIn = eventData.getUintItem("amountIn")!;
    let tokenInPrice = eventData.getUintItem("tokenInPrice")!;
    let volumeUsd = amountIn!.times(tokenInPrice!);
    let receiver = eventData.getAddressItemString("receiver")!;

    saveSwapInfo(eventData, transaction);
    saveSwapVolumeInfo(transaction.timestamp, tokenIn, tokenOut, volumeUsd);
    saveUserStat("swap", receiver, transaction.timestamp);
    return;
  }

  if (eventName == "SwapFeesCollected") {
    let transaction = getOrCreateTransaction(event);
    let swapFeesInfo = saveSwapFeesInfo(eventData, eventId, transaction);
    let tokenPrice = eventData.getUintItem("tokenPrice")!;
    let feeReceiverAmount = eventData.getUintItem("feeReceiverAmount")!;
    let feeAmountForPool = eventData.getUintItem("feeAmountForPool")!;
    let amountAfterFees = eventData.getUintItem("amountAfterFees")!;
    let action = getSwapActionByFeeType(swapFeesInfo.swapFeeType);
    let totalAmountIn = amountAfterFees.plus(feeAmountForPool).plus(feeReceiverAmount);
    let volumeUsd = totalAmountIn.times(tokenPrice);
    let poolValue = getMarketPoolValueFromContract(swapFeesInfo.marketAddress, network, transaction);
    // only deposits and withdrawals affect marketTokensSupply, for others we may use cached value
    // be aware: getMarketTokensSupplyFromContract returns value by block number, i.e. latest value in block
    let marketTokensSupply = isDepositOrWithdrawalAction(action)
      ? getMarketTokensSupplyFromContract(swapFeesInfo.marketAddress)
      : getMarketInfo(swapFeesInfo.marketAddress).marketTokensSupply;

    saveCollectedMarketFees(
      transaction,
      swapFeesInfo.marketAddress,
      poolValue,
      swapFeesInfo.feeUsdForPool,
      marketTokensSupply
    );
    saveVolumeInfo(action, transaction.timestamp, volumeUsd);
    saveSwapFeesInfoWithPeriod(feeAmountForPool, feeReceiverAmount, tokenPrice, transaction.timestamp);
    return;
  }

  // Only for liquidations if remaining collateral is not sufficient to pay the fees
  if (eventName == "PositionFeesInfo") {
    let transaction = getOrCreateTransaction(event);
    savePositionFeesInfo(eventData, "PositionFeesInfo", transaction);

    return;
  }

  if (eventName == "PositionFeesCollected") {
    let transaction = getOrCreateTransaction(event);
    let positionFeeAmount = eventData.getUintItem("positionFeeAmount")!;
    let positionFeeAmountForPool = eventData.getUintItem("positionFeeAmountForPool")!;
    let collateralTokenPriceMin = eventData.getUintItem("collateralTokenPrice.min")!;
    let borrowingFeeUsd = eventData.getUintItem("borrowingFeeUsd")!;
    let positionFeesInfo = savePositionFeesInfo(eventData, "PositionFeesCollected", transaction);
    let poolValue = getMarketPoolValueFromContract(positionFeesInfo.marketAddress, network, transaction);
    let marketInfo = getMarketInfo(positionFeesInfo.marketAddress);

    saveCollectedMarketFees(
      transaction,
      positionFeesInfo.marketAddress,
      poolValue,
      positionFeesInfo.feeUsdForPool,
      marketInfo.marketTokensSupply
    );
    savePositionFeesInfoWithPeriod(
      positionFeeAmount,
      positionFeeAmountForPool,
      borrowingFeeUsd,
      collateralTokenPriceMin,
      transaction.timestamp
    );

    saveTradingIncentivesStat(
      eventData.getAddressItemString("trader")!,
      event.block.timestamp.toI32(),
      positionFeeAmount,
      collateralTokenPriceMin
    );
    return;
  }

  if (eventName == "PositionIncrease") {
    let transaction = getOrCreateTransaction(event);
    let collateralToken = eventData.getAddressItemString("collateralToken")!;
    let marketToken = eventData.getAddressItemString("market")!;
    let sizeDeltaUsd = eventData.getUintItem("sizeDeltaUsd")!;
    let account = eventData.getAddressItemString("account")!;

    savePositionIncrease(eventData, transaction);
    saveVolumeInfo("margin", transaction.timestamp, sizeDeltaUsd);
    savePositionVolumeInfo(transaction.timestamp, collateralToken, marketToken, sizeDeltaUsd);
    saveUserStat("margin", account, transaction.timestamp);
    return;
  }

  if (eventName == "PositionDecrease") {
    let transaction = getOrCreateTransaction(event);
    let collateralToken = eventData.getAddressItemString("collateralToken")!;
    let marketToken = eventData.getAddressItemString("market")!;
    let sizeDeltaUsd = eventData.getUintItem("sizeDeltaUsd")!;
    let account = eventData.getAddressItemString("account")!;

    savePositionDecrease(eventData, transaction);
    saveVolumeInfo("margin", transaction.timestamp, sizeDeltaUsd);
    savePositionVolumeInfo(transaction.timestamp, collateralToken, marketToken, sizeDeltaUsd);
    saveUserStat("margin", account, transaction.timestamp);
    return;
  }

  if (eventName == "FundingFeesClaimed") {
    let transaction = getOrCreateTransaction(event);
    handleCollateralClaimAction("ClaimFunding", eventData, transaction);
    return;
  }

  if (eventName == "CollateralClaimed") {
    let transaction = getOrCreateTransaction(event);
    handleCollateralClaimAction("ClaimPriceImpact", eventData, transaction);
    handleCollateralClaimed(eventData);
    return;
  }

  if (eventName == "ClaimableFundingUpdated") {
    let transaction = getOrCreateTransaction(event);
    handleClaimableFundingUpdated(eventData, transaction);
    return;
  }

  if (eventName == "MarketPoolValueUpdated") {
    // `saveMarketIncentivesStat should be called before `MarketPoolInfo` entity is updated
    saveMarketIncentivesStat(eventData, event);
    saveMarketInfoMarketTokensSupplyFromPoolUpdated(
      eventData.getAddressItemString("market")!,
      eventData.getUintItem("marketTokensSupply")
    );
    return;
  }

  if (eventName == "PositionImpactPoolDistributed") {
    let transaction = getOrCreateTransaction(event);
    handlePositionImpactPoolDistributed(eventData, transaction, network);
    return;
  }

  if (eventName == "OraclePriceUpdate") {
    handleOraclePriceUpdate(eventData);
    return;
  }

  if (eventName == "ClaimableCollateralUpdated") {
    handleClaimableCollateralUpdated(eventData);
    return;
  }
}

function handleEventLog2(event: EventLog2, network: string): void {
  let eventName = event.params.eventName;
  let eventData = new Event2Data(event.params.eventData);
  let eventId = getIdFromEvent(event);

  if (eventName == "OrderCreated") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrder(eventData, transaction);
    if (isFundingFeeSettleOrder(order)) {
      saveClaimActionOnOrderCreated(transaction, eventData);
    } else {
      saveOrderCreatedTradeAction(eventId, order, transaction);
    }
    return;
  }
  if (eventName == "DepositCreated") {
    handleDepositCreated(event, eventData);
    return;
  }

    if (eventName == "WithdrawalCreated") {
    let transaction = getOrCreateTransaction(event);
    let account = eventData.getAddressItemString("account")!;
    saveUserStat("withdrawal", account, transaction.timestamp);
    return;
  }

    if (eventName == "OrderExecuted") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrderExecutedState(eventData, transaction);

    if (order == null) {
      return;
    }

    if (order.orderType == orderTypes.get("MarketSwap") || order.orderType == orderTypes.get("LimitSwap")) {
      saveSwapExecutedTradeAction(eventId, order as Order, transaction);
    } else if (
      order.orderType == orderTypes.get("MarketIncrease") ||
      order.orderType == orderTypes.get("LimitIncrease")
    ) {
      savePositionIncreaseExecutedTradeAction(eventId, order as Order, transaction);
    } else if (
      order.orderType == orderTypes.get("MarketDecrease") ||
      order.orderType == orderTypes.get("LimitDecrease") ||
      order.orderType == orderTypes.get("StopLossDecrease") ||
      order.orderType == orderTypes.get("Liquidation")
    ) {
      savePositionDecreaseExecutedTradeAction(eventId, order as Order, transaction);
    }
    return;
  }

  if (eventName == "OrderCancelled") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrderCancelledState(eventData, transaction);
    if (order !== null) {
      saveOrderCancelledTradeAction(
        eventId,
        order as Order,
        order.cancelledReason as string,
        order.cancelledReasonBytes as Bytes,
        transaction
      );
    }

    return;
  }

  if (eventName == "OrderUpdated") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrderUpdate(eventData);
    if (order !== null) {
      saveOrderUpdatedTradeAction(eventId, order as Order, transaction);
    }

    return;
  }

  if (eventName == "OrderFrozen") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrderFrozenState(eventData);

    if (order == null) {
      return;
    }

    saveOrderFrozenTradeAction(
      eventId,
      order as Order,
      order.frozenReason as string,
      order.frozenReasonBytes as Bytes,
      transaction
    );
    return;
  }

  if (eventName == "SetClaimableCollateralFactorForTime") {
    handleSetClaimableCollateralFactorForTime(eventData);
    return;
  }

  if (eventName == "SetClaimableCollateralFactorForAccount") {
    handleSetClaimableCollateralFactorForAccount(eventData);
    return;
  }

  if (eventName == "DepositCreated") {
    handleDepositCreated(event, eventData);
    return;
  }

  if (eventName == "DepositExecuted") {
    handleDepositExecuted(event, eventData);
    return;
  }

  if (eventName == "WithdrawalCreated") {
    let transaction = getOrCreateTransaction(event);
    let account = eventData.getAddressItemString("account")!;
    saveUserStat("withdrawal", account, transaction.timestamp);
    return;
  }

  if (eventName == "OrderExecuted") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrderExecutedState(eventData, transaction);

    if (order === null) {
      return;
    }

    if (order.orderType == orderTypes.get("MarketSwap") || order.orderType == orderTypes.get("LimitSwap")) {
      saveSwapExecutedTradeAction(eventId, order, transaction);
    } else if (
      order.orderType == orderTypes.get("MarketIncrease") ||
      order.orderType == orderTypes.get("LimitIncrease")
    ) {
      savePositionIncreaseExecutedTradeAction(eventId, order, transaction);
    } else if (
      order.orderType == orderTypes.get("MarketDecrease") ||
      order.orderType == orderTypes.get("LimitDecrease") ||
      order.orderType == orderTypes.get("StopLossDecrease") ||
      order.orderType == orderTypes.get("Liquidation")
    ) {
      if (ClaimRef.load(order.id)) {
        saveClaimActionOnOrderExecuted(transaction, eventData);
      } else {
        savePositionDecreaseExecutedTradeAction(eventId, order, transaction);
      }
    }
    return;
  }

  if (eventName == "OrderCancelled") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrderCancelledState(eventData, transaction);
    if (!(order === null)) {
      if (ClaimRef.load(order.id)) {
        saveClaimActionOnOrderCancelled(transaction, eventData);
      } else {
        saveOrderCancelledTradeAction(
          eventId,
          order!,
          order.cancelledReason!,
          order.cancelledReasonBytes!,
          transaction
        );
      }
    }
    return;
  }

  if (eventName == "OrderUpdated") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrderUpdate(eventData);
    if (order !== null) {
      saveOrderUpdatedTradeAction(eventId, order as Order, transaction);
    }

    return;
  }

  if (eventName == "OrderFrozen") {
    let transaction = getOrCreateTransaction(event);
    let order = saveOrderFrozenState(eventData);

    if (order === null) {
      return;
    }

    saveOrderFrozenTradeAction(
      eventId,
      order as Order,
      order.frozenReason as string,
      order.frozenReasonBytes as Bytes,
      transaction
    );
    return;
  }
}


function isDepositOrWithdrawalAction(action: string): boolean {
  return action == "deposit" || action == "withdrawal";
}

function handleDepositCreated(event: EventLog2, eventData: Event2Data): void {
  let transaction = getOrCreateTransaction(event);
  let account = eventData.getAddressItemString("account")!;
  saveUserStat("deposit", account, transaction.timestamp);

  let depositRef = new DepositRef(eventData.getBytes32Item("key")!.toHexString());
  depositRef.marketAddress = eventData.getAddressItemString("market")!;

  // old DepositCreated event does not contain "account"
  depositRef.account = eventData.getAddressItemString("account")!;
  depositRef.save();
}


function handleDepositExecuted(event: EventLog2, eventData: Event2Data): void {
  let key = eventData.getBytes32Item("key")!.toHexString();
  let depositRef = DepositRef.load(key)!;
  let marketInfo = MarketInfo.load(depositRef.marketAddress)!;

  let longTokenAmount = eventData.getUintItem("longTokenAmount")!;
  let longTokenPrice = getTokenPrice(marketInfo.longToken)!;

  let shortTokenAmount = eventData.getUintItem("shortTokenAmount")!;
  let shortTokenPrice = getTokenPrice(marketInfo.shortToken)!;

  let depositUsd = longTokenAmount.times(longTokenPrice).plus(shortTokenAmount.times(shortTokenPrice));
  //saveUserGlpGmMigrationStatGmData(depositRef.account, event.block.timestamp.toI32(), depositUsd);
}

export function handleEventLog1NeoX(event: EventLog1): void {
  handleEventLog1(event, "NeoX");
}


export function handleEventLog2NeoX(event: EventLog2): void {
  handleEventLog2(event, "NeoX");
}
