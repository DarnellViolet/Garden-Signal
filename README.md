# Garden Signal

Garden Signal is a Base Mini App built with Next.js, TypeScript, Wagmi, Viem, and Tailwind CSS. It exposes exactly three onchain write actions:

- Water Sprout -> `waterSprout()`
- Warm Bloom -> `warmBloom()`
- Send Breeze -> `sendBreeze()`

The app does not use tokens, points, rewards, invites, or paid application fees. Users only pay Base network gas.

## Production values

The production app includes the Base app id meta tag, Talent app verification meta tag, deployed `GardenSignal` contract address, and ERC-8021 attribution suffix in source control.

- Build code: `bc_3gpfnckf`
- Encoded attribution suffix: `0x62635f336770666e636b660b0080218021802180218021802180218021`

## Contract Source

The complete Solidity contract is included at `contracts/GardenSignal.sol`, with a verification copy and ABI checklist in `contracts/README.md`.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run build
npm run lint
```
