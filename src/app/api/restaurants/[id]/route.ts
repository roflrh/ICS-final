export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 버전 호환을 위해 params를 await 처리합니다.
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: '식당 ID가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const restaurant = await db.restaurant.findUnique({
      where: { id },
      include: {
        menus: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: '해당 식당을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ restaurant }, { status: 200 });
  } catch (error: any) {
    console.error('식당 상세 조회 중 에러 발생:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
