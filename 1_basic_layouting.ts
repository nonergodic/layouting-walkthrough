import { print, printException } from "./utils";

// !!! Layouts !!!
//
// * a TypeScript-native Domain Specific Language (DSL)
// * convert (serialized) data to strongly typed objects and vice versa
// * declarative approach
// * automatic discrimination of encoded data
// * reusability

import {
  Layout,
  LayoutToType,
  serializeLayout,
  deserializeLayout,
  encoding,
} from "@wormhole-foundation/sdk-base";

//Solidity struct:
// struct Fill {
//   uint16 sourceChain;
//   bytes32 orderSender;
//   bytes32 redeemer;
//   bytes redeemerMessage;
// }

// A layout is a list of layout items (or just a single, unnamed layout item)

const elementaryFillLayout = [
  {name: "sourceChain",     binary: "uint",  size:  2},
  {name: "orderSender",     binary: "bytes", size: 32},
  {name: "redeemer",        binary: "bytes", size: 32},
  {name: "redeemerMessage", binary: "bytes", lengthSize: 4},
] as const satisfies Layout;

type ElementaryFill = LayoutToType<typeof elementaryFillLayout>;

// only Uint8Arrays - goodbye Buffer, you won't be missed 🤮
//   https://sindresorhus.com/blog/goodbye-nodejs-buffer
//
// * Buffer is a nodejs thing that has to be polyfilled while Uint8Array is native
// * Buffer is a subclass of Uint8Array ...
//     ... yet Buffer.slice() returns a reference ...
//     ... but Uint8Array.slice() returns a copy 🤯

// Demo:

const exampleFill: ElementaryFill = {
  sourceChain:     6,
  orderSender:     encoding.hex.decode("01".repeat(32)),
  redeemer:        encoding.hex.decode("0x" + "02".repeat(32)),
  redeemerMessage: new Uint8Array([0x0a, 0x0b, 0x0c]),
};

const serialized   =   serializeLayout(elementaryFillLayout, exampleFill);
const deserialized = deserializeLayout(elementaryFillLayout, serialized);

print(serialized)
print(deserialized);

// Error handling:
printException(deserializeLayout, elementaryFillLayout, serialized.slice(0, 10));
// ... clearly some room for improvement here
