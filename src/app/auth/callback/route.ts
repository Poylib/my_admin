import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const requestUrl = new URL(request.url);

  // 에러 파라미터 확인
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // 데이터베이스 에러(허용되지 않은 이메일)인 경우
  if (
    error === 'server_error' &&
    errorDescription?.includes('Database error saving new user')
  ) {
    // 로그인 페이지로 리다이렉트하면서 에러 메시지 전달
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', '허용된 이메일로만 접근할 수 있습니다.');
    return NextResponse.redirect(loginUrl);
  }

  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
      } else {
        return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
      }
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
