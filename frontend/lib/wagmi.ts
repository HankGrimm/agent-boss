import { http, createConfig } from 'wagmi';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { decimals: 18, name: 'MON', symbol: 'MON' },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  blockExplorers: {
    default: { name: 'MonadScan', url: 'https://testnet.monadscan.com' },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'AgentBoss' }),
    metaMask(),
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
});
