import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/utils/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://finanze.web.id';

  const staticRoutes = ['', '/privacy-policy', '/terms-of-service', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/blog' ? 0.8 : 0.5,
  }));

  // Fetch only published blog posts from Supabase
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('slug, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const blogRoutes = (posts ?? []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.published_at,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
