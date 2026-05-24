'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createBlogPost, updateBlogPost } from '@/app/actions/admin';
import { BlogPost } from '@/lib/types/admin';
import { Save, Loader2, Eye } from 'lucide-react';

// ──────────────────────────────────────────────
// Validation Schema
// ──────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(120, 'Judul terlalu panjang'),
  slug: z
    .string()
    .min(3, 'Slug minimal 3 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  excerpt: z.string().min(10, 'Ringkasan minimal 10 karakter').max(300, 'Terlalu panjang'),
  meta_description: z.string().min(10).max(160, 'Meta deskripsi max 160 karakter'),
  category: z.string().min(1, 'Pilih kategori'),
  read_time: z.string().min(1),
  author: z.string().min(1),
  content: z.string().min(20, 'Konten minimal 20 karakter'),
  is_published: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  'Tips Keuangan', 'Perencanaan Finansial', 'Tabungan & Investasi',
  'Manajemen Utang', 'Berita Finansial', 'Lainnya',
];

// ──────────────────────────────────────────────
// Form Component
// ──────────────────────────────────────────────
interface Props {
  mode: 'create' | 'edit';
  post?: BlogPost;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-[#f5f5f5] text-sm placeholder:text-[#444] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans';

const labelClass = 'block text-xs font-semibold text-[#888] mb-1.5 uppercase tracking-wider';

export function BlogPostForm({ mode, post }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      meta_description: post?.meta_description ?? '',
      category: post?.category ?? 'Tips Keuangan',
      read_time: post?.read_time ?? '3 menit baca',
      author: post?.author ?? 'Tim Finanze',
      content: post?.content ?? '',
      is_published: post?.is_published ?? false,
    },
  });

  const titleValue = watch('title');
  const metaLength = watch('meta_description')?.length ?? 0;
  const isPublished = watch('is_published');

  // Auto-generate slug from title
  const generateSlug = () => {
    const slug = titleValue
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setValue('slug', slug);
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        if (mode === 'create') {
          await createBlogPost({
            ...data,
            published_at: new Date().toISOString(),
          });
        } else if (post) {
          await updateBlogPost(post.id, data);
        }
        router.push('/admin/blog');
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">

      {/* Grid: Title + Meta */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Title */}
        <div className="xl:col-span-2">
          <label className={labelClass}>Judul Artikel *</label>
          <input
            {...register('title')}
            placeholder="Contoh: 5 Cara Mengatur Keuangan Pribadi dengan Gaji UMR"
            className={inputClass}
          />
          {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className={labelClass}>Slug URL *</label>
          <div className="flex gap-2">
            <input
              {...register('slug')}
              placeholder="contoh-slug-artikel"
              className={inputClass}
            />
            <button
              type="button"
              onClick={generateSlug}
              className="shrink-0 px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-xs text-[#888] hover:text-white hover:border-[#333] transition-colors"
            >
              Auto
            </button>
          </div>
          {errors.slug && <p className="text-rose-400 text-xs mt-1">{errors.slug.message}</p>}
          <p className="text-[10px] text-[#444] mt-1 font-mono">/blog/{watch('slug') || 'slug-artikel'}</p>
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Kategori *</label>
          <select {...register('category')} className={inputClass}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div className="xl:col-span-2">
          <label className={labelClass}>Ringkasan / Excerpt *</label>
          <textarea
            {...register('excerpt')}
            rows={2}
            placeholder="Deskripsi singkat artikel yang muncul di kartu halaman blog..."
            className={inputClass + ' resize-none'}
          />
          {errors.excerpt && <p className="text-rose-400 text-xs mt-1">{errors.excerpt.message}</p>}
        </div>

        {/* Meta Description */}
        <div className="xl:col-span-2">
          <label className={labelClass}>
            SEO Meta Description *
            <span className={`ml-2 font-normal normal-case text-[10px] ${metaLength > 160 ? 'text-rose-400' : 'text-[#555]'}`}>
              {metaLength}/160
            </span>
          </label>
          <textarea
            {...register('meta_description')}
            rows={2}
            placeholder="Deskripsi yang muncul di hasil pencarian Google (max 160 karakter)..."
            className={inputClass + ' resize-none'}
          />
          {errors.meta_description && <p className="text-rose-400 text-xs mt-1">{errors.meta_description.message}</p>}
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <label className={labelClass}>Konten Artikel (Markdown) *</label>
        <textarea
          {...register('content')}
          rows={20}
          placeholder={`### Heading 3\n\nTuliskan isi artikel Anda di sini menggunakan Markdown...\n\n**teks tebal** dan *teks miring*\n\n* Poin daftar 1\n* Poin daftar 2`}
          className={inputClass + ' resize-y font-mono text-xs leading-relaxed'}
        />
        {errors.content && <p className="text-rose-400 text-xs mt-1">{errors.content.message}</p>}
        <p className="text-[10px] text-[#444] mt-1">
          Gunakan ### untuk Heading, **teks** untuk tebal, * untuk daftar poin.
        </p>
      </div>

      {/* Misc row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Estimasi Baca</label>
          <input {...register('read_time')} placeholder="3 menit baca" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Penulis</label>
          <input {...register('author')} placeholder="Tim Finanze" className={inputClass} />
        </div>
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#222] transition-colors">
            <input
              type="checkbox"
              {...register('is_published')}
              className="w-4 h-4 accent-emerald-500"
            />
            <div>
              <span className="text-sm font-medium text-white block">
                {isPublished ? '🟢 Publikasikan' : '⚫ Simpan sebagai Draft'}
              </span>
              <span className="text-[10px] text-[#555]">
                {isPublished ? 'Terlihat di halaman publik' : 'Tidak terlihat di publik'}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#040404] font-semibold text-sm rounded-full transition-all duration-200"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? 'Menyimpan...' : mode === 'create' ? 'Simpan Artikel' : 'Perbarui Artikel'}
        </button>

        {post?.is_published && (
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#1a1a1a] text-sm text-[#888] hover:text-white hover:border-[#333] transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Lihat Live
          </a>
        )}

        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="px-4 py-2.5 rounded-full border border-[#1a1a1a] text-sm text-[#888] hover:text-white hover:border-[#333] transition-all"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
