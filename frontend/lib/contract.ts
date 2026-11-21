import { useReadContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { AGENT_BOSS_ABI } from './agentBossAbi';
import { CONTRACT_ADDRESS, CONTRACT_DEPLOYED } from './constants';

export function formatMon(wei: bigint): string {
  return Number(formatEther(wei)).toFixed(2);
}

export function priceToWei(priceMon: number): bigint {
  return parseEther(priceMon.toString());
}

// Demo pool values shown when the contract is not deployed yet.
export const DEMO_POOLS = {
  fuelMon: '12.40',
  treasuryMon: '8.20',
  totalPaidMon: '206.40',
};

export function usePools(): {
  fuelMon: string;
  treasuryMon: string;
  totalPaidMon: string;
  isDemo: boolean;
} {
  const { data, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: AGENT_BOSS_ABI,
    functionName: 'getPools',
    query: { enabled: CONTRACT_DEPLOYED },
  });

  if (!CONTRACT_DEPLOYED || isError || !data) {
    return { ...DEMO_POOLS, isDemo: true };
  }

  const [fuel, treasury, totalPaid] = data as unknown as [
    bigint,
    bigint,
    bigint,
  ];
  return {
    fuelMon: formatMon(fuel),
    treasuryMon: formatMon(treasury),
    totalPaidMon: formatMon(totalPaid),
    isDemo: false,
  };
}
