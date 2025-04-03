'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PostFormData } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { TagInput } from '@/components/posts/TagInput';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    thumbnail_url: '',
    is_published: true,
    tags: [],
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 1. 게시글 생성
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          content: formData.content,
          thumbnail_url: formData.thumbnail_url,
          is_published: formData.is_published,
          slug,
          author_id: user.id,
          view_count: 0,
        })
        .select()
        .single();

      if (postError) throw postError;

      // 2. 태그 처리 (태그가 있는 경우에만)
      if (formData.tags && formData.tags.length > 0) {
        // 2-1. 태그 생성 또는 업데이트
        const { error: tagsError } = await supabase.from('tags').upsert(
          formData.tags.map((name) => ({
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          })),
          { onConflict: 'name' },
        );

        if (tagsError) throw tagsError;

        // 2-2. 생성된 태그의 ID 조회
        const { data: tagData, error: tagSelectError } = await supabase
          .from('tags')
          .select('id, name')
          .in('name', formData.tags);

        if (tagSelectError) throw tagSelectError;

        // 2-3. post_tags 관계 테이블에 데이터 삽입
        if (tagData && tagData.length > 0) {
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
      }

      router.push('/posts');
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('게시글 작성 중 오류가 발생했습니다.');
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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">새 게시글 작성</CardTitle>
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
              <Label htmlFor="is_published">즉시 발행</Label>
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
    </div>
  );
}
