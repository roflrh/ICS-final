require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

async function main() {
  // 기존 데이터 초기화
  console.log('Cleaning up database...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Haeundae local restaurants and menus...');

  // 1. 해운대 삼겹살 본점 (한식, 한집배달 제공)
  await prisma.restaurant.create({
    data: {
      name: '해운대 삼겹살 본점',
      description: '숯불향 가득한 초벌 생삼겹살 전문점입니다.',
      category: '한식',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
      rating: 4.8,
      reviewCount: 142,
      deliveryTimeMin: 25,
      deliveryTimeMax: 35,
      isFastDelivery: true,
      menus: {
        create: [
          {
            name: '초벌 생삼겹살 (180g)',
            description: '숙성된 국내산 생삼겹살을 숯불에 초벌구이하여 제공합니다.',
            price: 16000,
            imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
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

  // 2. 달맞이길 파스타 빌라 (양식)
  await prisma.restaurant.create({
    data: {
      name: '달맞이길 파스타 빌라',
      description: '이탈리아 정통 레시피로 요리하는 아늑한 분위기의 가정식 파스타 전문점.',
      category: '양식',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=60',
      rating: 4.9,
      reviewCount: 98,
      deliveryTimeMin: 30,
      deliveryTimeMax: 45,
      isFastDelivery: false,
      menus: {
        create: [
          {
            name: '클래식 까르보나라',
            description: '생크림 없이 노른자와 페코리노 치즈, 관찰레로 풍미를 낸 정통 로마식 파스타.',
            price: 15000,
            imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
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

  // 3. 센텀시티 타이키친 (아시안)
  await prisma.restaurant.create({
    data: {
      name: '센텀시티 타이키친',
      description: '태국 방콕 현지 길거리 감성을 가득 담은 로컬 푸드 레스토랑.',
      category: '아시안',
      imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=60',
      rating: 4.7,
      reviewCount: 83,
      deliveryTimeMin: 20,
      deliveryTimeMax: 30,
      isFastDelivery: true,
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
            isPopular: true,
          },
        ],
      },
    },
  });

  // 4. 장산역 돈카츠 하우스 (양식, 한집배달 제공)
  // 오류가 났던 튀김 이미지 주소를 검증된 Unsplash 리소스로 대체
  await prisma.restaurant.create({
    data: {
      name: '장산역 돈카츠 하우스',
      description: '제주산 흑돼지를 엄선하여 24시간 숙성 후 튀겨낸 프리미엄 카츠.',
      category: '양식',
      imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=60',
      rating: 4.9,
      reviewCount: 210,
      deliveryTimeMin: 20,
      deliveryTimeMax: 30,
      isFastDelivery: true,
      menus: {
        create: [
          {
            name: '수제 등심돈카츠',
            description: '두툼한 등심의 육즙을 그대로 살려 튀겨낸 시그니처 카츠.',
            price: 12000,
            imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '치즈듬뿍 돈카츠',
            description: '자연산 모짜렐라 치즈가 듬뿍 들어가 고소함이 일품인 치즈 카츠.',
            price: 14000,
            imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '시원한 냉모밀',
            description: '감칠맛 나는 쯔유 육수에 살얼음이 동동 뜬 시원한 메밀국수.',
            price: 8000,
            imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 5. 해리단길 쌀국수 공방 (아시안, 한집배달 제공)
  await prisma.restaurant.create({
    data: {
      name: '해리단길 쌀국수 공방',
      description: '매일 아침 끓여내는 깊고 담백한 육수의 하노이식 쌀국수 공방.',
      category: '아시안',
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=60',
      rating: 4.6,
      reviewCount: 75,
      deliveryTimeMin: 15,
      deliveryTimeMax: 25,
      isFastDelivery: true,
      menus: {
        create: [
          {
            name: '차돌양지 쌀국수',
            description: '야들야들하게 푹 삶아낸 차돌과 양지가 듬뿍 올라간 대표 쌀국수.',
            price: 10000,
            imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '나시고랭 볶음밥',
            description: '인도네시아 전통 특제 소스로 볶아내 감칠맛과 불향이 가득한 볶음밥.',
            price: 11000,
            imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '바삭 짜조 (4pcs)',
            description: '다진 고기와 채소를 라이스페이퍼에 말아 바삭하게 튀긴 베트남식 만두.',
            price: 5000,
            imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 6. 송정해변 수제버거 조인트 (양식, 한집배달 미제공)
  await prisma.restaurant.create({
    data: {
      name: '송정해변 수제버거 조인트',
      description: '100% 프라임 소고기 패티와 매일 구워내는 고소한 번의 정통 아메리칸 수제버거.',
      category: '양식',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
      rating: 4.8,
      reviewCount: 320,
      deliveryTimeMin: 25,
      deliveryTimeMax: 35,
      isFastDelivery: false,
      menus: {
        create: [
          {
            name: '시그니처 더블치즈버거',
            description: '소고기 패티 2장, 더블 아메리칸 치즈, 특제 하우스 소스가 들어간 육즙 버거.',
            price: 11500,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '베이컨 아보카도 버거',
            description: '신선한 생아보카도 슬라이스와 바삭한 베이컨이 풍성하게 어우러진 버거.',
            price: 13000,
            imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '트러플 감자튀김',
            description: '갓 튀겨낸 감자튀김에 향긋한 트러플 오일과 그라나파다노 치즈를 솔솔 뿌린 사이드.',
            price: 6500,
            imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 7. 마린시티 딤섬 스튜디오 (아시안, 한집배달 제공)
  await prisma.restaurant.create({
    data: {
      name: '마린시티 딤섬 스튜디오',
      description: '홍콩 현지 셰프가 선사하는 다채로운 수제 딤섬과 정통 중화요리.',
      category: '아시안',
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60',
      rating: 4.7,
      reviewCount: 112,
      deliveryTimeMin: 30,
      deliveryTimeMax: 40,
      isFastDelivery: true,
      menus: {
        create: [
          {
            name: '육즙가득 샤오롱바오 (6pcs)',
            description: '얇은 만두피 속에 진하고 뜨거운 육즙이 가득 차 있는 대표 상하이식 만두.',
            price: 8500,
            imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '탱글 새우하가우 (4pcs)',
            description: '반투명한 전분피 속에 통새우가 가득 들어있어 씹는 맛이 예술인 광둥식 딤섬.',
            price: 7500,
            imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '매콤 우육탕면',
            description: '오랜 시간 푹 고아낸 소고기 육수에 얼큰한 비법 다대기를 푼 대만식 탕면.',
            price: 12000,
            imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 8. 해운대 전통시장 닭강정 (한식, 한집배달 미제공)
  await prisma.restaurant.create({
    data: {
      name: '해운대 전통시장 닭강정',
      description: '3대째 내려오는 특제 조청 소스로 버무려 식어도 바삭하고 맛있는 닭강정 명가.',
      category: '한식',
      imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=60',
      rating: 4.8,
      reviewCount: 415,
      deliveryTimeMin: 20,
      deliveryTimeMax: 30,
      isFastDelivery: false,
      menus: {
        create: [
          {
            name: '명가 달콤 닭강정 (대)',
            description: '아이부터 어른까지 누구나 좋아하는 달콤 짭조름한 오리지널 조청 맛.',
            price: 18000,
            imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '명가 매콤 닭강정 (대)',
            description: '청양고추를 넣어 알싸하고 맛있게 매운 중독성 강한 닭강정.',
            price: 18000,
            imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '바삭 똥집튀김',
            description: '쫄깃한 닭똥집을 고소하고 바삭하게 튀겨내어 맥주 안주로 제격인 요리.',
            price: 10000,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 9. 미포항 화덕피자 팩토리 (양식, 한집배달 제공)
  await prisma.restaurant.create({
    data: {
      name: '미포항 화덕피자 팩토리',
      description: '참나무 장작 화덕에서 400도 고온으로 빠르게 구워내 도우가 쫄깃한 나폴리 피자.',
      category: '양식',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60',
      rating: 4.9,
      reviewCount: 180,
      deliveryTimeMin: 30,
      deliveryTimeMax: 45,
      isFastDelivery: true,
      menus: {
        create: [
          {
            name: '더블 디아볼라 피자',
            description: '이탈리안 살라미와 청양고추 가루를 얹어 매콤한 감칠맛이 살아있는 화덕피자.',
            price: 21000,
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '콰트로 포르마지 피자',
            description: '고르곤졸라, 모짜렐라, 끼리크림치즈, 파르메산 4가지 치즈의 묵직한 조화.',
            price: 22000,
            imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '신선한 루꼴라 샐러드',
            description: '와일드 루꼴라에 달콤한 방울토마토와 그라나파다노 치즈를 듬뿍 올린 샐러드.',
            price: 9000,
            imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 10. 벡스코 마라탕 전문점 (아시안, 한집배달 제공)
  await prisma.restaurant.create({
    data: {
      name: '벡스코 마라탕 전문점',
      description: '사골 육수의 깊고 구수한 맛에 매콤한 마라유의 짜릿한 매력을 담은 정통 마라탕.',
      category: '아시안',
      imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=60',
      rating: 4.5,
      reviewCount: 250,
      deliveryTimeMin: 20,
      deliveryTimeMax: 35,
      isFastDelivery: true,
      menus: {
        create: [
          {
            name: '기본 마라탕 (선택형)',
            description: '소고기, 청경채, 목이버섯, 분모자 등 엄선된 신선한 재료가 기본 조합된 마라탕.',
            price: 12000,
            imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '바삭 꿔바로우 (소)',
            description: '국내산 등심에 찹쌀가루를 입혀 튀겨내어 새콤달콤한 소스를 부어 낸 요리.',
            price: 15000,
            imageUrl: 'https://images.unsplash.com/photo-1591814468924-caf7f585327f?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '매콤 마라샹궈',
            description: '다양한 식재료를 센 불에 마라 소스와 함께 빠르게 볶아내어 불맛이 가득한 요리.',
            price: 18000,
            imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 11. 재송동 소곱창 전골집 (한식, 한집배달 미제공)
  // 오류가 났던 전골 이미지 주소를 검증된 사골찌개용 Unsplash 이미지로 대체
  await prisma.restaurant.create({
    data: {
      name: '재송동 소곱창 전골집',
      description: '깨끗하게 손질된 소곱창과 대창을 비법 다대기와 함께 졸여가며 먹는 얼큰 전골.',
      category: '한식',
      imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=60',
      rating: 4.7,
      reviewCount: 195,
      deliveryTimeMin: 25,
      deliveryTimeMax: 40,
      isFastDelivery: false,
      menus: {
        create: [
          {
            name: '얼큰 소곱창전골 (2인분)',
            description: '곱이 꽉 찬 곱창과 신선한 야채, 우동사리가 기본 제공되는 푸짐한 전골.',
            price: 29000,
            imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '매콤 야채곱창볶음',
            description: '쫄깃한 곱창을 당면, 깻잎과 함께 철판에 매콤하게 볶아낸 요리.',
            price: 14000,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '치즈 날치알볶음밥',
            description: '고소한 김가루와 톡톡 터지는 날치알, 치즈 사리를 더해 볶아먹는 볶음밥.',
            price: 4000,
            imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 12. 해운대역 라멘 베이스 (아시안, 한집배달 제공)
  await prisma.restaurant.create({
    data: {
      name: '해운대역 라멘 베이스',
      description: '돼지 사골을 24시간 가마솥에서 고아내어 국물이 걸쭉하고 깊은 하카타식 라멘.',
      category: '아시안',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=60',
      rating: 4.6,
      reviewCount: 130,
      deliveryTimeMin: 15,
      deliveryTimeMax: 30,
      isFastDelivery: true,
      menus: {
        create: [
          {
            name: '진한 돈코츠라멘',
            description: '가마솥 특제 육수와 특제 차슈, 아지타마고(계란)가 어우러진 시그니처 라멘.',
            price: 9500,
            imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '매운 카라구치라멘',
            description: '돈코츠 육수에 직접 볶아낸 해물 고추기름을 더해 칼칼하고 해장에 좋은 라멘.',
            price: 10000,
            imageUrl: 'https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '야들야들 차슈덮밥',
            description: '특제 짭조름한 소스에 졸여낸 삼겹살 차슈를 밥 위에 듬뿍 얹어낸 미니 덮밥.',
            price: 8500,
            imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  // 13. 우동 김치찜 명가 (한식, 한집배달 제공)
  await prisma.restaurant.create({
    data: {
      name: '우동 김치찜 명가',
      description: '푹 익은 전라도식 묵은지와 국내산 돼지갈비를 뭉근하게 끓여낸 정통 한식 찜 요리.',
      category: '한식',
      imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=60',
      rating: 4.8,
      reviewCount: 280,
      deliveryTimeMin: 25,
      deliveryTimeMax: 35,
      isFastDelivery: true,
      menus: {
        create: [
          {
            name: '돼지갈비 묵은지김치찜 (소)',
            description: '입안에서 살살 녹는 돼지갈비와 깊은 맛의 묵은지가 어우러진 대표 메뉴.',
            price: 26000,
            imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=60',
            isPopular: true,
          },
          {
            name: '치즈 폭탄 계란말이',
            description: '모짜렐라와 체다 치즈가 흘러넘치도록 두툼하게 말아낸 대왕 계란말이.',
            price: 10000,
            imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=60',
          },
          {
            name: '부드러운 두부 사리',
            description: '김치찜 국물에 따뜻하게 적셔 먹는 고소하고 부드러운 손두부 사리.',
            price: 2000,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
          },
        ],
      },
    },
  });

  console.log('Haeundae database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
