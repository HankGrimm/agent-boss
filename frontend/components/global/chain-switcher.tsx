'use client';

import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { CircleAlert } from 'lucide-react';
import { MONAD_TESTNET_CHAIN_ID } from '@/lib/constants';
import { useEffect, useState } from 'react';

export function ChainSwitcher() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected) return null;

  const isWrongNetwork = chainId !== MONAD_TESTNET_CHAIN_ID;

  return (
    <Button
      variant={isWrongNetwork ? 'destructive' : 'outline'}
      size="sm"
      className="gap-2"
      onClick={
        isWrongNetwork
          ? () => switchChain({ chainId: MONAD_TESTNET_CHAIN_ID })
          : undefined
      }
    >
      {isWrongNetwork && <CircleAlert className="w-4 h-4" />}
      {isWrongNetwork ? 'Switch to Monad Testnet' : 'Monad Testnet'}
    </Button>
  );
}
