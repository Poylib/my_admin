export interface Post {
  id: string;
  title_ko: string;
  title_en: string | null;
  content_ko: string;
  content_en: string | null;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  view_count: number;
  is_published: boolean;
  slug: string;
  has_translation: boolean;
}

export interface PostFormData {
  title_ko: string;
  title_en: string | null;
  content_ko: string;
  content_en: string | null;
  thumbnail_url: string;
  is_published: boolean;
  tags: string[];
  has_translation: boolean;
}

// 태그 인터페이스 추가
export interface Tag {
  id: string;
  name_ko: string;
  name_en: string | null;
  slug: string;
  created_at: string;
}
