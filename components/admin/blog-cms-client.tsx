'use client';

import { BlogPost } from '@/lib/types/admin';
import { toggleBlogPublish, deleteBlogPost } from '@/app/actions/admin';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { 
  Pencil, Trash2, Eye, EyeOff, Calendar, Clock, 
  FileText, Globe, AlertCircle 
} from 'lucide-react';

interface Props {
  posts: BlogPost[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function BlogCmsClient({ posts }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    startTransition(async () => {
      await toggleBlogPublish(id, currentStatus);
      setTogglingId(null);
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteBlogPost(id);
      setDeletingId(null);
    });
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="w-12 h-12 text-[#333] mb-4" />
        <p className="text-[#666] text-sm">Belum ada artikel. Mulai tulis sekarang!</p>
        <Link
          href="/admin/blog/new"
          className="mt-4 px-4 py-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full hover:bg-emerald-500/20 transition-colors"
        >
          + Artikel Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className={`p-5 rounded-xl bg-[#080808] border transition-all duration-150
            ${post.is_published ? 'border-[#161616] hover:border-emerald-500/15' : 'border-[#111] hover:border-[#1a1a1a]'}
            ${deletingId === post.id ? 'opacity-40 pointer-events-none' : ''}
          `}
        >
          <div className="flex items-start gap-4">
            {/* Status indicator */}
            <div className="mt-1 shrink-0">
              {post.is_published ? (
                <Globe className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#555]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono 
                  ${post.is_published 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-[#111] text-[#555] border border-[#1a1a1a]'
                  }`}
                >
                  {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                </span>
                <span className="text-[10px] text-[#444] font-mono px-1.5 py-0.5 bg-[#0a0a0a] border border-[#111] rounded">
                  {post.category}
                </span>
              </div>

              <h3 className="font-lora text-base font-semibold text-white leading-snug mb-1">
                {post.title}
              </h3>
              <p className="text-xs text-[#666] line-clamp-2 mb-3">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-4 text-[10px] text-[#444] font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.published_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.read_time}
                </span>
                <span className="text-[#333]">/blog/{post.slug}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle publish */}
              <button
                onClick={() => handleToggle(post.id, post.is_published)}
                disabled={isPending && togglingId === post.id}
                title={post.is_published ? 'Jadikan Draft' : 'Publikasikan'}
                className={`p-2 rounded-lg transition-all duration-150 border
                  ${post.is_published 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-[#0a0a0a] text-[#555] border-[#161616] hover:text-white hover:border-[#222]'
                  }
                  ${togglingId === post.id ? 'opacity-50' : ''}
                `}
              >
                {post.is_published 
                  ? <EyeOff className="w-3.5 h-3.5" />
                  : <Eye className="w-3.5 h-3.5" />
                }
              </button>

              {/* Edit */}
              <Link
                href={`/admin/blog/edit/${post.id}`}
                className="p-2 rounded-lg bg-[#0a0a0a] border border-[#161616] text-[#888] hover:text-white hover:border-[#222] transition-all duration-150"
                title="Edit Artikel"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Link>

              {/* Delete */}
              <button
                onClick={() => handleDelete(post.id, post.title)}
                disabled={isPending && deletingId === post.id}
                title="Hapus Artikel"
                className="p-2 rounded-lg bg-[#0a0a0a] border border-[#161616] text-[#666] hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all duration-150"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
