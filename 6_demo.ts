import { getLLPayloadDiscrimintor } from "./5_the_right_way";

import {encoding} from "@wormhole-foundation/sdk-base";

import {
  UniversalAddress,
  serializePayload,
  deserializePayload,
  deserialize,
} from "@wormhole-foundation/sdk-definitions";

const slowOrderResponseExample = {
  token: {
    address:     new UniversalAddress("AA".repeat(32)),
    amount:      2n**128n - 1n,
  },
  sourceDomain:  "Ethereum",
  targetDomain:  "Base",
  nonce:         0n,
  caller:        new UniversalAddress("BB".repeat(32)),
  mintRecipient: new UniversalAddress("CC".repeat(32)),
  payload: {
    baseFee:       2n**128n - 1n,
  }
} as const;

{
  const serialized = serializePayload("LiquidityLayer:SlowOrderResponse", slowOrderResponseExample);
  const deserialized = deserializePayload(getLLPayloadDiscrimintor(), serialized);

  console.log("serialized:");
  console.log(encoding.hex.encode(serialized));
  console.log("");
  console.log("deserialized:");
  console.log(deserialized);
}

//last but not least, emitter check:
function checkEmitter(serializedVaa: Uint8Array, expectedEmitter: UniversalAddress) {
  const vaa = deserialize(getLLPayloadDiscrimintor(), serializedVaa);
  if (!vaa.emitterAddress.equals(expectedEmitter))
    throw new Error("unrecognized emitter");
  
  return vaa;
}