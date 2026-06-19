'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 미들웨어 또는 타 페이지에서 넘어온 redirect 타겟 경로 획득 (기본은 메인인 '/')
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
          placeholder="비밀번호를 입력해 주세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={{ maxWidth: '460px', margin: '60px auto', padding: '16px' }}>
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
          로그인
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
          바이브 딜리버리 서비스를 방문해 주셔서 감사합니다.
        </p>

        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>로딩 중...</div>}>
          <LoginForm />
        </Suspense>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          처음이신가요?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
            회원가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
