'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LoginContent() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirectTo') || '/';
      router.push(redirectTo);
    }
  }, [user, router, searchParams]);

  const handleSignIn = async () => {
    const redirectTo = searchParams.get('redirectTo') || '/';
    await signInWithGoogle(redirectTo);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          관리자 로그인
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-gray-600">
            구글 계정으로 로그인하여 관리자 페이지에 접근하세요.
          </p>
          <Button onClick={handleSignIn} className="w-full">
            구글로 로그인
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>로딩 중...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
