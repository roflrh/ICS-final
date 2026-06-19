import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from 'src/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-delivery-app-12345';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    // 1. 토큰 존재 여부 확인
    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 2. 토큰 검증 및 복호화
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 세션입니다.' },
        { status: 401 }
      );
    }

    // 3. 데이터베이스 유저 조회
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: '존재하지 않는 유저입니다.' },
        { status: 401 }
      );
    }

    // 4. 정보 반환 (비밀번호 제외)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('세션 확인 중 에러 발생:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
