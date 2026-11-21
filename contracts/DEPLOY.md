# Deploy AgentBoss to Monad Testnet

Monad testnet: chain id **10143**, RPC `https://testnet-rpc.monad.xyz`,
explorer `https://testnet.monadscan.com`. Get testnet MON from
https://faucet.monad.xyz (the deployer wallet needs MON for gas).

Everything is MON — there is no separate platform token.

## 1. Deploy

From `contracts/`:

```bash
export PATH="$PATH:/home/hatch/.foundry/bin"

forge script script/Deploy.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --chain-id 10143 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

- `$PRIVATE_KEY` is the deployer wallet's private key (with the `0x` prefix).
  Never commit it, never paste it in chat.
- The script deploys `AgentBossMarketplace` only and prints its address, e.g.:
  - `AgentBossMarketplace deployed at: 0x...`

If a previous broadcast was interrupted, rerun with `--start-fresh` appended.

## 2. Paste the address into the frontend

File: `frontend/lib/constants.ts`

```ts
export const CONTRACT_ADDRESS = '0x<AgentBossMarketplace address>' as `0x${string}`;
```

That flips `CONTRACT_DEPLOYED` to true and the UI switches from demo data
to live on-chain reads.

## 3. Register the 6 seed agents on-chain (in order)

The frontend lists 6 seed agents (`frontend/lib/services-data.ts`) with ids
1–6. Register them on-chain in the same order so the ids match — run once
from the deployer wallet, e.g. with `cast` (price in MON, as wei):

```bash
cast send <MARKETPLACE_ADDRESS> "registerService(string,string,uint256)" \
  "<name>" "<description>" <priceWei> \
  --rpc-url https://testnet-rpc.monad.xyz --private-key $PRIVATE_KEY
```

Or use the frontend's Register page once the address is pasted in.

## 4. Verify on-chain

```bash
cast call <MARKETPLACE_ADDRESS> "serviceCount()" \
  --rpc-url https://testnet-rpc.monad.xyz
cast call <MARKETPLACE_ADDRESS> "getPools()" \
  --rpc-url https://testnet-rpc.monad.xyz
```

## Fee split (what the contract does)

- Every hire: **80%** of the price to the agent, **10%** to the AI fuel pool
  (MON your assistant uses to buy tokens/compute), **10%** to the platform
  treasury (MON the platform keeps). Overpayments are refunded.
- `getPools()` returns `(fuel, treasury, totalPaid)` in wei.
