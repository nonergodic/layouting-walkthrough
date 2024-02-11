import { depositWithPayloadBase } from "./should_be_exported_by_sdk";

import {
  Layout,
  UintLayoutItem,
  lazyInstantiate,
  column,
} from "@wormhole-foundation/sdk-base";

import {
  RegisterPayloadTypes,
  registerPayloadTypes,
  payloadDiscriminator,
  layoutItems,
} from "@wormhole-foundation/sdk-definitions";

export const payloadIds = {
  Fill: 11,
  FastFill: 12,
  FastMarketOrder: 13,
  SlowOrderResponse: 14,
} as const;

const amount16Item = {binary: "uint", size: 16} as const satisfies UintLayoutItem;

const fillLayout = [
  {name: "source", binary: "object", layout: [
    {name: "chain",  ...layoutItems.chainItem()},
    {name: "sender", ...layoutItems.universalAddressItem},
  ]},
  {name: "redeemer", ...layoutItems.universalAddressItem},
  {name: "redeemerMessage", binary: "bytes", lengthSize: 4},
] as const satisfies Layout;

const toFullPayload = <L extends Layout>(layout: L) => [
  ...depositWithPayloadBase,
  { name: "payload", binary: "object", layout },
] as const;

const namedPayloads = [[
    "Fill",
    toFullPayload([
      layoutItems.payloadIdItem(payloadIds.Fill),
      ...fillLayout,
    ])
  ], [
    "FastFill",
    toFullPayload([
      layoutItems.payloadIdItem(payloadIds.FastFill),
      ...fillLayout,
      {name: "fillAmount", ...amount16Item},
    ])
  ], [
    "FastMarketOrder",
    toFullPayload([
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
    ])
  ], [
    "SlowOrderResponse",
    toFullPayload([
      layoutItems.payloadIdItem(payloadIds.SlowOrderResponse),
      {name: "baseFee", ...amount16Item},
    ]),
  ]
] as const satisfies [string, Layout][];

const payloadNames = column(namedPayloads, 0);

export const getLLPayloadDiscriminator = lazyInstantiate(() =>
  payloadDiscriminator(["LiquidityLayer", payloadNames]),
);

// factory registration:
declare global {
  namespace WormholeNamespace {
    interface PayloadLiteralToLayoutMapping
      extends RegisterPayloadTypes<"LiquidityLayer", typeof namedPayloads> {}
  }
}

registerPayloadTypes("LiquidityLayer", namedPayloads);
