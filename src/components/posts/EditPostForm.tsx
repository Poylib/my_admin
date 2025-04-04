'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostFormData } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TagInput } from '@/components/posts/TagInput';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

type EditPostFormProps = {
  post: {
    id: string;
    title: string;
    content: string;
    thumbnail_url: string;
    is_published: boolean;
    tags: string[];
  };
};

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: post.title,
    content: post.content,
    thumbnail_url: post.thumbnail_url,
    is_published: post.is_published,
    tags: post.tags || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error: postError } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          content: formData.content,
          thumbnail_url: formData.thumbnail_url,
          is_published: formData.is_published,
          slug,
        })
        .eq('id', post.id);

      if (postError) throw postError;

      const { error: deleteError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', post.id);

      if (deleteError) throw deleteError;

      if (formData.tags.length > 0) {
        const { error: tagsError } = await supabase.from('tags').upsert(
          formData.tags.map((name) => ({
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          })),
          { onConflict: 'name' },
        );

        if (tagsError) throw tagsError;

        const { data: tagData, error: tagSelectError } = await supabase
          .from('tags')
          .select('id')
          .in('name', formData.tags);

        if (tagSelectError) throw tagSelectError;

        const { error: postTagsError } = await supabase
          .from('post_tags')
          .insert(
            tagData.map((tag) => ({
              post_id: post.id,
              tag_id: tag.id,
            })),
          );

        if (postTagsError) throw postTagsError;
      }

      router.push('/posts');
      router.refresh();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">게시글 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">썸네일 URL</Label>
            <Input
              type="url"
              id="thumbnail_url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>내용</Label>
            <div data-color-mode="light">
              <MDEditor
                value={formData.content}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, content: value || '' }))
                }
                height={400}
                preview="edit"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>태그</Label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  is_published: checked === true,
                }))
              }
            />
            <Label htmlFor="is_published">발행</Label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
