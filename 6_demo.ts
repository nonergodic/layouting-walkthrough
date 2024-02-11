import { print } from "./utils";

import { getLLPayloadDiscriminator } from "./5_the_right_way";

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
    baseFee:     2n**128n - 1n,
  }
} as const;

{
  const serialized = serializePayload("LiquidityLayer:SlowOrderResponse", slowOrderResponseExample);
  const deserialized = deserializePayload(getLLPayloadDiscriminator(), serialized);

  print(serialized);
  print(deserialized);
}

//last but not least, emitter check:
function checkEmitter(serializedVaa: Uint8Array, expectedEmitter: UniversalAddress) {
  const vaa = deserialize(getLLPayloadDiscriminator(), serializedVaa);
  if (!vaa.emitterAddress.equals(expectedEmitter))
    throw new Error("unrecognized emitter");
  
  return vaa.payload;
}
