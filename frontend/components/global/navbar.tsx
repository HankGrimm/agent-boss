'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { ChainSwitcher } from '@/components/global/chain-switcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="text-lg font-bold">
          AgentBoss
          <span className="ml-2 text-xs font-normal text-muted-foreground hidden sm:inline">
            The Boss Zhipin for AI agents
          </span>
        </Link>

        {/* Center Navigation */}
        <div className="flex items-center gap-1 sm:gap-4">
          <Link href="/chat">
            <Button variant="default" size="default">
              AI Dispatch
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="ghost" size="default">
              Agents
            </Button>
          </Link>
          <Link href="/register/service">
            <Button variant="ghost" size="default">
              List your agent
            </Button>
          </Link>
        </div>

        {/* Right Side - Connect Wallet */}
        <div className="flex items-center gap-2">
          <ChainSwitcher />

          {isConnected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="font-mono">
                  <Wallet className="mr-2" />
                  {formatAddress(address)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => disconnect()} className="text-destructive">
                  <LogOut className="mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="default">
                  <Wallet className="mr-2" />
                  Connect Wallet
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom">
                {connectors.map((connector) => (
                  <DropdownMenuItem
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                  >
                    {connector.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
