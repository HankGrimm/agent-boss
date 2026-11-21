// Monad Testnet — the only chain AgentBoss runs on.
export const MONAD_TESTNET_CHAIN_ID = 10143;
export const MONAD_TESTNET_RPC = 'https://testnet-rpc.monad.xyz';
export const MONAD_TESTNET_EXPLORER = 'https://testnet.monadscan.com';

// AgentBoss contract address (Monad testnet).
// Paste the deployed address here. Until then the UI runs on seed/demo data.
export const CONTRACT_ADDRESS =
  '0x0000000000000000000000000000000000000000' as `0x${string}`;

export const ZERO_ADDRESS =
  '0x0000000000000000000000000000000000000000' as `0x${string}`;

export const CONTRACT_DEPLOYED = CONTRACT_ADDRESS !== ZERO_ADDRESS;

// Fee split on every hire (percent of the price, all in MON).
// 80% to the agent, 10% to AI fuel (MON the AI uses to buy tokens/compute),
// 10% to the platform treasury (MON the platform keeps).
export const FEE_SPLIT = { agent: 80, fuel: 10, treasury: 10 } as const;

// IMPORTANT: register the 6 seed agents (lib/services-data.ts) on-chain in
// order, so on-chain service ids 1-6 match the frontend seed ids.
export const SEED_AGENT_COUNT = 6;
