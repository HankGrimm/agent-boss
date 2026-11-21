'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONTRACT_ADDRESS, CONTRACT_DEPLOYED } from '@/lib/constants';
import { AGENT_BOSS_ABI } from '@/lib/agentBossAbi';
import { priceToWei } from '@/lib/contract';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const CATEGORIES = ['Design', 'Data', 'Writing', 'Code', 'Research', 'Audio'];

export default function RegisterServicePage() {
  const { isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('0.5');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNote('');
    if (!name.trim() || !description.trim()) {
      setNote('Please fill in a name and a description.');
      return;
    }
    const priceNum = Number(price);
    if (!priceNum || priceNum <= 0) {
      setNote('Please enter a price above 0 MON.');
      return;
    }

    if (!CONTRACT_DEPLOYED || !isConnected) {
      // Demo mode — record the listing locally so the flow is visible.
      setDone(true);
      setNote(
        `Demo mode — "${name}" (${category}, ${priceNum} MON/job) would be registered on-chain once the contract is deployed and your wallet is connected.`
      );
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: AGENT_BOSS_ABI,
        functionName: 'registerService',
        args: [name.trim(), `${description.trim()} [${category}]`, priceToWei(priceNum)],
      });
      setTxHash(hash);
      setDone(true);
    } catch {
      setNote('Registration was rejected or failed.');
    }
  };

  return (
    <>
      {!CONTRACT_DEPLOYED && (
        <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm">
          <Badge variant="secondary" className="mr-2">
            Demo mode
          </Badge>
          No contract deployed yet — listings are recorded locally for now.
        </div>
      )}

      {done ? (
        <div className="border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-2">
            {isSuccess ? 'Agent listed on-chain ✓' : 'Listing recorded'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{note}</p>
          {txHash && (
            <p className="text-xs text-muted-foreground font-mono mb-4">
              Tx: {txHash.slice(0, 10)}…{txHash.slice(-6)}
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setDone(false);
              setName('');
              setDescription('');
              setPrice('0.5');
              setNote('');
              setTxHash(undefined);
            }}
          >
            List another agent
          </Button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2">
              Agent name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Logo Designer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              What it does <span className="text-destructive">*</span>
            </label>
            <textarea
              placeholder="Describe what your agent does and what the client gets..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Price per job (MON) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                MON
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-14 pr-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              You keep 80% of every job. 10% goes to AI fuel, 10% to the
              platform treasury.
            </p>
          </div>

          {CONTRACT_DEPLOYED && !isConnected && (
            <p className="text-sm text-muted-foreground">
              Connect your wallet to list your agent on-chain.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || (CONTRACT_DEPLOYED && !isConnected)}
          >
            {isPending ? 'Listing…' : 'List my agent'}
          </Button>
          {note && <p className="text-sm text-destructive">{note}</p>}
        </form>
      )}
    </>
  );
}
