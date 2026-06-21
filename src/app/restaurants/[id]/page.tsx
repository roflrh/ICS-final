'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from 'src/context/CartContext';

interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isPopular: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  rating: number | null;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isFastDelivery: boolean;
  menus: Menu[];
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null); // 담기 애니메이션 효과용

  useEffect(() => {
    if (!id) return;

    const fetchRestaurantDetail = async () => {
      try {
        const res = await fetch(`/api/restaurants/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data.restaurant);
        } else {
          alert('식당 정보를 불러오는 데 실패했습니다.');
          router.push('/');
        }
      } catch (error) {
        console.error('식당 상세 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetail();
  }, [id, router]);

  const handleAddToCart = (menu: Menu) => {
    if (!restaurant) return;

    // 담기 시각 효과
    setAddingId(menu.id);
    setTimeout(() => setAddingId(null), 800);

    const success = addToCart(
      {
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        imageUrl: menu.imageUrl,
      },
      restaurant.id,
      restaurant.name
    );

    if (success) {
      // 담기 성공 토스트 알림을 별도로 대체해도 좋으나 데모용으로 간단하게 피드백 제공
      console.log('장바구니 담기 성공:', menu.name);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        식당 메뉴를 맛있게 차리는 중... 👨‍🍳
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        식당 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div>
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.push('/')}
        className="btn btn-secondary"
        style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.88rem' }}
      >
        ← 식당 목록으로
      </button>

      {/* 식당 배너 정보 */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          gap: '32px',
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '40px',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto' }}>
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            style={{
              width: '240px',
              height: '160px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--panel-border)',
            }}
          />
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span
                className="badge badge-preparing"
                style={{ fontSize: '0.8rem', background: 'rgba(0, 210, 255, 0.1)' }}
              >
                {restaurant.category}
              </span>
              {restaurant.isFastDelivery && (
                <span
                  className="badge badge-fast"
                  style={{ fontSize: '0.8rem' }}
                >
                  🚀 한집배달
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px', color: 'var(--text-dark)' }}>
              {restaurant.name}
            </h1>
            
            {/* 메타 데이터 한 줄 (평점 + 리뷰수 + 배달 시간) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '500' }}>
              <span style={{ color: 'var(--badge-popular)', fontWeight: '700' }}>
                ★ {restaurant.rating ? restaurant.rating.toFixed(1) : '평점 없음'}
              </span>
              <span>({restaurant.reviewCount})</span>
              <span>•</span>
              <span>⏱️ {restaurant.deliveryTimeMin}~{restaurant.deliveryTimeMax}분</span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              {restaurant.description}
            </p>
          </div>
        </div>

        {/* 첫 주문 쿠폰 안내 영역 */}
        <div
          className="badge-discount"
          style={{
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--badge-discount)',
            minWidth: '220px',
            flex: '0 0 auto',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.1)',
          }}
        >
          <span style={{ fontSize: '1.3rem', marginBottom: '4px' }}>🏷️ 쿠폰 안내</span>
          <span style={{ fontSize: '0.9rem', fontWeight: '800', textAlign: 'center' }}>
            첫 주문 3,000원 즉시 할인 중
          </span>
        </div>
      </div>

      {/* 메뉴 리스트 타이틀 */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>메인 메뉴 목록</h2>

      {/* 메뉴 목록 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {restaurant.menus.map((menu) => (
          <div
            key={menu.id}
            className="glass-panel"
            style={{
              display: 'flex',
              padding: '20px',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {/* 메뉴 텍스트 및 이미지 */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: '1 1 400px' }}>
              <img
                src={menu.imageUrl}
                alt={menu.name}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--panel-border)',
                }}
              />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {menu.isPopular && (
                    <span className="badge badge-popular" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                      👑 인기
                    </span>
                  )}
                  {menu.name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '8px', lineHeight: '1.4' }}>
                  {menu.description}
                </p>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)' }}>
                  {menu.price.toLocaleString('ko-KR')}원
                </span>
              </div>
            </div>

            {/* 담기 액션 버튼 */}
            <button
              onClick={() => handleAddToCart(menu)}
              className="btn btn-primary"
              disabled={addingId === menu.id}
              style={{
                minWidth: '130px',
                background: addingId === menu.id ? 'var(--success)' : 'var(--primary)',
                boxShadow: addingId === menu.id ? '0 4px 14px rgba(5, 150, 105, 0.2)' : '0 4px 14px var(--primary-glow)',
                transition: 'all 0.2s ease',
              }}
            >
              {addingId === menu.id ? '✓ 담기 완료!' : '장바구니 담기'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
