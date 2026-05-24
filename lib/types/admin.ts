// Types yang reflect tabel blog_posts di Supabase
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_description: string;
  category: string;
  read_time: string;
  author: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export type BlogPostInsert = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;
export type BlogPostUpdate = Partial<BlogPostInsert>;

// Admin analytics types
export interface AdminStats {
  totalUsers: number;
  activeUsers7d: number;
  totalTransactions: number;
  totalAiQueries: number;
}

export interface UserGrowthPoint {
  date: string;
  count: number;
}

export interface RecentUser {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
}
