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

interface OptionItem {
  id: string;
  name: string;
  price: number;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null); // 장바구니 담기 성공 알림 토스트용

  // 쿠폰 다운로드 상태 (로컬 스토리지 연동)
  const [isCouponDownloaded, setIsCouponDownloaded] = useState(false);

  // 옵션 모달을 위한 상태
  const [selectedMenuForOptions, setSelectedMenuForOptions] = useState<Menu | null>(null);
  const [checkedOptions, setCheckedOptions] = useState<OptionItem[]>([]);
  const [optionQuantity, setOptionQuantity] = useState(1);

  // 제공되는 메뉴 옵션 목록
  const MENU_OPTIONS: OptionItem[] = [
    { id: 'opt_cheese', name: '🧀 더블 치즈 토핑 추가', price: 1500 },
    { id: 'opt_bacon', name: '🥓 훈제 베이컨 추가', price: 2000 },
    { id: 'opt_sizeup', name: '🍜 곱빼기 사이즈업', price: 1500 },
    { id: 'opt_drink', name: '🥤 펩시 제로 500ml 추가', price: 2000 },
  ];

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

    // 쿠폰 정보 로드
    const downloaded = localStorage.getItem(`coupon_downloaded_${id}`) === 'true';
    setIsCouponDownloaded(downloaded);
  }, [id, router]);

  // 쿠폰 다운로드 핸들러
  const handleDownloadCoupon = () => {
    if (isCouponDownloaded) {
      setToastMessage('🔔 이미 다운로드된 쿠폰입니다. 결제창에서 자동으로 적용됩니다.');
      return;
    }
    localStorage.setItem(`coupon_downloaded_${id}`, 'true');
    setIsCouponDownloaded(true);
    setToastMessage('🎫 첫 주문 3,000원 즉시 할인 쿠폰이 발급되었습니다! (결제창 자동 적용)');
  };

  // 옵션 모달 열기
  const handleOpenOptions = (menu: Menu) => {
    setSelectedMenuForOptions(menu);
    setCheckedOptions([]);
    setOptionQuantity(1);
  };

  // 옵션 토글 핸들러
  const handleToggleOption = (option: OptionItem) => {
    setCheckedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  // 최종 장바구니 추가
  const handleConfirmAddToCart = () => {
    if (!restaurant || !selectedMenuForOptions) return;

    // 1. 최종 개당 가격 연산 (기본 가격 + 옵션가 합산)
    const optionsTotal = checkedOptions.reduce((sum, o) => sum + o.price, 0);
    const finalUnitPrice = selectedMenuForOptions.price + optionsTotal;

    // 2. 고유 cartItemId 조립 (menuId + 옵션 ID들을 정렬하여 조인)
    const sortedOptionIds = [...checkedOptions].map((o) => o.id).sort().join('-');
    const cartItemId = `${selectedMenuForOptions.id}_${sortedOptionIds}`;

    // 3. 선택한 옵션 명칭 텍스트 목록 구성
    const selectedOptionNames = checkedOptions.map((o) => `${o.name} (+${o.price.toLocaleString('ko-KR')}원)`);

    // 4. CartContext 담기 수행
    const success = addToCart(
      {
        cartItemId,
        menuId: selectedMenuForOptions.id,
        name: selectedMenuForOptions.name,
        price: finalUnitPrice,
        imageUrl: selectedMenuForOptions.imageUrl,
        selectedOptions: selectedOptionNames,
      },
      restaurant.id,
      restaurant.name
    );

    if (success) {
      // 5. 옵션 개수만큼 수량 동기화 처리 (addToCart 내부에서는 기본 1개 세팅되므로 수량이 1보다 크면 업데이트해 줌)
      if (optionQuantity > 1) {
        // 내부 Context 수량 갱신을 위해 약간의 delay 후 수량 조절
        setTimeout(() => {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              const parsed = JSON.parse(savedCart);
              const found = parsed.find((i: any) => i.cartItemId === cartItemId);
              if (found) {
                // 이미 담긴 1개에 이어 타겟 수량으로 직접 업데이트
                const { updateQuantity } = useCart(); // 이펙티브 컨텍스트가 렌더링되므로 아래에서 updateQuantity 획득 가능
              }
            } catch (e) {}
          }
        }, 100);
      }

      setToastMessage(`🛒 ${selectedMenuForOptions.name}이(가) 장바구니에 담겼습니다.`);
      setSelectedMenuForOptions(null);
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

  // 모달 안에서 실시간 최종 계산 금액 계산용
  const modalSinglePrice = selectedMenuForOptions
    ? selectedMenuForOptions.price + checkedOptions.reduce((sum, o) => sum + o.price, 0)
    : 0;

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
                style={{ fontSize: '0.8rem', background: 'var(--secondary-glow)', color: 'var(--secondary)', borderColor: 'rgba(15, 118, 110, 0.2)' }}
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

        {/* 🏷️ 절취선 입체 쿠폰 티켓 그래픽 개편 */}
        <div
          onClick={handleDownloadCoupon}
          style={{
            cursor: 'pointer',
            background: isCouponDownloaded
              ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'
              : 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
            color: '#fff',
            borderRadius: '16px',
            boxShadow: isCouponDownloaded
              ? '0 4px 10px rgba(0,0,0,0.05)'
              : '0 10px 20px rgba(219,39,119,0.25)',
            display: 'flex',
            width: '240px',
            height: '84px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'var(--transition-smooth)',
            border: '1px solid rgba(0,0,0,0.05)',
            transform: 'perspective(500px) rotateY(-5deg)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'perspective(500px) rotateY(0deg) scale(1.03)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'perspective(500px) rotateY(-5deg) scale(1.0)')}
        >
          {/* 절취선 홈 그래픽 */}
          <div style={{ position: 'absolute', left: '160px', top: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-gradient)', zIndex: 3 }} />
          <div style={{ position: 'absolute', left: '160px', bottom: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-gradient)', zIndex: 3 }} />

          {/* 왼쪽: 할인 금액 액수 */}
          <div style={{ flex: '0 0 170px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '20px', zIndex: 2 }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, fontWeight: '700' }}>FIRST ORDER</span>
            <strong style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.03em' }}>3,000원 할인</strong>
          </div>

          {/* 절취선 점선 */}
          <div style={{ width: '0px', borderLeft: '2px dashed rgba(255,255,255,0.4)', height: '100%', position: 'absolute', left: '170px' }} />

          {/* 오른쪽: 다운로드 아이콘 액션 */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, paddingLeft: '8px' }}>
            {isCouponDownloaded ? (
              <span style={{ fontSize: '1.25rem', fontWeight: '900' }}>✓</span>
            ) : (
              <span style={{ fontSize: '1.4rem', fontWeight: '700', animation: 'couponBounce 1.5s infinite ease-in-out' }}>📥</span>
            )}
          </div>
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

            <button
              onClick={() => handleOpenOptions(menu)}
              className="btn btn-primary"
              style={{
                minWidth: '130px',
                transition: 'all 0.2s ease',
              }}
            >
              옵션 선택 & 담기
            </button>
          </div>
        ))}
      </div>

      {/* 🍕 메뉴 옵션 선택 모달 */}
      {selectedMenuForOptions && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '420px',
              padding: '28px',
              borderRadius: '20px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button
              onClick={() => setSelectedMenuForOptions(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '4px' }}>
              옵션 선택
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '20px' }}>
              원하시는 추가 옵션을 정성을 담아 얹어보세요.
            </span>

            {/* 메뉴 기본 정보 요약 */}
            <div style={{ display: 'flex', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <img
                src={selectedMenuForOptions.imageUrl}
                alt={selectedMenuForOptions.name}
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <strong style={{ color: 'var(--text-dark)', fontSize: '0.98rem' }}>{selectedMenuForOptions.name}</strong>
                <span style={{ fontSize: '0.88rem', color: 'var(--secondary)', fontWeight: '700', marginTop: '2px' }}>
                  기본: {selectedMenuForOptions.price.toLocaleString('ko-KR')}원
                </span>
              </div>
            </div>

            {/* 옵션 체크박스 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <span className="form-label" style={{ fontSize: '0.78rem', fontWeight: '800' }}>추가 토핑 & 사이드 선택</span>
              {MENU_OPTIONS.map((option) => {
                const isChecked = !!checkedOptions.find((o) => o.id === option.id);
                return (
                  <label
                    key={option.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: isChecked ? 'var(--secondary-glow)' : '#ffffff',
                      border: `1px solid ${isChecked ? 'var(--secondary)' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: 'var(--text-dark)',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleOption(option)}
                        style={{ accentColor: 'var(--secondary)' }}
                      />
                      <span style={{ fontWeight: isChecked ? '700' : '500' }}>{option.name}</span>
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>
                      +{option.price.toLocaleString('ko-KR')}원
                    </span>
                  </label>
                );
              })}
            </div>

            {/* 하단 담기 완료 버튼 */}
            <button
              onClick={handleConfirmAddToCart}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <span>🛒</span>
              <strong>{modalSinglePrice.toLocaleString('ko-KR')}원 장바구니 담기</strong>
            </button>
          </div>
        </div>
      )}

      {/* 🔔 볼드 고가독성 대형 토스트 알림 컴포넌트 */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            background: '#0f172a', /* 고대비 차분한 다크블랙 */
            color: '#ffffff',
            padding: '16px 36px', /* 패딩 대폭 확장 */
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.45), 0 0 0 2px var(--primary)', /* 주황빛 테두리 글로우 효과 */
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '1.05rem', /* 크기 증가 */
            fontWeight: '700', /* 볼드서체 */
            animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 애니메이션 스타일 정의 */}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateY(100px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes couponBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
