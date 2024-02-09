import {
  Layout,
  UintLayoutItem,
  LayoutToType,
  serializeLayout,
  deserializeLayout,
} from "@wormhole-foundation/sdk-base";

import { layoutItems } from "@wormhole-foundation/sdk-definitions";

//Solidity structs:
// uint8 private constant FILL = 11;
// uint8 private constant FAST_FILL = 12;
// uint8 private constant FAST_MARKET_ORDER = 13;
// uint8 private constant SLOW_ORDER_RESPONSE = 14;

// struct Fill {
//     uint16 sourceChain;
//     bytes32 orderSender;
//     bytes32 redeemer;
//     bytes redeemerMessage;
// }

// struct FastFill {
//     Fill fill;
//     uint128 fillAmount;
// }

// struct FastMarketOrder {
//     uint128 amountIn;
//     uint128 minAmountOut;
//     uint16 targetChain;
//     uint32 targetDomain;
//     bytes32 redeemer;
//     bytes32 sender;
//     bytes32 refundAddress;
//     uint128 maxFee;
//     uint128 initAuctionFee;
//     uint32 deadline;
//     bytes redeemerMessage;
// }

// struct SlowOrderResponse {
//     uint128 baseFee;
// }

export const payloadIds = {
  Fill: 11,
  FastFill: 12,
  FastMarketOrder: 13,
  SlowOrderResponse: 14,
} as const;

const sharedFillLayout = [
  {name: "source", binary: "object", layout: [
    {name: "chain",  ...layoutItems.chainItem()},
    {name: "sender", ...layoutItems.universalAddressItem},
  ]},
  {name: "redeemer", ...layoutItems.universalAddressItem},
] as const satisfies Layout;

const fillPayloadLayout = [
  layoutItems.payloadIdItem(payloadIds.Fill),
  ...sharedFillLayout,
  {name: "redeemerMessage", binary: "bytes"},
] as const satisfies Layout;

type FillPayload = LayoutToType<typeof fillPayloadLayout>;

const amount16Item = {binary: "uint", size: 16} as const satisfies UintLayoutItem;

const remainderLayout = (redeemerMessageSize: number) => [
  {name: "redeemerMessage", binary: "bytes", size: redeemerMessageSize},
  {name: "fillAmount", ...amount16Item},
] as const satisfies Layout;

const fastFillPayloadLayout = [
  layoutItems.payloadIdItem(payloadIds.FastFill),
  ...sharedFillLayout,
  //yuck!
  {name: "workaround", binary: "bytes", custom: {
    to: (remainder: Uint8Array) => {
      const redeemerMessageSize = remainder.length - 16;
      if (remainder.length < 0)
        throw new Error("Remainder too short!");

      return deserializeLayout(remainderLayout(redeemerMessageSize), remainder);
    },
    from: (value: {redeemerMessage: Uint8Array, fillAmount: bigint}) =>
      serializeLayout(remainderLayout(value.redeemerMessage.length), value),
  }}
] as const satisfies Layout;

type FastFillPayload = LayoutToType<typeof fastFillPayloadLayout>;

//types get large - too large to see by default...
// => set noErrorTruncation to true in tsconfig.json
// => also shows fully expanded types in hover

const fastMarketOrderPayloadLayout = [
  layoutItems.payloadIdItem(payloadIds.FastMarketOrder),
  {name: "amountIn",        ...amount16Item},
  {name: "minAmountOut",    ...amount16Item},
  {name: "target", binary: "object", layout: [
    {name: "chain",  ...layoutItems.chainItem()},
    {name: "domain", ...layoutItems.circleDomainItem},
  ]},
  {name: "redeemer",        ...layoutItems.universalAddressItem},
  {name: "sender",          ...layoutItems.universalAddressItem},
  {name: "refundAddress",   ...layoutItems.universalAddressItem},
  {name: "maxFee",          ...amount16Item},
  {name: "initAuctionFee",  ...amount16Item},
  {name: "deadline",        binary: "uint", size: 4},
  {name: "redeemerMessage", binary: "bytes"},
] as const satisfies Layout;

type FastMarketOrderPayload = LayoutToType<typeof fastMarketOrderPayloadLayout>;

const slowOrderResponsePayloadLayout = [
  layoutItems.payloadIdItem(payloadIds.SlowOrderResponse),
  {name: "baseFee", ...amount16Item},
] as const satisfies Layout;

export const payloadLayouts = {
  Fill: fillPayloadLayout,
  FastFill: fastFillPayloadLayout,
  FastMarketOrder: fastMarketOrderPayloadLayout,
  SlowOrderResponse: slowOrderResponsePayloadLayout,
} as const;
