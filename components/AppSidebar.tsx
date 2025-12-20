'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Network, Settings, Box, Coins } from 'lucide-react';
import { FaGlobe, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
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

      <div className="p-4 border-t flex flex-col gap-4">
        <div className="flex justify-center gap-4">
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
        <div className="text-xs text-muted-foreground text-center">
          v0.1.0
        </div>
      </div>
    </div>
  );
}
