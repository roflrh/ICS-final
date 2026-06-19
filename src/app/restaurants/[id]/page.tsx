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
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
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
          flexWrap: 'wrap',
        }}
      >
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
          <span
            className="badge badge-preparing"
            style={{ marginBottom: '12px', fontSize: '0.8rem', background: 'rgba(0, 210, 255, 0.1)' }}
          >
            {restaurant.category}
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px', color: '#fff' }}>
            {restaurant.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            {restaurant.description}
          </p>
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
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
                background: addingId === menu.id ? 'var(--success)' : 'linear-gradient(135deg, var(--primary) 0%, #ff3e1a 100%)',
                boxShadow: addingId === menu.id ? '0 4px 15px rgba(16, 185, 129, 0.3)' : '0 4px 15px var(--primary-glow)',
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
