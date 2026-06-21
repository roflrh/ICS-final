import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from 'src/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

// JWT 검증 및 유저 정보 추출 헬퍼 함수
async function getAuthenticatedUser(req: NextRequest) {
  if (!JWT_SECRET) {
    console.error('보안 에러: JWT_SECRET 환경변수가 정의되지 않았습니다.');
    return null;
  }
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

// 1. 내 주문 내역 조회 (GET)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 유저의 주문 내역을 조회하되 주문 아이템과 해당 메뉴 정보까지 함께 가져옴
    const orders = await db.order.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        orderItems: {
          include: {
            menu: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // 최근 주문순
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('주문 내역 조회 중 에러 발생:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 2. 주문하기 (POST)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { items, address, totalPrice } = await req.json();

    // 유효성 검사
    if (!address) {
      return NextResponse.json(
        { error: '배송 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '장바구니가 비어 있습니다.' },
        { status: 400 }
      );
    }

    // Prisma 트랜잭션을 통해 주문 및 주문상세 동시 생성
    const newOrder = await db.$transaction(async (tx) => {
      // 1) 주문 테이블에 레코드 생성
      const order = await tx.order.create({
        data: {
          userId: user.userId,
          address,
          totalPrice,
          status: 'PENDING', // 최초 주문은 'PENDING' (접수대기) 상태
        },
      });

      // 2) 주문상세 테이블에 각 아이템 생성
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuId: item.menuId,
            quantity: item.quantity,
            price: item.price, // 주문 당시 가격을 보존
          },
        });
      }

      return order;
    });

    return NextResponse.json(
      {
        message: '주문이 성공적으로 접수되었습니다.',
        orderId: newOrder.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('주문 처리 중 에러 발생:', error);
    return NextResponse.json(
      { error: '주문 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
