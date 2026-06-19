'use client';

import Link from 'next/link';
import { useCart } from 'src/context/CartContext';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Header() {
  const { cartCount } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 로그인 상태 가져오기
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
  }, [pathname]); // 페이지 이동이 있을 때마다 세션 갱신

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        alert('로그아웃 되었습니다.');
        router.push('/');
        router.refresh();
      }
    } catch (e) {
      alert('로그아웃 처리 중 에러가 발생했습니다.');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          🍔 <span>바이브 딜리버리</span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            식당목록
          </Link>
          <Link
            href="/cart"
            className={`nav-link ${pathname === '/cart' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            장바구니
            {cartCount > 0 && (
              <span
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/orders" className={`nav-link ${pathname === '/orders' ? 'active' : ''}`}>
                    주문내역
                  </Link>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    👋&nbsp;<strong style={{ color: 'var(--text-main)' }}>{user.name}</strong>님
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={`nav-link ${pathname === '/login' ? 'active' : ''}`}>
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="btn btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
