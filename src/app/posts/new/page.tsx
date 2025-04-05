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
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title_ko: '',
    title_en: '',
    content_ko: '',
    content_en: '',
    thumbnail_url: '',
    is_published: true,
    tags: [],
    has_translation: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const slug =
        formData.title_en ||
        formData.title_ko
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
          title_ko: formData.title_ko,
          title_en: formData.title_en || null,
          content_ko: formData.content_ko,
          content_en: formData.content_en || null,
          thumbnail_url: formData.thumbnail_url,
          is_published: formData.is_published,
          slug,
          author_id: user.id,
          view_count: 0,
          has_translation: formData.has_translation,
        })
        .select()
        .single();

      if (postError) throw postError;

      // 2. 태그 처리 (태그가 있는 경우에만)
      if (formData.tags && formData.tags.length > 0) {
        // 2-1. 태그 생성 또는 업데이트
        const { error: tagsError } = await supabase.from('tags').upsert(
          formData.tags.map((name) => ({
            name_ko: name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          })),
          { onConflict: 'name_ko' },
        );

        if (tagsError) throw tagsError;

        // 2-2. 생성된 태그의 ID 조회
        const { data: tagData, error: tagSelectError } = await supabase
          .from('tags')
          .select('id, name_ko')
          .in('name_ko', formData.tags);

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
      toast.error('게시글 작성 중 오류가 발생했습니다.');
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

  const handleTranslate = async () => {
    if (!formData.title_ko || !formData.content_ko) {
      toast.error('번역 실패', {
        description: '한국어 제목과 내용을 먼저 입력해주세요.',
      });
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title_ko,
          content: formData.content_ko,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '번역 중 오류가 발생했습니다.');
      }

      setFormData((prev) => ({
        ...prev,
        title_en: data.title,
        content_en: data.content,
        has_translation: true,
      }));

      toast.success('번역 완료', {
        description: '영어 번역이 완료되었습니다.',
      });
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error('번역 실패', {
        description: error.message || '알 수 없는 오류가 발생했습니다.',
      });
    } finally {
      setIsTranslating(false);
    }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 한국어 섹션 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">한국어</h3>
                  <Button
                    type="button"
                    onClick={handleTranslate}
                    disabled={
                      isTranslating ||
                      !formData.title_ko ||
                      !formData.content_ko
                    }
                    size="sm"
                    variant="outline"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        번역 중...
                      </>
                    ) : (
                      'AI로 영어 번역하기'
                    )}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_ko">제목 (한국어)</Label>
                  <Input
                    id="title_ko"
                    name="title_ko"
                    value={formData.title_ko}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>내용 (한국어)</Label>
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
                </div>
              </div>

              {/* 영어 섹션 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">English</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_translation"
                      checked={formData.has_translation}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          has_translation: checked === true,
                        }))
                      }
                    />
                    <Label htmlFor="has_translation">영어 번역 포함</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_en">Title (English)</Label>
                  <Input
                    id="title_en"
                    name="title_en"
                    value={formData.title_en}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content (English)</Label>
                  <div data-color-mode="light">
                    <MDEditor
                      value={formData.content_en}
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
                </div>
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
