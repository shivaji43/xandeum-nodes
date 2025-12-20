'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Network, Settings, Box, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Network', href: '/network', icon: Network },
    { name: 'Trade', href: '/trade', icon: Coins },
    // { name: 'Nodes', href: '/nodes', icon: Box },
    // { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-card text-card-foreground">
      <div className="p-6 flex items-center gap-2 border-b">
        <img src="/xandeum.png" alt="Xandeum" className="h-8 w-8" />
        <span className="font-bold text-lg tracking-tight">Xandeum</span>
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
                  "w-full justify-start gap-3",
                  isActive && "bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t text-xs text-muted-foreground text-center">
        v0.1.0
      </div>
    </div>
  );
}
