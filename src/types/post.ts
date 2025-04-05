export interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  view_count: number;
  is_published: boolean;
  slug: string;
}

export interface PostFormData {
  title_ko: string;
  title_en?: string;
  content_ko: string;
  content_en?: string;
  thumbnail_url: string;
  is_published: boolean;
  tags: string[];
  has_translation: boolean;
}
