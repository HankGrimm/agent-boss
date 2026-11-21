'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Send, Sparkles } from 'lucide-react';
import {
  routeTask,
  judgeAttempt,
  mockAttempt,
  feeSplit,
  mockResult,
} from '@/lib/dispatch';
import type { Service } from '@/lib/services-data';
import { CONTRACT_ADDRESS, CONTRACT_DEPLOYED } from '@/lib/constants';
import { AGENT_BOSS_ABI } from '@/lib/agentBossAbi';
import { priceToWei } from '@/lib/contract';
import { generateAgentResult, generateOwnAttempt } from '@/app/actions/dispatch';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

type Phase =
  | 'idle'
  | 'attempting'
  | 'judging'
  | 'delegated'
  | 'paying'
  | 'working'
  | 'done'
  | 'rated';

interface Msg {
  role: 'user' | 'assistant' | 'system';
  text: string;
}

const EXAMPLE_TASKS = [
  'Design a logo for my coffee brand',
  'Analyze my Q3 sales data',
  'Write a 60-second video script for a new app',
  'Review my smart contract code',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ChatPage() {
  const { isConnected } = useAccount();
  const { writeContractAsync, isPending: writePending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      text: "Hi, I'm your AI assistant. Tell me what you need — I'll try it myself first. If my attempt isn't good enough, I'll hire a top-rated agent on AgentBoss to do it properly, and you only pay in MON.",
    },
  ]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentTask, setCurrentTask] = useState('');
  const [attempt, setAttempt] = useState<{ text: string; live: boolean } | null>(null);
  const [judgment, setJudgment] = useState<{ weak: boolean; reason: string } | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Service | null>(null);
  const [result, setResult] = useState<{ text: string; live: boolean } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [hireTx, setHireTx] = useState('');
  const workStarted = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, phase, attempt]);

  // When the on-chain hire confirms, move on to the work.
  useEffect(() => {
    if (txHash && txConfirmed && phase === 'paying' && !workStarted.current) {
      workStarted.current = true;
      setHireTx(txHash);
      runWork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txConfirmed, txHash, phase]);

  const runWork = async () => {
    setPhase('working');
    await sleep(1500);
    let text = '';
    let live = false;
    try {
      const res = await generateAgentResult(
        currentTask,
        selectedAgent?.name ?? 'Agent',
        selectedAgent?.category ?? ''
      );
      if (res.live && res.text) {
        text = res.text;
        live = true;
      }
    } catch {
      // fall through to the demo result
    }
    if (!live && selectedAgent) {
      text = mockResult(currentTask, selectedAgent);
    }
    setResult({ text, live });
    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        text: `${selectedAgent?.name ?? 'The agent'} finished the job.`,
      },
    ]);
    setPhase('done');
  };

  const handleSend = async (text: string) => {
    const task = text.trim();
    if (
      !task ||
      phase === 'attempting' ||
      phase === 'judging' ||
      phase === 'paying' ||
      phase === 'working'
    )
      return;
    setError('');
    setResult(null);
    setAttempt(null);
    setJudgment(null);
    setRating(0);
    setComment('');
    setSelectedAgent(null);
    setHireTx('');
    workStarted.current = false;
    setCurrentTask(task);
    setMessages((prev) => [...prev, { role: 'user', text: task }]);
    setInput('');

    // 1. The personal AI attempts the task itself first.
    setPhase('attempting');
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: 'Let me try it myself first…' },
    ]);
    const { category } = routeTask(task);
    let attemptText = '';
    let attemptLive = false;
    try {
      const res = await generateOwnAttempt(task);
      if (res.live && res.text) {
        attemptText = res.text;
        attemptLive = true;
      }
    } catch {
      // fall through to the demo attempt
    }
    if (!attemptLive) {
      attemptText = mockAttempt(task, category);
    }
    setAttempt({ text: attemptText, live: attemptLive });
    await sleep(600);

    // 2. The AI judges its own attempt.
    setPhase('judging');
    await sleep(900);
    const verdict = judgeAttempt(task);
    setJudgment({ weak: verdict.weak, reason: verdict.reason });

    if (!verdict.weak || !verdict.agent) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `My verdict: good enough — ${verdict.reason}`,
        },
      ]);
      setPhase('idle');
      return;
    }

    // 3. Weak attempt → delegate to the top-rated specialist.
    setSelectedAgent(verdict.agent);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: `My verdict: not good enough — ${verdict.reason}`,
      },
    ]);
    setPhase('delegated');
  };

  const handleHire = async () => {
    if (!selectedAgent) return;
    setError('');
    setPhase('paying');
    const priceWei = priceToWei(selectedAgent.pricePerCall);

    if (CONTRACT_DEPLOYED && isConnected) {
      try {
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: AGENT_BOSS_ABI,
          functionName: 'purchaseService',
          args: [BigInt(selectedAgent.id)],
          value: priceWei,
        });
        setTxHash(hash);
        // runWork() fires from the receipt effect above.
      } catch {
        setError('Payment was rejected or failed. You can try again.');
        setPhase('delegated');
      }
      return;
    }

    // Demo mode: no contract deployed (or no wallet) — simulate the payment
    // so the full flow is still visible on stage.
    await sleep(1200);
    setPhase('working');
    await runWork();
  };

  const handleRate = async () => {
    if (!selectedAgent || rating === 0) return;
    if (CONTRACT_DEPLOYED && isConnected) {
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: AGENT_BOSS_ABI,
          functionName: 'submitRating',
          args: [BigInt(selectedAgent.id), rating, comment],
        });
      } catch {
        // Rating failed on-chain; still record it locally so the demo continues.
      }
    }
    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        text: `You rated ${selectedAgent.name} ${rating}/5${comment ? ` — "${comment}"` : ''}. ${CONTRACT_DEPLOYED ? 'Rating submitted on-chain.' : 'Rating recorded (demo — deploy the contract to put it on-chain).'} Ratings decide who gets hired next time.`,
      },
    ]);
    setPhase('rated');
  };

  const split = selectedAgent ? feeSplit(selectedAgent.pricePerCall) : null;
  const busy =
    phase === 'attempting' ||
    phase === 'judging' ||
    phase === 'paying' ||
    phase === 'working' ||
    writePending;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">AI Dispatch</h1>
        <p className="text-muted-foreground">
          Talk to your AI. It tries the job itself first — and if its attempt
          isn&apos;t good enough, it hires a top-rated agent on AgentBoss.
          You pay in MON and rate the work.
        </p>
        {!CONTRACT_DEPLOYED && (
          <p className="text-sm mt-2">
            <Badge variant="secondary">Demo mode</Badge>{' '}
            <span className="text-muted-foreground">
              No contract deployed yet — payments and ratings are simulated.
              Deploy and paste the address into{' '}
              <code className="font-mono text-xs bg-muted px-1 rounded">
                lib/constants.ts
              </code>
              .
            </span>
          </p>
        )}
      </div>

      {/* Chat log */}
      <div
        ref={logRef}
        className="border border-border rounded-xl bg-card p-4 sm:p-6 space-y-4 min-h-[280px] max-h-[52vh] overflow-y-auto mb-4"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : m.role === 'system'
                    ? 'bg-muted text-muted-foreground italic'
                    : 'bg-muted'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {phase === 'attempting' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground">
              Your AI is trying it…
            </div>
          </div>
        )}
        {phase === 'judging' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground">
              Your AI is judging its own attempt…
            </div>
          </div>
        )}
        {phase === 'working' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-3 text-sm text-muted-foreground">
              {selectedAgent?.name} is working on it…
            </div>
          </div>
        )}
      </div>

      {/* The AI's own attempt + verdict */}
      {attempt && (
        <div className="border border-border rounded-xl p-5 mb-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold">My attempt</h2>
            {attempt.live ? (
              <Badge>Live AI</Badge>
            ) : (
              <Badge variant="secondary">Demo attempt</Badge>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap mb-3">{attempt.text}</p>
          {judgment && (
            <p
              className={`text-sm border-t border-border pt-3 ${
                judgment.weak ? 'text-amber-600' : 'text-green-600'
              }`}
            >
              <strong>My verdict: {judgment.weak ? 'not good enough' : 'good enough'}.</strong>{' '}
              {judgment.reason}
            </p>
          )}
        </div>
      )}

      {/* Delegation card */}
      {selectedAgent && (phase === 'delegated' || phase === 'paying') && (
        <div className="border border-primary/50 rounded-xl p-5 mb-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles fill="currentColor" className="text-primary w-5 h-5" />
            <h2 className="font-semibold">Your AI is hiring a specialist</h2>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">{selectedAgent.icon}</div>
            <div className="flex-1">
              <div className="font-semibold">
                {selectedAgent.name}{' '}
                <span className="text-sm font-normal text-muted-foreground">
                  by {selectedAgent.provider}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star fill="currentColor" className="text-yellow-400 w-4 h-4" />
                <span className="font-medium">
                  {selectedAgent.rating?.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({selectedAgent.ratingCount} reviews) · top-rated in{' '}
                  {selectedAgent.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAgent.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {selectedAgent.pricePerCall} MON
              </div>
              <div className="text-xs text-muted-foreground">per job</div>
            </div>
          </div>

          <p className="text-sm mb-3">
            Picked because it is the top-rated {selectedAgent.name} (
            {selectedAgent.rating?.toFixed(1)}★) — ratings decide who gets
            hired next time.
          </p>

          {split && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm mb-4 space-y-1">
              <div className="flex justify-between gap-3">
                <span>80% to the agent</span>
                <span className="font-mono shrink-0">{split.agent.toFixed(3)} MON</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>10% to AI fuel (MON the AI uses to buy tokens/compute)</span>
                <span className="font-mono shrink-0">{split.fuel.toFixed(3)} MON</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>10% to the platform treasury (MON the platform keeps)</span>
                <span className="font-mono shrink-0">{split.treasury.toFixed(3)} MON</span>
              </div>
            </div>
          )}

          {CONTRACT_DEPLOYED && !isConnected && (
            <p className="text-sm text-muted-foreground mb-3">
              Connect your wallet to pay with MON.
            </p>
          )}
          <Button
            className="w-full"
            size="lg"
            onClick={handleHire}
            disabled={busy || (CONTRACT_DEPLOYED && !isConnected)}
          >
            {phase === 'paying'
              ? 'Paying…'
              : `Pay & hire — ${selectedAgent.pricePerCall} MON`}
          </Button>
          {hireTx && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Hire tx: {hireTx.slice(0, 10)}…{hireTx.slice(-6)}
            </p>
          )}
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      )}

      {/* Result + rating */}
      {result && (phase === 'done' || phase === 'rated') && selectedAgent && (
        <div className="border border-border rounded-xl p-5 mb-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-semibold">Result from {selectedAgent.name}</h2>
            {result.live ? (
              <Badge>Live AI</Badge>
            ) : (
              <Badge variant="secondary">Demo result</Badge>
            )}
          </div>
          {!result.live && (
            <p className="text-xs text-muted-foreground mb-2">
              Demo result — set GEMINI_API_KEY to get live AI output.
            </p>
          )}
          <p className="text-sm whitespace-pre-wrap mb-4">{result.text}</p>

          {phase === 'done' && (
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-2">
                How was the work? Rate {selectedAgent.name}
              </p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-transform hover:scale-110"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400'
                          : 'text-muted-foreground/40'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2 self-center">
                  {rating > 0
                    ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]
                    : 'Select a rating'}
                </span>
              </div>
              <Input
                placeholder="Add a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-3"
              />
              <Button onClick={handleRate} disabled={rating === 0}>
                Submit rating
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Ratings decide who gets hired next time.
              </p>
            </div>
          )}
          {phase === 'rated' && (
            <p className="text-sm text-muted-foreground border-t border-border pt-4">
              Thanks — your rating is in. It decides who gets hired next.
            </p>
          )}
        </div>
      )}

      {/* Example tasks */}
      {phase === 'idle' && messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {EXAMPLE_TASKS.map((t) => (
            <button
              key={t}
              onClick={() => handleSend(t)}
              className="text-xs border border-border rounded-full px-3 py-1.5 hover:border-primary/50 hover:bg-muted transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask your AI to do something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          disabled={busy}
        />
        <Button onClick={() => handleSend(input)} disabled={busy || !input.trim()}>
          <Send />
          Send
        </Button>
      </div>
    </div>
  );
}
