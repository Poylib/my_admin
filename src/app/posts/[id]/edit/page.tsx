import { EditPostForm } from '@/components/posts/EditPostForm';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: { id: string };
};

export default async function EditPostPage({ params }: Props) {
  const supabase = await createClient();
  // 게시글과 태그 정보를 함께 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(
      `
      *,
      post_tags (
        tags (
          name
        )
      )
    `,
    )
    .eq('id', params.id)
    .single();

  if (postError) {
    return <div>게시글을 불러오는 중 오류가 발생했습니다.</div>;
  }

  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  // post_tags 관계를 통해 가져온 태그 이름들을 배열로 변환
  const tags = post.post_tags?.map((pt: any) => pt.tags.name) || [];

  // EditPostForm에 전달할 데이터 구성
  const postWithTags = {
    id: post.id,
    title: post.title,
    content: post.content,
    thumbnail_url: post.thumbnail_url,
    is_published: post.is_published,
    tags: tags,
  };

  return (
    <div className="container mx-auto py-6">
      <EditPostForm post={postWithTags} />
    </div>
  );
}
