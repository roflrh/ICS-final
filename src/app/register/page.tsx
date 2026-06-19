'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword || !name) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '16px' }}>
      <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-md)' }}>
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            marginBottom: '8px',
            textAlign: 'center',
            background: 'linear-gradient(to right, var(--primary), #ffa37b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          회원가입
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
          바이브 딜리버리와 함께 맛있는 배달 주문을 시작해보세요
        </p>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              fontSize: '0.9rem',
              marginBottom: '20px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이름</label>
            <input
              type="text"
              className="form-input"
              placeholder="이름을 입력해 주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">이메일 주소</label>
            <input
              type="email"
              className="form-input"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-input"
              placeholder="6자 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <input
              type="password"
              className="form-input"
              placeholder="비밀번호를 재입력해 주세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '14px' }}
            disabled={loading}
          >
            {loading ? '가입 처리 중...' : '회원가입 완료'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
}
