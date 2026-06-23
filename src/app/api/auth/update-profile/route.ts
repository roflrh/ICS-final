import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

    const { name, currentPassword, newPassword } = await req.json();

    // 1. 수정할 사용자 정보 조회
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // 2. 이름 변경 처리
    if (name && name.trim() !== '') {
      updateData.name = name.trim();
    }

    // 3. 비밀번호 변경 처리
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: '비밀번호를 변경하려면 현재 비밀번호를 입력해야 합니다.' },
          { status: 400 }
        );
      }

      // 현재 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '현재 비밀번호가 일치하지 않습니다.' },
          { status: 400 }
        );
      }

      // 새 비밀번호 유효성 검사 (최소 6자)
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: '새 비밀번호는 최소 6자 이상이어야 합니다.' },
          { status: 400 }
        );
      }

      // 비밀번호 해싱
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    // 변경할 내용이 아예 없는 경우
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '변경할 정보를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 4. DB 업데이트
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // 5. 쿠키의 JWT 토큰도 최신 name 정보로 재발행
    const newToken = jwt.sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        message: '회원정보가 성공적으로 수정되었습니다.',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        },
      },
      { status: 200 }
    );

    // 쿠키 설정
    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('회원정보 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
