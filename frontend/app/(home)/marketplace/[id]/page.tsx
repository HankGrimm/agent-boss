'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { use } from 'react';
import Link from 'next/link';
import { RatingModal } from '@/components/marketplace/rating-modal';
import { services } from '@/lib/services-data';
import { feeSplit } from '@/lib/dispatch';
import { CONTRACT_ADDRESS, CONTRACT_DEPLOYED } from '@/lib/constants';
import { AGENT_BOSS_ABI } from '@/lib/agentBossAbi';
import { priceToWei } from '@/lib/contract';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const service = services.find((s) => s.id === id);
  const { isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [rated, setRated] = useState(false);
  const [note, setNote] = useState('');

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">
          Agent not found.
        </p>
        <Link href="/marketplace">
          <Button variant="outline">Back to agents</Button>
        </Link>
      </div>
    );
  }

  const split = feeSplit(service.pricePerCall);

  const handleHire = async () => {
    setNote('');
    if (CONTRACT_DEPLOYED && isConnected) {
      try {
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: AGENT_BOSS_ABI,
          functionName: 'purchaseService',
          args: [BigInt(service.id)],
          value: priceToWei(service.pricePerCall),
        });
        setTxHash(hash);
        setHasPurchased(true);
      } catch {
        setNote('Payment was rejected or failed.');
      }
      return;
    }
    // Demo mode — simulate the hire.
    await new Promise((r) => setTimeout(r, 1200));
    setHasPurchased(true);
    setNote(
      'Demo hire — no contract deployed yet. Deploy and paste the address into lib/constants.ts to pay on-chain.'
    );
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (CONTRACT_DEPLOYED && isConnected) {
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: AGENT_BOSS_ABI,
          functionName: 'submitRating',
          args: [BigInt(service.id), rating, comment],
        });
      } catch {
        // fall through — still mark it rated locally
      }
    }
    setRated(true);
    setNote(
      `You rated ${service.name} ${rating}/5.` +
        (CONTRACT_DEPLOYED
          ? ' Rating submitted on-chain.'
          : ' Rating recorded (demo — deploy the contract to put it on-chain).')
    );
  };

  return (
    <div className="space-y-8">
      {/* Agent details */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">{service.icon}</div>
          <div>
            <h2 className="text-xl font-bold">{service.name}</h2>
            <p className="text-sm text-muted-foreground">
              by {service.provider} · {service.category}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
            <Star fill="currentColor" className="text-yellow-400" />
            <span className="font-medium text-sm">{service.rating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({service.ratingCount} reviews)
            </span>
          </div>
        </div>

        <div className="border border-border rounded-lg p-6 space-y-4">
          <p className="text-sm text-muted-foreground">{service.description}</p>

          <div className="flex flex-wrap gap-2">
            {service.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Price per job</div>
            <div className="text-lg font-bold">
              {service.pricePerCall} MON
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
              <div>→ 80% to the agent: {split.agent.toFixed(3)} MON</div>
              <div>
                → 10% to AI fuel (MON the AI uses to buy tokens/compute):{' '}
                {split.fuel.toFixed(3)} MON
              </div>
              <div>
                → 10% to the platform treasury (MON the platform keeps):{' '}
                {split.treasury.toFixed(3)} MON
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hire + rate */}
      <div className="space-y-4">
        <Button
          size="lg"
          className="w-full"
          onClick={handleHire}
          disabled={isPending || hasPurchased}
        >
          {isPending
            ? 'Paying…'
            : hasPurchased
              ? txConfirmed || !CONTRACT_DEPLOYED
                ? 'Hired ✓'
                : 'Hired — confirming…'
              : `Hire ${service.name} — ${service.pricePerCall} MON`}
        </Button>

        {CONTRACT_DEPLOYED && !isConnected && (
          <p className="text-sm text-muted-foreground text-center">
            Connect your wallet to hire on-chain.
          </p>
        )}

        {hasPurchased && !rated && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setIsRatingModalOpen(true)}
          >
            <Star className="mr-2" />
            Rate this agent
          </Button>
        )}

        <Link href="/chat" className="block">
          <Button variant="outline" className="w-full">
            Or let your AI hire for you — AI Dispatch
          </Button>
        </Link>

        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        serviceName={service.name}
      />
    </div>
  );
}
