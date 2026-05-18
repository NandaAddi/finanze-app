'use client';

import { useTheme } from "next-themes";
import { useUser } from "@/components/user-provider";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Settings, 
  User, 
  ChevronDown, 
  Github,
  Globe,
  ShieldCheck,
  Scale
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useMounted } from "@/hooks/use-mounted";
import { getOptimizedAvatarUrl } from "@/lib/utils";

export function DesktopUserMenu() {
  const { user } = useUser();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <div className="hidden md:flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 gap-3 px-2 hover:bg-muted/50 rounded-full transition-all">
            <Avatar className="h-8 w-8 border border-border/10 shadow-sm">
              <AvatarImage src={getOptimizedAvatarUrl(user?.avatar_url)} alt={user?.full_name || "User Avatar"} className="object-cover" />
              <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="text-xs font-bold leading-none">{user?.full_name?.split(' ')[0]}</span>
              <span className="text-[10px] text-muted-foreground mt-1">Premium User</span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 rounded-2xl p-2 shadow-2xl">
          <DropdownMenuLabel className="p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none">{user?.full_name}</p>
              <p className="text-[10px] leading-none text-muted-foreground mt-1">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/10" />
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
            <Link href="/dashboard/settings" className="flex items-center w-full">
              <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="text-xs">Pengaturan Profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
            <a href="https://nandaaddiwijaya.my.id" target="_blank" rel="noreferrer" className="flex items-center w-full">
              <Globe className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="text-xs">Informasi Pengembang</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/10" />
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
            <Link href="/privacy-policy" className="flex items-center w-full">
              <ShieldCheck className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="text-xs">Kebijakan Privasi</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5">
            <Link href="/terms-of-service" className="flex items-center w-full">
              <Scale className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="text-xs">Syarat & Ketentuan</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/10" />
          <SignOutButton>
            <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="text-xs font-bold">Keluar Aplikasi</span>
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
