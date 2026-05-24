'use client';

import { AdminStats, RecentUser, UserGrowthPoint } from '@/lib/types/admin';
import {
  Users, Receipt, Sparkles, TrendingUp,
  Calendar, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  stats: AdminStats;
  recentUsers: RecentUser[];
  userGrowth: UserGrowthPoint[];
}

const statCards = (stats: AdminStats) => [
  {
    label: 'Total Pengguna',
    value: stats.totalUsers.toLocaleString('id-ID'),
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/10',
    trend: '+' + stats.totalUsers,
  },
  {
    label: 'Aktif 7 Hari',
    value: stats.activeUsers7d.toLocaleString('id-ID'),
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/10',
    trend: 'pengguna aktif',
  },
  {
    label: 'Total Transaksi',
    value: stats.totalTransactions.toLocaleString('id-ID'),
    icon: Receipt,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/10',
    trend: 'semua waktu',
  },
  {
    label: 'AI Queries',
    value: stats.totalAiQueries.toLocaleString('id-ID'),
    icon: Sparkles,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/10',
    trend: 'penggunaan AI',
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-3 text-xs shadow-xl">
        <p className="text-[#888] mb-1">{label}</p>
        <p className="text-emerald-400 font-semibold">{payload[0].value} pengguna baru</p>
      </div>
    );
  }
  return null;
};

export function AdminDashboardClient({ stats, recentUsers, userGrowth }: Props) {
  const cards = statCards(stats);

  return (
    <div className="p-8 flex-1 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-lora text-3xl font-bold text-white">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-[#666] mt-1">
            Pantau pertumbuhan platform Finanze secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a0a0a] border border-[#161616] text-[10px] text-[#666] font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Data
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`p-5 rounded-2xl bg-[#080808] border ${card.border} hover:border-opacity-30 transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#333]" />
            </div>
            <div className="font-lora text-2xl font-bold text-white mb-1">
              {card.value}
            </div>
            <div className="text-xs text-[#666]">{card.label}</div>
            <div className={`text-[10px] ${card.color} font-mono mt-1`}>{card.trend}</div>
          </div>
        ))}
      </div>

      {/* Growth Chart + Recent Users */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Growth Chart */}
        <div className="xl:col-span-2 p-6 rounded-2xl bg-[#080808] border border-[#161616]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-lora text-lg font-semibold text-white">
              Pertumbuhan Pengguna (30 Hari)
            </h2>
            <span className="text-[10px] font-mono text-[#555] bg-[#0f0f0f] px-2 py-1 rounded-md border border-[#1a1a1a]">
              Harian
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#555' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.slice(5)}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#555' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#emeraldGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Users Table */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-[#161616]">
          <h2 className="font-lora text-lg font-semibold text-white mb-5">
            Pengguna Terbaru
          </h2>
          {recentUsers.length === 0 ? (
            <p className="text-xs text-[#555] text-center py-8">Belum ada pengguna.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0a0a0a] border border-[#111] hover:border-[#1a1a1a] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-emerald-400">
                      {(user.full_name ?? user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {user.full_name ?? 'Anonim'}
                    </p>
                    <p className="text-[10px] text-[#555] truncate">{user.email}</p>
                  </div>
                  <div className="text-[9px] text-[#444] font-mono shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(user.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
