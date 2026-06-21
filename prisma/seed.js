require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

async function main() {
  // 기존 데이터 초기화 (Cascade 설정으로 인해 Restaurant 삭제 시 Menu 등 연쇄 삭제됨)
  console.log('Cleaning up database...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding restaurants and menus...');

  // 1. 마포 삼겹살 본점
  await prisma.restaurant.create({
    data: {
      name: '마포 삼겹살 본점',
      description: '숯불향 가득한 초벌 생삼겹살 전문점입니다.',
      category: '한식',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
      menus: {
        create: [
          {
            name: '초벌 생삼겹살 (180g)',
            description: '숙성된 국내산 생삼겹살을 숯불에 초벌구이하여 제공합니다.',
            price: 16000,
            imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '꽃목살 (180g)',
            description: '육즙이 풍부하고 쫄깃한 식감의 특수 부위 목살입니다.',
            price: 16000,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '차돌된장찌개',
            description: '고소한 차돌박이와 구수한 재래된장으로 깊은 맛을 낸 찌개입니다.',
            price: 8000,
            imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 2. 경리단길 파스타 빌라
  await prisma.restaurant.create({
    data: {
      name: '경리단길 파스타 빌라',
      description: '이탈리아 정통 레시피로 요리하는 아늑한 분위기의 가정식 파스타 전문점.',
      category: '양식',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=60',
      menus: {
        create: [
          {
            name: '클래식 까르보나라',
            description: '생크림 없이 노른자와 페코리노 치즈, 관찰레로 풍미를 낸 정통 로마식 파스타.',
            price: 15000,
            imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '쉬림프 바질 페스토 파스타',
            description: '향긋한 생바질 페스토에 통통한 새우를 곁들인 링귀니 파스타.',
            price: 17000,
            imageUrl: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '마르게리따 피자',
            description: '수제 도우 위에 토마토 소스, 생 모짜렐라 치즈, 생바질을 올려 화덕에 구운 피자.',
            price: 19000,
            imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 3. 동교동 타이키친
  await prisma.restaurant.create({
    data: {
      name: '동교동 타이키친',
      description: '태국 방콕 현지 길거리 감성을 가득 담은 로컬 푸드 레스토랑.',
      category: '아시안',
      imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=60',
      menus: {
        create: [
          {
            name: '소고기 쌀국수 (꾸웨이띠오)',
            description: '장시간 우려낸 태국식 약재 육수에 야들야들한 소고기를 듬뿍 얹은 쌀국수.',
            price: 11000,
            imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '쉬림프 팟타이',
            description: '타마린드 소스로 새콤달콤하게 볶아낸 태국 대표 볶음 쌀국수.',
            price: 12500,
            imageUrl: 'https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '푸팟퐁커리 (M)',
            description: '바삭하게 튀긴 소프트쉘 크랩을 부드러운 옐로우 커리 소스에 볶아낸 최고 인기 요리.',
            price: 28000,
            imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
