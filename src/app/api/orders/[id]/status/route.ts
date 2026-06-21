import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from 'src/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // 1. JWT 비밀키 설정 검증
    if (!JWT_SECRET) {
      console.error('보안 에러: JWT_SECRET 환경변수가 정의되지 않았습니다.');
      return NextResponse.json(
        { error: '서버 내부 구성 요건이 충족되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 2. 인증 토큰 검사 (httpOnly 쿠키 획득)
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 부재합니다. 로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 3. 토큰 복호화 및 세션 만료 확인
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: '세션이 만료되었거나 유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { status } = await req.json();

    const allowedStatuses = ['PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: '올바른 주문 상태(status)가 아닙니다.' },
        { status: 400 }
      );
    }

    // 4. 데이터베이스 업데이트
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status,
      },
    });

    return NextResponse.json(
      {
        message: '주문 상태가 업데이트되었습니다.',
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('주문 상태 업데이트 중 에러 발생:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
