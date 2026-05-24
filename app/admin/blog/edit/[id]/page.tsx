import { requireAdmin } from '@/lib/admin-auth';
import { getBlogPostById } from '@/app/actions/admin';
import { BlogPostForm } from '@/components/admin/blog-post-form';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) notFound();

  return (
    <div className="p-8 flex-1">
      <div className="mb-8">
        <h1 className="font-lora text-3xl font-bold text-white">Edit Artikel</h1>
        <p className="text-sm text-[#666] mt-1 font-mono">/blog/{post.slug}</p>
      </div>
      <BlogPostForm mode="edit" post={post} />
    </div>
  );
}
