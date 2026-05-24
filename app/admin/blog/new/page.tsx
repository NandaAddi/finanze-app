import { requireAdmin } from '@/lib/admin-auth';
import { BlogPostForm } from '@/components/admin/blog-post-form';

export default async function NewBlogPostPage() {
  await requireAdmin();

  return (
    <div className="p-8 flex-1">
      <div className="mb-8">
        <h1 className="font-lora text-3xl font-bold text-white">Tulis Artikel Baru</h1>
        <p className="text-sm text-[#666] mt-1">
          Artikel akan tersimpan sebagai Draft sebelum Anda mempublikasikannya.
        </p>
      </div>
      <BlogPostForm mode="create" />
    </div>
  );
}
