'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from 'src/context/CartContext';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Sidebar() {
  const { cartItems, cartCount, cartTotalPrice, restaurantName } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname();
  const router = useRouter();

  // 로그인 세션 확인
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]); // 경로 이동 시 세션 갱신

  return (
    <aside className="sidebar-container">
      {/* 1. 사용자 프로필 카드 */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center' }}>
            프로필 불러오는 중...
          </div>
        ) : user ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>👑</span>
              <div>
                <strong style={{ color: 'var(--text-dark)', fontSize: '1.05rem', fontWeight: '800' }}>{user.name}</strong> 님
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</div>
              </div>
            </div>
            
            {/* 단골 등급 표시 배지 */}
            <span
              className="badge badge-popular"
              style={{
                fontSize: '0.72rem',
                padding: '4px 10px',
                background: 'rgba(217, 119, 6, 0.08)',
                color: 'var(--badge-popular)',
                border: '1px solid rgba(217, 119, 6, 0.2)',
                display: 'inline-block',
                textAlign: 'center',
                width: '100%',
                fontWeight: '800'
              }}
            >
              🌟 해운대 VIP 단골회원
            </span>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              더 많은 기능을 위해 로그인이 필요합니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/login" className="btn btn-primary" style={{ padding: '8px', fontSize: '0.85rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                로그인
              </Link>
              <Link href="/register" className="btn btn-secondary" style={{ padding: '8px', fontSize: '0.85rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                회원가입
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2. 퀵 내비게이션 */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.05em' }}>
          메뉴 바로가기
        </h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            href="/"
            className={`btn ${pathname === '/' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.88rem', width: '100%' }}
          >
            🏠 &nbsp; 식당 목록
          </Link>
          <Link
            href="/cart"
            className={`btn ${pathname === '/cart' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'space-between', padding: '10px 14px', fontSize: '0.88rem', width: '100%' }}
          >
            <span>🛒 &nbsp; 장바구니</span>
            {cartCount > 0 && (
              <span style={{
                background: pathname === '/cart' ? '#fff' : 'var(--primary)',
                color: pathname === '/cart' ? 'var(--primary)' : '#fff',
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: 'bold',
                width: '18px',
                height: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/orders"
            className={`btn ${pathname === '/orders' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.88rem', width: '100%' }}
          >
            📦 &nbsp; 주문 내역
          </Link>
          <Link
            href="/my-info"
            className={`btn ${pathname === '/my-info' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.88rem', width: '100%' }}
          >
            👤 &nbsp; 내 정보 관리
          </Link>
        </nav>
      </div>

      {/* 3. 장바구니 실시간 요약 위젯 */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
          장바구니 퀵뷰
        </h3>
        {cartItems.length > 0 ? (
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>주문 예정 식당</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🏪 {restaurantName}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>총 주문금액</span>
              <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{cartTotalPrice.toLocaleString('ko-KR')}원</strong>
            </div>

            <Link href="/cart" className="btn btn-primary" style={{ padding: '10px', fontSize: '0.85rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
              주문하기 →
            </Link>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            🔔 담긴 음식이 없습니다.
          </div>
        )}
      </div>
    </aside>
  );
}
