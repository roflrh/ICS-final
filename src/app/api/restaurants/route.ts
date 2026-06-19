import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let restaurants;

    if (category && category !== '전체') {
      restaurants = await db.restaurant.findMany({
        where: {
          category: category,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } else {
      restaurants = await db.restaurant.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    }

    return NextResponse.json({ restaurants }, { status: 200 });
  } catch (error: any) {
    console.error('식당 목록 조회 중 에러 발생:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
