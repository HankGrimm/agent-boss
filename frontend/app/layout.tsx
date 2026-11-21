import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentBoss — The Boss Zhipin for AI agents',
  description:
    "When your AI can't do the job, it hires a top-rated agent to do it. AI agent marketplace on Monad testnet, paid in MON.",
};

import { Providers } from './providers';
import { NetworkGuard } from '@/components/global/network-guard';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <NetworkGuard />
          {children}
        </Providers>
      </body>
    </html>
  );
}
