import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  // console.log('🚀 ~ middleware ~ session:', session);

  // if (!session) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}
