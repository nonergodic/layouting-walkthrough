import {
  Layout,
  LayoutToType,
  serializeLayout,
  deserializeLayout,
  encoding,
  CustomConversion,
  FixedConversion,
  Chain,
  toChain,
  chainToChainId,
} from "@wormhole-foundation/sdk-base";

// ----

const numberChainLayout = [
  {name: "sourceChain", binary: "uint", size: 2},
] as const satisfies Layout;

type NumberChain = LayoutToType<typeof numberChainLayout>;

// ---- CustomConversion

const chainCustomConversion = {
  to: (chainId: number) => toChain(chainId),
  from: (chain: Chain) => chainToChainId(chain),
} satisfies CustomConversion<number, Chain>;

//only a single item - drop the unnecessary array and name!

const convertedChainLayout = {
  binary: "uint", size: 2, custom: chainCustomConversion
} as const satisfies Layout;

type ConvertedChain = LayoutToType<typeof convertedChainLayout>;

{
  const example = "Solana";

  let serialized   =   serializeLayout(convertedChainLayout, example);
  let deserialized = deserializeLayout(convertedChainLayout, serialized);

  console.log("-- Converted --");
  console.log("serialized:");
  console.log(encoding.hex.encode(serialized));
  console.log("");
  console.log("deserialized:");
  console.log(deserialized);
}

// ---- Fixed

type AlsoKnownAsTwo = ReturnType<typeof chainToChainId<"Ethereum">>;

const fixedConversion = {
  to: "Ethereum",
  from: chainToChainId("Ethereum")
} as const satisfies FixedConversion<AlsoKnownAsTwo, "Ethereum">;

const fixedChainLayout = [
  {name: "sourceChain", binary: "uint", size: 2, custom: fixedConversion},
] as const satisfies Layout;

type FixedChain = LayoutToType<typeof fixedChainLayout>;

{
  const serialized = serializeLayout(fixedChainLayout, {sourceChain: "Ethereum"});
  console.log("\n-- Fixed --");
  console.log("serialized:");
  console.log(encoding.hex.encode(serialized));

  try {
    deserializeLayout(fixedChainLayout, new Uint8Array([0x00, 0x01]));
  } catch (error: any) {
    console.error("\nCaught deserialization error:");
    console.error(error.message);
  }
}

// ---- Omitted

//somewhat silly for our current example, but useful to elide padding etc.

const omittedChainLayout = [
  {...fixedChainLayout[0], omit: true},
] as const satisfies Layout;

type OmittedChain = LayoutToType<typeof omittedChainLayout>;

// or more simply:
const omittedChainLayout2 = [
  {name: "sourceChain", binary: "uint", size: 2, custom: chainToChainId("Ethereum"), omit: true},
] as const satisfies Layout;

type Omitted2Chain = LayoutToType<typeof omittedChainLayout2>;

{
  const serialized = serializeLayout(omittedChainLayout, {});
  console.log("\n-- Omitted --");
  console.log("serialized:");
  console.log(encoding.hex.encode(serialized));
}

// ----

import { layoutItems } from "@wormhole-foundation/sdk-definitions";

//Solidity struct:
// struct Fill {
//   uint16 sourceChain;
//   bytes32 orderSender;
//   bytes32 redeemer;
//   bytes redeemerMessage;
// }

const allowedChains = ["Ethereum", "Solana", "Avalanche"] as const;

//field sizes of chains, universal addresses, ... are defined in a single place!

const fillLayout = [
  {name: "sourceChain",     ...layoutItems.chainItem({allowedChains /*, allowNull: true*/})},
  {name: "orderSender",     ...layoutItems.universalAddressItem},
  {name: "redeemer",        ...layoutItems.universalAddressItem},
  {name: "redeemerMessage", binary: "bytes"                    },
] as const satisfies Layout;

type Fill = LayoutToType<typeof fillLayout>;

//alternatively:
const fillLayout2 = [
  {name: "source", binary: "object", layout: [
    {name: "chain",  ...layoutItems.chainItem({allowedChains})},
    {name: "sender", ...layoutItems.universalAddressItem},
  ]},
  {name: "redeemer", binary: "object", layout: [
    {name: "address", ...layoutItems.universalAddressItem},
    {name: "message", binary: "bytes"},
  ]},
] as const satisfies Layout;

type Fill2 = LayoutToType<typeof fillLayout2>;

//Takeaway:
// * no custom conversion: converts to underlying elementary type (number, bigint, Uint8Array)
// * custom conversion: uses to/from conversion functions
// * fixed conversion: either directly nails down the fixed value, or a fixed conversion
// * omitted: elides the field from the deserialized object
// * use layoutItems for common types
