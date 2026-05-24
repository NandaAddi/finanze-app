'use client';

import { useState, useTransition } from 'react';
import { toggleUserTier } from '@/app/actions/admin';
import { 
  Crown, User, Calendar, Sparkles, 
  ArrowUpCircle, ArrowDownCircle, Loader2, ShieldCheck
} from 'lucide-react';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string;
  tier: string;
  premium_until: string | null;
  created_at: string;
}

interface Props {
  users: UserRow[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function UsersCmsClient({ users }: Props) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = (userId: string, currentTier: string) => {
    const targetTier = currentTier === 'premium' ? 'free' : 'premium';
    setLoadingId(userId);
    startTransition(async () => {
      await toggleUserTier(userId, targetTier);
      setLoadingId(null);
    });
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#555]">
        <User className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Belum ada pengguna terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const isPremium = user.tier === 'premium';
        const isExpired = user.premium_until
          ? new Date(user.premium_until) < new Date()
          : false;
        const effectivePremium = isPremium && !isExpired;

        return (
          <div
            key={user.id}
            className={`p-5 rounded-xl bg-[#080808] border transition-all duration-150
              ${effectivePremium
                ? 'border-indigo-500/15 hover:border-indigo-500/25'
                : 'border-[#161616] hover:border-[#1a1a1a]'
              }
              ${loadingId === user.id ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold
                ${effectivePremium
                  ? 'bg-indigo-500/15 border border-indigo-500/20 text-indigo-400'
                  : 'bg-[#0f0f0f] border border-[#1a1a1a] text-[#555]'
                }`}
              >
                {(user.full_name ?? user.email).charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-medium text-white truncate">
                    {user.full_name ?? 'Anonim'}
                  </span>

                  {/* Tier Badge */}
                  {effectivePremium ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 tracking-widest uppercase">
                      <Crown className="w-2.5 h-2.5 fill-indigo-400" /> Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#111] border border-[#1a1a1a] text-[9px] font-bold text-[#555] tracking-widest uppercase">
                      <ShieldCheck className="w-2.5 h-2.5" /> Free
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#555] truncate">{user.email}</p>

                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#444] font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Bergabung {formatDate(user.created_at)}
                  </span>
                  {isPremium && user.premium_until && (
                    <span className={`flex items-center gap-1 ${isExpired ? 'text-rose-400/60' : 'text-indigo-400/60'}`}>
                      <Sparkles className="w-3 h-3" />
                      {isExpired ? 'Kadaluarsa' : 'Premium s/d'} {formatDate(user.premium_until)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleToggle(user.id, user.tier)}
                disabled={isPending && loadingId === user.id}
                title={effectivePremium ? 'Turunkan ke Free' : 'Jadikan Premium'}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 border
                  ${effectivePremium
                    ? 'bg-rose-500/5 text-rose-400 border-rose-500/15 hover:bg-rose-500/10 hover:border-rose-500/25'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15 hover:border-indigo-500/30'
                  }
                `}
              >
                {loadingId === user.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : effectivePremium ? (
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                )}
                {effectivePremium ? 'Turunkan ke Free' : 'Jadikan Premium'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
