import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">블로그 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/posts"
            className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">게시글 관리</h3>
            <p className="text-gray-600">게시글 작성, 수정, 삭제</p>
          </Link>
          <Link
            href="/tags"
            className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">태그 관리</h3>
            <p className="text-gray-600">태그 생성 및 관리</p>
          </Link>
          <Link
            href="/social-links"
            className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h3 className="text-lg font-semibold mb-2">SNS 링크</h3>
            <p className="text-gray-600">SNS 계정 링크 관리</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
