import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // 로그인이 필요한 보호된 페이지 리스트
  const protectedPaths = ['/orders', '/cart'];
  
  // 로그인 상태에서 접근할 필요가 없는 인증 페이지 리스트
  const authPaths = ['/login', '/register'];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // 1. 비로그인 유저가 보호된 경로에 접근하려고 할 때
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    // 로그인 완료 후 기존에 가려던 페이지로 이동하기 위한 redirect 쿼리스트링 전달
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 2. 이미 로그인한 유저가 로그인/회원가입 페이지에 접근하려고 할 때
  if (isAuthPath && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 프록시를 실행할 경로 매처(Matcher) 설정
export const config = {
  matcher: [
    '/orders/:path*',
    '/cart/:path*',
    '/login',
    '/register',
  ],
};
