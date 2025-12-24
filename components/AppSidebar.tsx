'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Network, Settings, Box, Coins, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { FaGlobe, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Network', href: '/network', icon: Network },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Trade', href: '/trade', icon: Coins },
    // { name: 'Nodes', href: '/nodes', icon: Box },
    // { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div 
      className={cn(
        "flex flex-col h-screen border-r bg-card text-card-foreground transition-all duration-300 ease-in-out relative",
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

      <div className={cn("p-6 flex items-center gap-2 border-b", isCollapsed && "justify-center px-2")}>
        <img src="/xandeum.png" alt="Xandeum" className="h-8 w-8 shrink-0" />
        {!isCollapsed && (
          <span className="font-bold text-lg tracking-tight overflow-hidden whitespace-nowrap transition-all duration-300">
            Xandeum
          </span>
        )}
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
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="overflow-hidden whitespace-nowrap">{link.name}</span>}
              </Button>
            </Link>
          );
        })}
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
          <Link href="https://discord.gg/uqRSmmM5m" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
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
