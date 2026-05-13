'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon, CheckCheck, Trash2, BellOff, LogOut, Info } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/components/user-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useMounted } from '@/hooks/use-mounted';
import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { getNotifications, markNotifAsRead, deleteNotif } from '@/app/actions/finance';
import { toast } from 'sonner';
import { SignOutButton } from "@clerk/nextjs";

export function TopNav() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    if (mounted && user) {
      fetchNotifs();
    }
  }, [mounted, user]);

  const handleMarkAsRead = async (id: string) => {
    const res = await markNotifAsRead(id);
    if (res.success) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const res = await deleteNotif(id);
    if (res.success) {
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notifikasi dihapus');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed top-0 left-0 right-0 z-[50] block md:hidden w-full">
      <div className="h-16 bg-background/80 backdrop-blur-md border-b border-border/10 flex items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
          {mounted ? (
            <Image 
              src={theme === 'dark' ? "/logo-dark.png" : "/logo-light.png"} 
              alt="Finanze Logo" 
              width={28} 
              height={28} 
              className="rounded-lg"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-muted animate-pulse" />
          )}
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-lora), serif' }}>
            Finanze
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/50 border border-border/10 active:scale-90 transition-all"
          >
            {mounted && theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          <Sheet onOpenChange={(open) => open && fetchNotifs()}>
            <SheetTrigger asChild>
              <button className="relative w-10 h-10 rounded-full flex items-center justify-center bg-muted/50 border border-border/10 active:scale-90 transition-all">
                <Bell className="w-4 h-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 gap-0 flex flex-col">
              <SheetHeader className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-bold font-serif-display">Notifikasi</SheetTitle>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={fetchNotifs}>
                    <CheckCheck className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-10 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs">Memuat notifikasi...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-5 border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group relative ${!n.is_read ? 'bg-emerald-500/5' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-semibold text-sm ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h4>
                        <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.is_read ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> : <div />}
                        <button 
                          onClick={(e) => handleDelete(e, n.id)}
                          className="text-[10px] font-medium text-rose-500 flex items-center gap-1 hover:bg-rose-500/10 p-1 rounded"
                        >
                          <Trash2 className="h-3 w-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground opacity-50">
                    <BellOff className="h-10 w-10" />
                    <p className="text-sm">Belum ada notifikasi baru.</p>
                  </div>
                )}
              </div>

              {/* Bottom Actions in Sheet */}
              <div className="p-4 border-t border-border/50 bg-muted/20 space-y-2">
                 <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-xs" asChild>
                    <Link href="/dashboard/settings">
                       <Info className="w-4 h-4 text-primary" /> Informasi Pengembang
                    </Link>
                 </Button>
                 <SignOutButton>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-500">
                       <LogOut className="w-4 h-4" /> Keluar Aplikasi
                    </Button>
                 </SignOutButton>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/dashboard/settings">
            <Avatar className="w-10 h-10 border border-border/10 shadow-sm active:scale-90 transition-all">
              {mounted && <AvatarImage src={user?.avatar_url} />}
              <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                {mounted ? (user?.full_name?.[0]?.toUpperCase() || 'U') : 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </div>
  );
}
