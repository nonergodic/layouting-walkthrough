import {encoding} from "@wormhole-foundation/sdk-base";
import {UniversalAddress} from "@wormhole-foundation/sdk-definitions";

//monkey-patch to allow stringifying BigInts
(BigInt.prototype as any).toJSON = function () {
  return this.toString() + "n";
};

{(UniversalAddress.prototype as any).toJSON = function () {
  return this.toString();
}}

(Uint8Array.prototype as any).toJSON = function () {
  return "0x" + encoding.hex.encode(this);
}

export function print(serialized: Uint8Array): void;
export function print(deserialized: any): void;
export function print(obj: any | Uint8Array) {
  if (obj instanceof Uint8Array) {
    console.log("serialized:");
    const chunks = encoding.hex.encode(obj).match(/.{1,64}/g) ?? [];
    for (let i = 0; i < chunks.length; i++)
      console.log(`${i}: ${chunks[i]}`);
  
    console.log("");
  }
  else {
    console.log("deserialized:");
    console.log(JSON.stringify(obj, null, 2));
    console.log("");
  }
}

export function printException(fn: (...a: any[]) => any, ...args: any[]): void {
  try {
    fn(...args);
  } catch (error: any) {
    console.error("Caught expected error:", error.message);
  }
}
