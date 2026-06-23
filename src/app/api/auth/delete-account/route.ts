import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from 'src/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!JWT_SECRET) {
      console.error('보안 에러: JWT_SECRET 환경변수가 정의되지 않았습니다.');
      return NextResponse.json(
        { error: '서버 내부 구성 요건이 충족되지 않았습니다.' },
        { status: 500 }
      );
    }

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 세션입니다.' },
        { status: 401 }
      );
    }

    // 1. 유저 조회
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. DB에서 유저 삭제
    // Prisma Schema의 'onDelete: Cascade' 덕분에 이 유저가 생성한 주문 및 주문 상세 내역도 함께 안전하게 자동 소거됩니다.
    await db.user.delete({
      where: { id: user.id },
    });

    // 3. 응답 인스턴스 생성 및 쿠키 소거
    const response = NextResponse.json(
      { message: '회원탈퇴가 성공적으로 처리되었습니다. 이용해주셔서 감사합니다.' },
      { status: 200 }
    );

    // token 쿠키 즉시 만료 처리
    response.cookies.set('token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('회원탈퇴 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
