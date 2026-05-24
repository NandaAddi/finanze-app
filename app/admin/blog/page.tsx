import { requireAdmin } from '@/lib/admin-auth';
import { getAllBlogPosts } from '@/app/actions/admin';
import Link from 'next/link';
import { BlogCmsClient } from '@/components/admin/blog-cms-client';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await getAllBlogPosts();

  return (
    <div className="p-8 flex-1">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-lora text-3xl font-bold text-white">Blog CMS</h1>
          <p className="text-sm text-[#666] mt-1">
            Kelola artikel blog yang tampil di halaman publik.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#040404] font-semibold text-sm rounded-full transition-all duration-200 flex items-center gap-2"
        >
          + Tulis Artikel Baru
        </Link>
      </div>

      <BlogCmsClient posts={posts} />
    </div>
  );
}
