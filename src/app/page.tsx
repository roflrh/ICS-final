'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

const CATEGORIES = ['전체', '한식', '양식', '아시안'];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  // 식당 데이터 가져오기
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/restaurants?category=${encodeURIComponent(activeCategory)}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data.restaurants);
        }
      } catch (error) {
        console.error('식당 목록을 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [activeCategory]);

  return (
    <div>
      {/* 히어로 배너 영역 */}
      <div
        className="glass-panel"
        style={{
          padding: '48px 32px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 94, 58, 0.15) 0%, rgba(0, 210, 255, 0.05) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #fff, var(--text-muted))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          바이브 딜리버리에 오신 것을 환영합니다!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          엄선된 최고의 맛집들과 그 맛 그대로 담아내는 신선함을 편리한 웹 환경에서 즉시 주문해보세요.
        </p>
      </div>

      {/* 카테고리 필터 헤더 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>인기 식당 목록</h2>
        
        {/* 카테고리 탭 버튼 */}
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="btn"
              style={{
                padding: '8px 16px',
                fontSize: '0.88rem',
                borderRadius: '8px',
                background: activeCategory === category ? 'var(--primary)' : 'transparent',
                color: activeCategory === category ? '#white' : 'var(--text-muted)',
                boxShadow: activeCategory === category ? '0 4px 12px var(--primary-glow)' : 'none',
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 로딩 상태 렌더링 */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-panel"
              style={{
                height: '350px',
                animation: 'pulse 1.5s infinite ease-in-out',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '80px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
          }}
        >
          🔍 해당 카테고리에 등록된 식당이 아직 없습니다.
        </div>
      ) : (
        /* 식당 카드 그리드 */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.id}`}
              className="glass-panel"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 식당 이미지 */}
              <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--secondary)',
                    border: '1px solid rgba(0, 210, 255, 0.3)',
                  }}
                >
                  {restaurant.category}
                </span>
              </div>

              {/* 식당 텍스트 설명 */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
                  {restaurant.name}
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flexGrow: 1,
                  }}
                >
                  {restaurant.description}
                </p>
                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--primary)',
                  }}
                >
                  <span>메뉴 보기 & 주문하기</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 로딩용 키프레임 애니메이션 삽입 */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
