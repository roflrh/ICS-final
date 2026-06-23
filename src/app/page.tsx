'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  subTags: string[]; // [NEW] 보조 태그 배열 추가
  rating: number | null;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isFastDelivery: boolean;
  hasCoupon: boolean; // [NEW] DB 쿠폰 유무 필드
}

const CATEGORIES = ['전체', '한식', '중식', '일식', '양식', '버거', '피자', '치킨', '아시안'];

const CATEGORY_EMOJIS: Record<string, string> = {
  '전체': '🍽️ 전체',
  '한식': '🍚 한식',
  '중식': '🥢 중식',
  '일식': '🍣 일식',
  '양식': '🍝 양식',
  '버거': '🍔 버거',
  '피자': '🍕 피자',
  '치킨': '🍗 치킨',
  '아시안': '🍜 아시안',
};

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeCategory, setActiveCategory] = useState('전체');
  const [loading, setLoading] = useState(true);

  // 카테고리 가로 휠 스크롤 지원용 ref 및 effect
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.2;
      };
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        el.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  // 그리드 크기 및 다중 필터/정렬 상태 추가
  const [viewSize, setViewSize] = useState<'large' | 'medium' | 'small'>('medium');
  const [onlyFastDelivery, setOnlyFastDelivery] = useState(false);
  const [onlyCoupon, setOnlyCoupon] = useState(false);
  const [under30Min, setUnder30Min] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'reviews' | 'time'>('name');

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

  // 실시간 다중 필터 & 정렬 처리
  const processedRestaurants = restaurants
    .filter((r) => {
      if (onlyFastDelivery && !r.isFastDelivery) return false;
      if (onlyCoupon && !r.hasCoupon) return false;
      if (under30Min && (r.deliveryTimeMax ?? 35) > 30) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      if (sortBy === 'reviews') {
        return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      }
      if (sortBy === 'time') {
        return (a.deliveryTimeMax ?? 30) - (b.deliveryTimeMax ?? 30);
      }
      return a.name.localeCompare(b.name, 'ko-KR');
    });

  // 동적 그리드 칼럼 수 반환
  const getGridTemplateColumns = () => {
    if (viewSize === 'large') return 'repeat(auto-fill, minmax(420px, 1fr))';
    if (viewSize === 'small') return 'repeat(auto-fill, minmax(220px, 1fr))';
    return 'repeat(auto-fill, minmax(310px, 1fr))';
  };

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
          background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)',
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
            background: 'linear-gradient(to right, var(--text-dark), var(--text-muted))',
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
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>인기 식당 목록</h2>
        
        {/* 카테고리 가로 스크롤 칩 리스트 */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            padding: '8px 4px 12px 4px',
            margin: '0 -4px',
            whiteSpace: 'nowrap',
            maxWidth: '650px',
            scrollbarWidth: 'thin',
            msOverflowStyle: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              height: 5px;
            }
            div::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="btn"
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                fontWeight: '700',
                borderRadius: '24px',
                border: activeCategory === category ? 'none' : '1px solid var(--panel-border)',
                background: activeCategory === category ? 'var(--primary)' : '#ffffff',
                color: activeCategory === category ? '#fff' : 'var(--text-muted)',
                boxShadow: activeCategory === category ? '0 6px 16px var(--primary-glow)' : '0 2px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              {CATEGORY_EMOJIS[category] || category}
            </button>
          ))}
        </div>
      </div>

      {/* 고급 다중 필터 & 정렬 & 그리드 스위처 제어 패널 */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'rgba(255, 255, 255, 0.45)',
          border: '1px solid var(--panel-border)',
        }}
      >
        {/* 다중 필터 토글 칩 */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', marginRight: '6px' }}>필터</span>
          <button
            onClick={() => setOnlyFastDelivery(!onlyFastDelivery)}
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: '700',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: onlyFastDelivery ? 'var(--secondary)' : '#cbd5e1',
              background: onlyFastDelivery ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
              color: onlyFastDelivery ? 'var(--secondary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: onlyFastDelivery ? '0 4px 8px rgba(13, 148, 136, 0.1)' : 'none',
            }}
          >
            🚀 한집배달
          </button>
          <button
            onClick={() => setOnlyCoupon(!onlyCoupon)}
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: '700',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: onlyCoupon ? 'var(--primary)' : '#cbd5e1',
              background: onlyCoupon ? 'rgba(239, 68, 68, 0.06)' : 'transparent',
              color: onlyCoupon ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: onlyCoupon ? '0 4px 8px rgba(239, 68, 68, 0.1)' : 'none',
            }}
          >
            🏷️ 쿠폰할인
          </button>
          <button
            onClick={() => setUnder30Min(!under30Min)}
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: '700',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: under30Min ? '#0284c7' : '#cbd5e1',
              background: under30Min ? 'rgba(2, 132, 199, 0.06)' : 'transparent',
              color: under30Min ? '#0284c7' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: under30Min ? '0 4px 8px rgba(2, 132, 199, 0.1)' : 'none',
            }}
          >
            ⏱️ 30분이내
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 실시간 정렬 셀렉터 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)' }}>정렬</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: 'var(--text-dark)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <option value="name">🔤 기본 이름순</option>
              <option value="rating">⭐ 평점 높은순</option>
              <option value="reviews">💬 리뷰 많은순</option>
              <option value="time">⏱️ 배달 빠른순</option>
            </select>
          </div>

          {/* 그리드 크기 3단계 스위처 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)' }}>그리드 뷰</span>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
              <button
                onClick={() => setViewSize('large')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewSize === 'large' ? '#ffffff' : 'transparent',
                  color: viewSize === 'large' ? 'var(--text-dark)' : 'var(--text-muted)',
                  boxShadow: viewSize === 'large' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🖼️ 큼직하게
              </button>
              <button
                onClick={() => setViewSize('medium')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewSize === 'medium' ? '#ffffff' : 'transparent',
                  color: viewSize === 'medium' ? 'var(--text-dark)' : 'var(--text-muted)',
                  boxShadow: viewSize === 'medium' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📱 기본
              </button>
              <button
                onClick={() => setViewSize('small')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  background: viewSize === 'small' ? '#ffffff' : 'transparent',
                  color: viewSize === 'small' ? 'var(--text-dark)' : 'var(--text-muted)',
                  boxShadow: viewSize === 'small' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📋 촘촘하게
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 로딩 상태 렌더링 */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: getGridTemplateColumns(),
            gap: '28px',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="glass-panel"
              style={{
                height: viewSize === 'large' ? '390px' : viewSize === 'small' ? '280px' : '340px',
                animation: 'pulse 1.5s infinite ease-in-out',
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      ) : processedRestaurants.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '80px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
          }}
        >
          🔍 조건에 맞는 식당이 없습니다. 필터를 해제해 보세요!
        </div>
      ) : (
        /* 식당 카드 그리드 */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: getGridTemplateColumns(),
            gap: '28px',
          }}
        >
          {processedRestaurants.map((restaurant) => (
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
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {/* 식당 이미지 */}
              <div
                style={{
                  width: '100%',
                  height: viewSize === 'large' ? '220px' : viewSize === 'small' ? '135px' : '175px',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'height 0.3s ease',
                }}
              >
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
                
                {/* 카테고리 배지 */}
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {restaurant.category}
                </span>

                {/* 첫주문 쿠폰할인 배지 */}
                {restaurant.hasCoupon && (
                  <span
                    className="badge badge-coupon"
                    style={{
                      position: 'absolute',
                      top: '42px',
                      left: '12px',
                      background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: '#ffffff',
                      boxShadow: '0 4px 8px rgba(219,39,119,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🏷️ 3,000원 쿠폰
                  </span>
                )}

                {/* 쿠팡이츠 스타일: 한집배달🚀 배지 노출 */}
                {restaurant.isFastDelivery && (
                  <span
                    className="badge badge-fast"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🚀 한집배달
                  </span>
                )}
              </div>

              {/* 식당 텍스트 설명 */}
              <div
                style={{
                  padding: viewSize === 'small' ? '16px' : '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  transition: 'padding 0.3s ease',
                }}
              >
                <h3
                  style={{
                    fontSize: viewSize === 'large' ? '1.35rem' : viewSize === 'small' ? '1.05rem' : '1.2rem',
                    fontWeight: '800',
                    marginBottom: '6px',
                    color: 'var(--text-dark)',
                    transition: 'font-size 0.3s ease',
                  }}
                >
                  {restaurant.name}
                </h3>
                
                {/* 메타 데이터 한 줄 (평점 + 리뷰수 + 배달 시간) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '500' }}>
                  <span style={{ color: 'var(--badge-popular)', fontWeight: '700' }}>
                    ★ {restaurant.rating ? restaurant.rating.toFixed(1) : '평점 없음'}
                  </span>
                  <span>({restaurant.reviewCount})</span>
                  <span>•</span>
                  <span>⏱️ {restaurant.deliveryTimeMin}~{restaurant.deliveryTimeMax}분</span>
                </div>

                {/* 새로 추가: subTags (최대 3개 노출) */}
                {restaurant.subTags && restaurant.subTags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {restaurant.subTags.slice(0, 3).map((tag) => (
                      <span key={tag} style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 8px', 
                        background: '#f1f5f9',
                        color: 'var(--text-muted)',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: viewSize === 'small' ? 1 : 2,
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
                    borderTop: '1px solid #f1f5f9',
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
