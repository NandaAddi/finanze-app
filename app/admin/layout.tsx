import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { ClientOnly } from '@/components/client-only';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/blog', label: 'Blog CMS', icon: FileText },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#040404] text-[#f5f5f5] flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-[#161616] bg-[#060606] flex flex-col justify-between fixed h-full z-40">
        <div>
          {/* Logo & Admin Badge */}
          <div className="p-6 border-b border-[#161616]">
            <Link href="/" className="font-lora text-xl font-bold text-emerald-400 tracking-tight">
              Finanze
            </Link>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
                Admin Mode
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#888] hover:text-white hover:bg-[#0f0f0f] transition-all duration-150 group"
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom: User & Back to App */}
        <div className="p-4 border-t border-[#161616] space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#666] hover:text-[#aaa] hover:bg-[#0f0f0f] transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Kembali ke App
          </Link>
          <div className="flex items-center gap-3 px-2">
            <ClientOnly fallback={<div className="w-7 h-7 rounded-full bg-[#111] animate-pulse" />}>
              <UserButton afterSignOutUrl="/" />
            </ClientOnly>
            <span className="text-xs text-[#555] truncate">Admin</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
