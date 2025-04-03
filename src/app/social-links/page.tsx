'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  created_at: string;
}

export default function SocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('platform');

    if (error) {
      console.error('Error fetching social links:', error);
      return;
    }

    setLinks(data || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform.trim() || !newUrl.trim()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('social_links').insert({
        platform: newPlatform.trim(),
        url: newUrl.trim(),
      });

      if (error) throw error;

      setNewPlatform('');
      setNewUrl('');
      fetchLinks();
    } catch (error) {
      console.error('Error creating social link:', error);
      alert('SNS 링크 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchLinks();
    } catch (error) {
      console.error('Error deleting social link:', error);
      alert('SNS 링크 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SNS 링크 관리</h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="platform"
                className="block text-sm font-medium text-gray-700"
              >
                플랫폼
              </label>
              <input
                type="text"
                id="platform"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                placeholder="예: Twitter, GitHub"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700"
              >
                URL
              </label>
              <input
                type="url"
                id="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? '추가 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                플랫폼
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                추가일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {link.platform}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    {link.url}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(link.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
