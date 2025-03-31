import { cookies } from 'next/headers';
import { EditPostForm } from '@/components/posts/EditPostForm';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return <div>게시글을 불러오는 중 오류가 발생했습니다.</div>;
  }

  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <EditPostForm post={post} />
    </div>
  );
}
