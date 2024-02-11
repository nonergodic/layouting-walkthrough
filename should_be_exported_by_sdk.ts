import { layoutItems } from "@wormhole-foundation/sdk-definitions";

//exists in the connect sdk but isn't exported atm:
//https://github.com/wormhole-foundation/connect-sdk/blob/a82dff30cedce9cd3472f39a4a3baed7165acc4d/core/definitions/src/payloads/automaticCircleBridge.ts#L12
export const depositWithPayloadBase = [
  layoutItems.payloadIdItem(1),
  {
    name: "token",
    binary: "object",
    layout: [
      { name: "address", ...layoutItems.universalAddressItem },
      { name: "amount", ...layoutItems.amountItem },
    ],
  },
  { name: "sourceDomain", ...layoutItems.circleDomainItem },
  { name: "targetDomain", ...layoutItems.circleDomainItem },
  { name: "nonce", ...layoutItems.circleNonceItem },
  { name: "caller", ...layoutItems.universalAddressItem },
  { name: "mintRecipient", ...layoutItems.universalAddressItem },
] as const;
