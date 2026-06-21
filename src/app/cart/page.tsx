'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from 'src/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const {
    cartItems,
    restaurantName,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotalPrice,
  } = useCart();

  const router = useRouter();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [requestType, setRequestType] = useState('문 앞에 두고 벨 누르기');
  const [customRequest, setCustomRequest] = useState('');

  const requestOptions = [
    '문 앞에 두고 벨 누르기',
    '벨 누르지 말고 문 앞에 두기',
    '직접 수령',
    '직접 입력',
  ];

  // 최근 저장한 배달 주소가 있다면 자동 기입
  useEffect(() => {
    const savedAddress = localStorage.getItem('last_delivery_address');
    if (savedAddress) setAddress(savedAddress);
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('배달받으실 주소를 정확히 입력해주세요.');
      return;
    }

    // 1. 로그인 여부 확인
    try {
      const checkRes = await fetch('/api/auth/me');
      if (!checkRes.ok) {
        // 비로그인 시 로그인 페이지로 이동시키되 결제 진행 중이었으므로 redirect 쿼리에 /cart 기입
        alert('주문을 진행하려면 로그인이 필요합니다.');
        router.push('/login?redirect=/cart');
        return;
      }
    } catch (err) {
      setError('인증 확인 중 오류가 발생했습니다.');
      return;
    }

    setLoading(true);

    try {
      // 2. 주문 생성 API 전송
      const finalRequest = requestType === '직접 입력' ? customRequest : requestType;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          address,
          totalPrice: cartTotalPrice,
          deliveryRequest: finalRequest,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '주문 생성에 실패했습니다.');
      }

      // 주소 로컬 스토리지에 마지막 배송지로 보관
      localStorage.setItem('last_delivery_address', address);

      // 3. 주문 성공 시 장바구니 비우기 및 리다이렉트
      clearCart();
      alert('주문이 정상적으로 완료되었습니다! 주문 내역 화면으로 이동합니다.');
      router.push('/orders');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '16px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '4rem', marginBottom: '24px', display: 'block' }}>🛒</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: '#fff' }}>
            장바구니가 비어 있습니다.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
            식당 목록 페이지에서 맛있는 메뉴를 선택해 장바구니에 채워보세요.
          </p>
          <Link href="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>
            맛있는 음식 담으러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '24px', color: '#fff' }}>장바구니</h1>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* 장바구니 상품 목록 영역 */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              borderBottom: '2px solid var(--primary)',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>현재 주문 중인 식당</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
              🏪 {restaurantName}
            </h2>
          </div>

          {cartItems.map((item) => (
            <div
              key={item.menuId}
              className="glass-panel"
              style={{
                display: 'flex',
                padding: '20px',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              {/* 이미지 및 제목 */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--panel-border)',
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>{item.name}</h3>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {item.price.toLocaleString('ko-KR')}원
                  </span>
                </div>
              </div>

              {/* 수량 변경 및 삭제 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    border: '1px solid var(--panel-border)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                    className="btn"
                    style={{ padding: '6px 12px', background: 'transparent', borderRadius: '0' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 12px', fontSize: '0.95rem', fontWeight: '700', minWidth: '32px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                    className="btn"
                    style={{ padding: '6px 12px', background: 'transparent', borderRadius: '0' }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.menuId)}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    color: '#ef4444',
                    borderColor: 'rgba(239,68,68,0.2)',
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}

          {/* 전체 비우기 버튼 */}
          <button
            onClick={() => {
              if (confirm('장바구니를 모두 비우시겠습니까?')) clearCart();
            }}
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.88rem' }}
          >
            장바구니 전체 비우기
          </button>
        </div>

        {/* 결제 정보 요약 및 배송지 입력 영역 */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: '#fff' }}>
              결제 및 배송지 정보
            </h2>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleOrderSubmit}>
              {/* 배달 요청사항 */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">배달 요청사항</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {requestOptions.map((option) => (
                    <label
                      key={option}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        background: requestType === option ? 'rgba(255, 94, 58, 0.08)' : 'rgba(0, 0, 0, 0.15)',
                        border: `1px solid ${requestType === option ? 'var(--primary)' : 'var(--panel-border)'}`,
                        transition: 'var(--transition-smooth)',
                      }}
                    >
                      <input
                        type="radio"
                        name="deliveryRequest"
                        value={option}
                        checked={requestType === option}
                        onChange={() => setRequestType(option)}
                        style={{
                          accentColor: 'var(--primary)',
                          cursor: 'pointer',
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {requestType === '직접 입력' && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="요청사항을 직접 입력해주세요 (예: 조심히 와주세요)"
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                    style={{ marginTop: '8px' }}
                    disabled={loading}
                    required
                  />
                )}
              </div>

              {/* 주소 입력 */}
              <div className="form-group">
                <label className="form-label">배달 주소</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 서울시 마포구 백범로 35 (신수동)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {/* 금액 합계 요약 */}
              <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>주문금액</span>
                  <span>{cartTotalPrice.toLocaleString('ko-KR')}원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>배달팁</span>
                  <span style={{ color: 'var(--success)' }}>0원 (무료 이벤트!)</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    color: '#fff',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span>총 결제금액</span>
                  <span style={{ color: 'var(--secondary)' }}>{cartTotalPrice.toLocaleString('ko-KR')}원</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? '주문 생성 중...' : '결제 및 주문하기'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
