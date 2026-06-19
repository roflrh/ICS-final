import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { message: '로그아웃 되었습니다.' },
    { status: 200 }
  );

  // token 쿠키 만료 처리
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0), // 즉시 만료
    path: '/',
  });

  return response;
}
