'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CircleAlert } from 'lucide-react';
import { MONAD_TESTNET_CHAIN_ID } from '@/lib/constants';

export function NetworkGuard() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isSupported = chainId === MONAD_TESTNET_CHAIN_ID;

  if (isSupported) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-4">
      <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
        <CircleAlert className="h-4 w-4" />
        <AlertTitle>Unsupported Network</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-2">
          <p>
            You are connected to an unsupported network. Please switch to
            Monad Testnet to use AgentBoss.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => switchChain({ chainId: MONAD_TESTNET_CHAIN_ID })}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Switch to Monad Testnet
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
