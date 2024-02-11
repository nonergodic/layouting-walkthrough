import { print, printException } from "./utils";

// ---- WormholeCctpDepositHeader

//already exists!
//demo:
import {
  AutomaticCircleBridge,
  serializePayload,
  deserializePayload,
  UniversalAddress
} from "@wormhole-foundation/sdk-definitions"

{
  const depositWithPayloadExample: AutomaticCircleBridge.Payload<"DepositWithPayload"> = {
    token: {
      address:     new UniversalAddress("AA".repeat(32)),
      amount:      2n**128n - 1n,
    },
    sourceDomain:  "Ethereum",
    targetDomain:  "Base",
    nonce:         0n,
    caller:        new UniversalAddress("BB".repeat(32)),
    mintRecipient: new UniversalAddress("CC".repeat(32)),
    payload:       new Uint8Array(),
  };

  //serializePayload vs serializeLayout ... wtf is going on here?
  //... we'll get to that in a bit

  const serialized = serializePayload(
    "AutomaticCircleBridge:DepositWithPayload",
    depositWithPayloadExample
  );
  
  const deserialized = deserializePayload(
    "AutomaticCircleBridge:DepositWithPayload",
    serialized
  );

  console.log("-- DepositWithPayload --");
  print(serialized);
  print(deserialized);
}

// ---- MessageDecoder

//What do we do about the switch statement in MessageDecoder.decode that determines the
//  Payload type via the payload id?
//-> automatic layout discrimination!

import {payloadIds, payloadLayouts} from "./3_all_layouts";

import {
  layoutDiscriminator,
  serializeLayout,
  deserializeLayout
} from "@wormhole-foundation/sdk-base";

const layouts = [
  payloadLayouts.Fill,
  payloadLayouts.FastFill,
  payloadLayouts.FastMarketOrder,
  payloadLayouts.SlowOrderResponse,
] as const;

//layoutDiscriminator uses the declarative nature of layouts to build a divide-and-conquer
//  strategy that allows to discriminate between them by look at known fixed byte values
//  (e.g. payload ids) and/or the length of a layout

//In our particular case, it will use the payload id to determine the layout.
const discriminator = layoutDiscriminator(layouts /*,false*/);

function decodePayload(serialized: Uint8Array) {
  //Returns the index of the layout of the layout array that we originally passed to
  //  layoutDiscriminator that this serialized data conforms to, if any.)
  const layoutIndex = discriminator(serialized);
  if (layoutIndex === null)
    throw new Error("Does not conform to any known layout!");

  return deserializeLayout(layouts[layoutIndex], serialized);
}

{
  const serialized = serializeLayout(payloadLayouts.FastFill, {
    source: {
      chain: "Ethereum",
      sender: new UniversalAddress("DD".repeat(32)),
    },
    redeemer: new UniversalAddress("EE".repeat(32)),
    redeemerMessage: new Uint8Array([0x01, 0x02, 0x03]),
    fillAmount: 2n**128n - 1n,
  });
  const deserialization = decodePayload(serialized);

  console.log("-- Decoded --");
  print(serialized);
  print(deserialization);

  printException(decodePayload, new Uint8Array([0x01]));
  printException(decodePayload, new Uint8Array([payloadIds.Fill]));
}

// ---- LazyInstantiate

import {lazyInstantiate} from "@wormhole-foundation/sdk-base";

//building discrimination strategies can be expensive
//  -> only build them when they are actually needed, not during startup
//  -> lazy instantiation

const buildDiscriminatorOnFirstUse = lazyInstantiate(() => layoutDiscriminator(layouts));
