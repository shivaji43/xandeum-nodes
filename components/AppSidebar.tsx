'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Network, Settings, Box, Coins, ChevronLeft, ChevronRight, Trophy, Star, Sparkles } from 'lucide-react';
import { FaGlobe, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useClusterData } from '@/hooks/useClusterData';

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { nodes, error } = useClusterData();
  const isOnline = !error && nodes.length > 0;

  const links = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Network', href: '/network', icon: Network },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Watchlist', href: '/watchlist', icon: Star },
    { name: 'XAND Bot', href: '/chat', icon: Sparkles },
    { name: 'Trade / Stake', href: '/trade', icon: Coins },
    // { name: 'Nodes', href: '/nodes', icon: Box },
    // { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div 
      className={cn(
        "flex flex-col h-screen border-r bg-card text-card-foreground transition-all duration-300 ease-in-out relative chat-font",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md z-50 hover:bg-accent"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className={cn("p-6 border-b", isCollapsed && "justify-center px-2")}>
        <Link href="/" className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
          <img src="/xandeum.png" alt="Xandeum" className="h-8 w-8 shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight overflow-hidden whitespace-nowrap transition-all duration-300">
              Xandeum
            </span>
          )}
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          
          return (
            <Link key={link.href} href={link.href} className="block">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-300",
                  isActive && "bg-secondary",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? link.name : undefined}
              >
                {link.name === 'XAND Bot' ? (
                  <img src="/xandeum.png" alt="XAND" className="h-6 w-6 shrink-0" />
                ) : (
                  <Icon className="h-6 w-6 shrink-0" />
                )}
                {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">{link.name}</span>}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className={cn("px-4 pb-2", isCollapsed && "px-2")}>
        <div className={cn("flex items-center gap-2 justify-center py-2", isCollapsed ? "flex-col" : "flex-row")}>
            <div className={cn("h-2 w-2 rounded-full", isOnline ? "bg-emerald-500" : "bg-red-500 animate-pulse")} />
            {!isCollapsed && (
              <span className={cn("text-xs font-medium", isOnline ? "text-emerald-500" : "text-destructive")}>
                {isOnline ? "Network Online" : "Offline"}
              </span>
            )}
        </div>
      </div>

      <div className={cn("p-4 border-t flex flex-col gap-4", isCollapsed && "items-center")}>

        <div className={cn("flex gap-4", isCollapsed ? "flex-col" : "justify-center")}>
            <Link href="https://www.xandeum.network/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <FaGlobe className="h-5 w-5" />
            <span className="sr-only">Website</span>
          </Link>
          <Link href="https://x.com/Xandeum" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <FaXTwitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="https://discord.com/invite/mGAxAuwnR9" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <FaDiscord className="h-5 w-5" />
            <span className="sr-only">Discord</span>
          </Link>
        </div>
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground text-center whitespace-nowrap overflow-hidden">
            v0.1.0
          </div>
        )}
      </div>
    </div>
  );
}
