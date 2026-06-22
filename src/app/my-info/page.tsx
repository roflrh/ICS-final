'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
}

interface CardInfo {
  company: string;
  number: string;
}

export default function MyInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 주소록 상태
  const [addressBook, setAddressBook] = useState({
    home: '',
    office: '',
    school: '',
  });

  // 카드 정보 상태
  const [registeredCard, setRegisteredCard] = useState<CardInfo | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);

  // 카드 등록 폼 상태
  const [cardCompany, setCardCompany] = useState('국민카드');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardPw, setCardPw] = useState('');

  // 1. 유저 정보 조회 및 로컬 스토리지 로드
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // 비로그인 상태 가드: 로그인 페이지로 리다이렉트
          alert('로그인이 필요한 페이지입니다.');
          router.push('/login?redirect=/my-info');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // 로컬 스토리지 정보 로드
    const savedHome = localStorage.getItem('addr_book_home') || '부산 해운대구 우동 마린시티 해원로 35 (자이아파트)';
    const savedOffice = localStorage.getItem('addr_book_office') || '부산 해운대구 센텀동로 9 벡스코 스페이스';
    const savedSchool = localStorage.getItem('addr_book_school') || '부산 해운대구 달맞이길 117 해운대중학교 정문';
    setAddressBook({
      home: savedHome,
      office: savedOffice,
      school: savedSchool,
    });

    const savedCard = localStorage.getItem('registered_card');
    if (savedCard) {
      try {
        setRegisteredCard(JSON.parse(savedCard));
      } catch (e) {
        console.error(e);
      }
    }
  }, [router]);

  // 주소 저장 핸들러
  const handleSaveAddress = (tab: 'home' | 'office' | 'school') => {
    const currentAddress = addressBook[tab];
    if (!currentAddress.trim()) {
      alert('주소를 입력해 주세요.');
      return;
    }
    localStorage.setItem(`addr_book_${tab}`, currentAddress);
    alert(`⭐ [${tab === 'home' ? '집' : tab === 'office' ? '회사' : '학교'}] 주소가 성공적으로 수정 및 저장되었습니다.`);
  };

  // 카드 등록 핸들러
  const handleRegisterCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 16) {
      alert('올바른 16자리 카드 번호를 입력해주세요.');
      return;
    }
    const lastFour = cardNumber.slice(-4);
    const cardInfo: CardInfo = {
      company: cardCompany,
      number: `****-****-****-${lastFour}`,
    };
    setRegisteredCard(cardInfo);
    localStorage.setItem('registered_card', JSON.stringify(cardInfo));
    setShowCardModal(false);
    alert('💳 간편 결제용 카드가 새롭게 등록 및 저장되었습니다.');
  };

  // 카드 삭제 핸들러
  const handleDeleteCard = () => {
    if (!confirm('등록된 바이브페이 카드를 삭제하시겠습니까?')) return;
    setRegisteredCard(null);
    localStorage.removeItem('registered_card');
    alert('🗑️ 등록된 카드가 정상적으로 소거되었습니다.');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        개인 정보를 안전하게 조회하는 중... 🛡️
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '24px', color: 'var(--text-dark)' }}>내 정보 관리</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* 1. 사용자 프로필 요약 카드 */}
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '3rem' }}>👑</span>
            <div>
              <strong style={{ fontSize: '1.25rem', color: 'var(--text-dark)', fontWeight: '800' }}>{user.name}</strong> 님
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>{user.email}</div>
            </div>
          </div>
          
          <span
            className="badge badge-popular"
            style={{
              fontSize: '0.82rem',
              padding: '6px 16px',
              background: 'rgba(217, 119, 6, 0.08)',
              color: 'var(--badge-popular)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
              fontWeight: '800'
            }}
          >
            🌟 해운대 VIP 단골회원
          </span>
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* 2. 주소록 편집 영역 */}
          <div className="glass-panel" style={{ flex: '1 1 400px', padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              📍 마이 주소록 설정
            </h2>

            {(['home', 'office', 'school'] as const).map((tab) => (
              <div key={tab} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{tab === 'home' ? '🏠 집 주소' : tab === 'office' ? '🏢 회사 주소' : '🏫 학교 주소'}</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={addressBook[tab]}
                    onChange={(e) => setAddressBook({ ...addressBook, [tab]: e.target.value })}
                    placeholder="주소를 입력해주세요"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveAddress(tab)}
                    className="btn btn-secondary"
                    style={{ padding: '0 16px', fontSize: '0.85rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    저장
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 3. 바이브페이 카드 관리 영역 */}
          <div className="glass-panel" style={{ flex: '1 1 300px', padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              💳 바이브페이 자산 관리
            </h2>

            {registeredCard ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* 실물 카드 그래픽 재사용 */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, var(--primary) 100%)',
                    color: '#fff',
                    padding: '20px',
                    borderRadius: '14px',
                    boxShadow: '0 8px 16px rgba(234,88,12,0.12), 0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '160px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.05em', opacity: 0.9 }}>VibePay Quick</span>
                    <span style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '0.9rem', letterSpacing: '-0.02em' }}>{registeredCard.company}</span>
                  </div>

                  <div
                    style={{
                      width: '32px',
                      height: '24px',
                      background: 'linear-gradient(135deg, #ffe082 0%, #ffb300 100%)',
                      borderRadius: '4px',
                      margin: '6px 0 2px 0',
                      boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.15)',
                      position: 'relative',
                      zIndex: 2,
                      border: '1px solid rgba(0,0,0,0.08)'
                    }}
                  >
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.15)' }} />
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.15)' }} />
                  </div>

                  <div style={{ fontSize: '1.05rem', letterSpacing: '0.12em', fontWeight: '700', fontFamily: 'monospace', margin: '4px 0', textShadow: '0 1px 2px rgba(0,0,0,0.3)', zIndex: 2 }}>
                    {registeredCard.number}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.9, fontWeight: '600', zIndex: 2 }}>
                    <span>HAEUNDAE VIP</span>
                    <span>MM/YY</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCardModal(true)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                  >
                    재등록
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCard}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                  >
                    카드 삭제
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
                  등록된 간편 결제 카드가 없습니다.
                </span>
                <button
                  type="button"
                  onClick={() => setShowCardModal(true)}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  💳 결제 카드 등록하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 간편 카드 등록 모달 팝업 */}
      {showCardModal && (
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
              width: '400px',
              padding: '28px',
              borderRadius: '20px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <button
              onClick={() => setShowCardModal(false)}
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

            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-dark)' }}>
              💳 간편 카드 등록 (바이브페이)
            </h3>

            {/* 카드 실물 모형 그래픽 */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, var(--primary) 100%)',
                color: '#fff',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 12px 24px rgba(234,88,12,0.15), 0 4px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '180px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em', opacity: 0.9 }}>VibePay Quick</span>
                <span style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '1rem', letterSpacing: '-0.02em' }}>{cardCompany}</span>
              </div>

              <div
                style={{
                  width: '38px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #ffe082 0%, #ffb300 100%)',
                  borderRadius: '6px',
                  margin: '12px 0 4px 0',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.15)',
                  position: 'relative',
                  zIndex: 2,
                  border: '1px solid rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.15)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.15)' }} />
              </div>

              <div style={{ fontSize: '1.2rem', letterSpacing: '0.15em', fontWeight: '700', fontFamily: 'monospace', margin: '8px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)', zIndex: 2 }}>
                {cardNumber ? cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.9, fontWeight: '600', zIndex: 2 }}>
                <span>HAEUNDAE VIP</span>
                <span>{cardExpiry || 'MM/YY'}</span>
              </div>
            </div>

            <form onSubmit={handleRegisterCard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">카드사</label>
                <select
                  value={cardCompany}
                  onChange={(e) => setCardCompany(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    color: 'var(--text-dark)',
                    background: '#fff',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="국민카드">국민카드</option>
                  <option value="신한카드">신한카드</option>
                  <option value="현대카드">현대카드</option>
                  <option value="삼성카드">삼성카드</option>
                  <option value="농협카드">농협카드</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">카드번호 (16자리)</label>
                <input
                  type="text"
                  maxLength={16}
                  className="form-input"
                  placeholder="예: 9410123456789012"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">유효기간 (MM/YY)</label>
                  <input
                    type="text"
                    maxLength={5}
                    className="form-input"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">비밀번호 앞 2자리</label>
                  <input
                    type="password"
                    maxLength={2}
                    className="form-input"
                    placeholder="••"
                    value={cardPw}
                    onChange={(e) => setCardPw(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px', padding: '12px' }}
              >
                카드 등록 및 저장하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
