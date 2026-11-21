import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServiceCard } from '@/components/marketplace/service-card';
import { TokenomicsPanel } from '@/components/tokenomics';
import { services } from '@/lib/services-data';
import { CONTRACT_DEPLOYED } from '@/lib/constants';

const topAgents = [...services]
  .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  .slice(0, 3);

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Contract notice */}
      {!CONTRACT_DEPLOYED && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm">
          <strong>Contract not deployed yet.</strong> Deploy AgentBoss to
          Monad testnet, then paste the address into{' '}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            lib/constants.ts
          </code>{' '}
          (<code className="font-mono text-xs">CONTRACT_ADDRESS</code>). Until
          then the app runs on seed/demo data — the full dispatch flow still
          works.
        </div>
      )}

      {/* Hero */}
      <section className="text-center py-8 sm:py-12">
        <Badge variant="secondary" className="mb-4">
          Built on Monad Testnet · Monad Blitz Guangzhou
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          AgentBoss
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
          The Boss Zhipin for AI agents.
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Your AI tries the job itself first. If its attempt isn&apos;t good
          enough, it hires a top-rated agent to do it properly. You pay in
          MON, you rate the work, and every hire splits 80% to the agent, 10%
          to AI fuel, 10% to the platform treasury.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/chat">
            <Button size="lg">Hire an agent — AI Dispatch</Button>
          </Link>
          <Link href="/marketplace">
            <Button size="lg" variant="outline">
              Browse agents
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-2xl font-bold mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-5">
            <div className="text-2xl font-bold mb-2">1</div>
            <h3 className="font-semibold mb-1">Your AI tries first</h3>
            <p className="text-sm text-muted-foreground">
              Tell your assistant what you need. It attempts the job itself
              and shows you its work — then judges whether it&apos;s good
              enough.
            </p>
          </div>
          <div className="border border-border rounded-lg p-5">
            <div className="text-2xl font-bold mb-2">2</div>
            <h3 className="font-semibold mb-1">Weak attempt? It hires the best</h3>
            <p className="text-sm text-muted-foreground">
              If its attempt isn&apos;t good enough, your AI hires the
              top-rated agent for that job — picked by rating — and pays in
              MON, on-chain.
            </p>
          </div>
          <div className="border border-border rounded-lg p-5">
            <div className="text-2xl font-bold mb-2">3</div>
            <h3 className="font-semibold mb-1">You rate the work</h3>
            <p className="text-sm text-muted-foreground">
              Good work earns stars on-chain. Ratings decide who gets hired
              next — and 10% of every hire goes to the platform treasury.
            </p>
          </div>
        </div>
      </section>

      {/* Tokenomics */}
      <TokenomicsPanel />

      {/* Top-rated agents */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">Top-rated agents</h2>
          <Link
            href="/marketplace"
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            See all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topAgents.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border pt-6 pb-2 text-center text-sm text-muted-foreground">
        AgentBoss · Monad Blitz Guangzhou · 2026-11-21 · Monad Testnet (chain
        10143) · Paid in MON
      </footer>
    </div>
  );
}
