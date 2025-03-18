import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">블로그 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <Link
                  href="/posts"
                  className="block space-y-2 hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-lg font-semibold">게시글 관리</h3>
                  <p className="text-muted-foreground">
                    게시글 작성, 수정, 삭제
                  </p>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Link
                  href="/tags"
                  className="block space-y-2 hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-lg font-semibold">태그 관리</h3>
                  <p className="text-muted-foreground">태그 생성 및 관리</p>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Link
                  href="/social-links"
                  className="block space-y-2 hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-lg font-semibold">SNS 링크</h3>
                  <p className="text-muted-foreground">SNS 계정 링크 관리</p>
                </Link>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
