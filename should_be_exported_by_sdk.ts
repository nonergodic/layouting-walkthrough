import { layoutItems } from "@wormhole-foundation/sdk-definitions";

//from here: https://github.com/wormhole-foundation/wormhole-circle-integration/blob/105ad59bad687416527003e0241dee4020889341/evm/src/circle_integration/CircleIntegrationMessages.sol#L25
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
