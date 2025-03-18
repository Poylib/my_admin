export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          thumbnail_url: string;
          created_at?: string;
          updated_at?: string;
          author_id: string;
          view_count?: number;
          is_published?: boolean;
          slug: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          thumbnail_url?: string;
          created_at?: string;
          updated_at?: string;
          author_id?: string;
          view_count?: number;
          is_published?: boolean;
          slug?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
      };
      post_images: {
        Row: {
          id: string;
          post_id: string;
          image_url: string;
          caption: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          image_url: string;
          caption?: string | null;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          image_url?: string;
          caption?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      social_links: {
        Row: {
          id: string;
          platform: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          platform?: string;
          url?: string;
          created_at?: string;
        };
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
