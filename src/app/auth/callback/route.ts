import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      // 인증 코드를 세션으로 교환
      const { data: exchangeData, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      console.log('🚀 ~ GET ~ exchangeData:', exchangeData);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        throw exchangeError;
      }

      console.log('Exchange response:', exchangeData);

      // 세션이 설정될 때까지 짧게 대기
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 응답 생성
      const response = NextResponse.redirect(
        new URL(redirectTo, requestUrl.origin),
      );

      // 세션 데이터 확인
      if (exchangeData.session) {
        // 세션 쿠키 설정
        response.cookies.set(
          'sb-access-token',
          exchangeData.session.access_token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1주일
          },
        );

        // 리프레시 토큰 쿠키 설정
        response.cookies.set(
          'sb-refresh-token',
          exchangeData.session.refresh_token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1주일
          },
        );
      }

      return response;
    } catch (error) {
      console.error('Error in callback:', error);
      return NextResponse.redirect(new URL('/login', requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
