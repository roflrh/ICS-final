import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
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
