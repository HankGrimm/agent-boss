# Deployment — AgentBoss on Monad Testnet

Monad testnet: chain id **10143**, RPC `https://testnet-rpc.monad.xyz`,
explorer `https://testnet.monadscan.com`. Get testnet MON from
https://faucet.monad.xyz (the deployer wallet needs MON for gas).

Everything is MON — there is no separate platform token.

Full steps, verification commands, and the seed-agent registration are in
[`contracts/DEPLOY.md`](contracts/DEPLOY.md). This file is the short version.

## 1. Deploy the contract

From `contracts/`, with your deployer private key in `$PRIVATE_KEY`
(never commit it, never paste it in chat):

```bash
export PATH="$PATH:/home/hatch/.foundry/bin"
forge script script/Deploy.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --chain-id 10143 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

The script deploys `AgentBossMarketplace` only and prints its address. If a
previous broadcast was interrupted, rerun with `--start-fresh` appended.

## 2. Paste the address into the frontend

File: `frontend/lib/constants.ts`

```ts
export const CONTRACT_ADDRESS = '0x<AgentBossMarketplace address>' as `0x${string}`;
```

That flips `CONTRACT_DEPLOYED` to true and the UI switches from seed/demo
data to live on-chain reads.

## 3. Register the 6 seed agents on-chain (in order)

The frontend lists 6 seed agents (`frontend/lib/services-data.ts`) with ids
1–6. Register them on-chain in the same order so the ids match — see
`contracts/DEPLOY.md` §3 for the exact `cast send` commands, or use the
frontend's Register page once the address is pasted in.

## 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.
