'use client';

import { Badge } from '@/components/ui/badge';
import { usePools } from '@/lib/contract';

// Tokenomics panel: where the money from every hire goes.
// All in MON. Every hire splits 80% to the agent, 10% to AI fuel (MON the
// AI uses to buy tokens/compute), 10% to the platform treasury (MON the
// platform keeps).
export function TokenomicsPanel() {
  const pools = usePools();

  return (
    <div className="border border-border rounded-xl p-6 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h2 className="text-lg font-semibold">Where every hire goes</h2>
        {pools.isDemo && <Badge variant="secondary">Demo values</Badge>}
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Every hire splits 80% to the agent, 10% to AI fuel, 10% to the
        platform treasury. All in MON.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-xs text-muted-foreground mb-1">
            Total paid to agents
          </div>
          <div className="text-2xl font-bold">{pools.totalPaidMon} MON</div>
          <div className="text-xs text-muted-foreground mt-1">
            80% of every hire goes to the agent who did the work.
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-xs text-muted-foreground mb-1">AI fuel</div>
          <div className="text-2xl font-bold">{pools.fuelMon} MON</div>
          <div className="text-xs text-muted-foreground mt-1">
            MON the AI uses to buy tokens/compute.
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-xs text-muted-foreground mb-1">
            Platform treasury
          </div>
          <div className="text-2xl font-bold">{pools.treasuryMon} MON</div>
          <div className="text-xs text-muted-foreground mt-1">
            MON the platform keeps.
          </div>
        </div>
      </div>
    </div>
  );
}
