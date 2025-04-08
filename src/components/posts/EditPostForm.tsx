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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

type EditPostFormProps = {
  post: {
    id: string;
    title_ko: string;
    title_en: string | null;
    content_ko: string;
    content_en: string | null;
    thumbnail_url: string;
    is_published: boolean;
    tags: string[];
    has_translation: boolean;
  };
};

export function EditPostForm({ post }: EditPostFormProps) {
  console.log('🚀 ~ EditPostForm ~ post:', post);
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title_ko: post.title_ko,
    title_en: post.title_en || '',
    content_ko: post.content_ko,
    content_en: post.content_en || '',
    thumbnail_url: post.thumbnail_url,
    is_published: post.is_published,
    tags: post.tags || [],
    has_translation: post.has_translation,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 한국어 제목으로 슬러그 생성
      const slug = formData.title_ko
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // 번역 여부 확인 (영어 제목과 내용이 모두 있는 경우)
      const has_translation = Boolean(formData.title_en && formData.content_en);

      const { error: postError } = await supabase
        .from('posts')
        .update({
          title_ko: formData.title_ko,
          title_en: formData.title_en || null,
          content_ko: formData.content_ko,
          content_en: formData.content_en || null,
          thumbnail_url: formData.thumbnail_url,
          is_published: formData.is_published,
          slug,
          has_translation,
        })
        .eq('id', post.id);

      if (postError) throw postError;

      const { error: deleteError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', post.id);

      if (deleteError) throw deleteError;

      if (formData.tags.length > 0) {
        // 태그 처리 로직 수정
        const tagPromises = formData.tags.map(async (tagName) => {
          // 먼저 태그가 존재하는지 확인
          const { data: existingTag, error: findError } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

          if (findError && findError.code !== 'PGRST116') {
            throw findError;
          }

          if (existingTag) {
            // 태그가 이미 존재하면 해당 ID 반환
            return existingTag.id;
          } else {
            // 태그가 없으면 새로 생성
            const { data: newTag, error: insertError } = await supabase
              .from('tags')
              .insert({
                name: tagName,
                slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              })
              .select('id')
              .single();

            if (insertError) throw insertError;
            return newTag.id;
          }
        });

        // 모든 태그 처리 완료 대기
        const tagIds = await Promise.all(tagPromises);

        // post_tags 테이블에 연결
        const { error: postTagsError } = await supabase
          .from('post_tags')
          .insert(
            tagIds.map((tagId) => ({
              post_id: post.id,
              tag_id: tagId,
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
            <Label htmlFor="title_ko">한국어 제목</Label>
            <Input
              id="title_ko"
              name="title_ko"
              value={formData.title_ko}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_en">영어 제목</Label>
            <Input
              id="title_en"
              name="title_en"
              value={formData.title_en || ''}
              onChange={handleChange}
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

          <Tabs defaultValue="ko" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ko">한국어 내용</TabsTrigger>
              <TabsTrigger value="en">영어 내용</TabsTrigger>
            </TabsList>
            <TabsContent value="ko">
              <div data-color-mode="light">
                <MDEditor
                  value={formData.content_ko}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      content_ko: value || '',
                    }))
                  }
                  height={400}
                  preview="edit"
                />
              </div>
            </TabsContent>
            <TabsContent value="en">
              <div data-color-mode="light">
                <MDEditor
                  value={formData.content_en || ''}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      content_en: value || '',
                    }))
                  }
                  height={400}
                  preview="edit"
                />
              </div>
            </TabsContent>
          </Tabs>

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
