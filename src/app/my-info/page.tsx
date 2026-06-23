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

interface CreditCardInfo {
  id: string;
  alias: string;
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

  // 바이브페이 전용 등록 카드
  const [registeredCard, setRegisteredCard] = useState<CardInfo | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);

  // 다중 신용카드 상태
  const [creditCards, setCreditCards] = useState<CreditCardInfo[]>([]);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);

  // 바이브페이 카드 등록 폼 상태
  const [cardCompany, setCardCompany] = useState('국민카드');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardPw, setCardPw] = useState('');

  // 다중 신용카드 등록 폼 상태
  const [ccAlias, setCcAlias] = useState('');
  const [ccCompany, setCcCompany] = useState('현대카드');
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');

  // 회원정보 수정 상태
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // 1. 유저 정보 조회 및 로컬 스토리지 로드
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setEditName(data.user.name); // 이름 수정용 기본값 셋팅
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

    const savedCreditCards = localStorage.getItem('registered_credit_cards');
    if (savedCreditCards) {
      try {
        setCreditCards(JSON.parse(savedCreditCards));
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

  // 바이브페이 카드 등록 핸들러
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
    alert('💳 간편 결제용 바이브페이 카드가 새롭게 등록 및 저장되었습니다.');
  };

  // 바이브페이 카드 삭제 핸들러
  const handleDeleteCard = () => {
    if (!confirm('등록된 바이브페이 카드를 삭제하시겠습니까?')) return;
    setRegisteredCard(null);
    localStorage.removeItem('registered_card');
    alert('🗑️ 등록된 바이브페이 카드가 정상적으로 소거되었습니다.');
  };

  // 신용카드 다중 등록 실행
  const handleRegisterCreditCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (ccNumber.length < 16) {
      alert('올바른 16자리 신용카드 번호를 입력해주세요.');
      return;
    }
    if (!ccAlias.trim()) {
      alert('카드 별칭(예: 현대 ZERO 카드)을 입력해주세요.');
      return;
    }

    const lastFour = ccNumber.slice(-4);
    const newCard: CreditCardInfo = {
      id: `cc_${Date.now()}`,
      alias: ccAlias,
      company: ccCompany,
      number: `****-****-****-${lastFour}`,
    };

    const updatedList = [...creditCards, newCard];
    setCreditCards(updatedList);
    localStorage.setItem('registered_credit_cards', JSON.stringify(updatedList));
    setShowCreditCardModal(false);

    // 폼 클리어
    setCcAlias('');
    setCcNumber('');
    setCcExpiry('');
    alert(`💳 [${ccAlias}] 신용카드가 목록에 추가되었습니다.`);
  };

  // 신용카드 삭제 실행
  const handleDeleteCreditCard = (idToDelete: string) => {
    if (!confirm('선택한 신용카드를 삭제하시겠습니까?')) return;
    const updatedList = creditCards.filter((c) => c.id !== idToDelete);
    setCreditCards(updatedList);
    localStorage.setItem('registered_credit_cards', JSON.stringify(updatedList));
    alert('🗑️ 신용카드가 정상적으로 제거되었습니다.');
  };

  // 회원정보 수정 핸들러
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() && !newPassword) {
      alert('변경할 이름을 입력하거나 새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      alert('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setShowProfileEditModal(false);
        // 비밀번호 폼 리셋
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        alert('✨ 회원정보가 성공적으로 수정되었습니다.');
      } else {
        const data = await res.json();
        alert(data.error || '회원정보 수정 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('회원정보 수정 중 통신 오류가 발생했습니다.');
    }
  };

  // 회원탈퇴 핸들러
  const handleDeleteAccount = async () => {
    if (!confirm('정말로 회원탈퇴를 진행하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 주문 내역과 등록된 자산 정보가 영구 소거됩니다.')) {
      return;
    }

    const finalConfirm = prompt('탈퇴 처리를 확정하려면 "탈퇴합니다"를 입력해주세요.');
    if (finalConfirm !== '탈퇴합니다') {
      alert('입력한 텍스트가 일치하지 않아 회원탈퇴 요청이 취소되었습니다.');
      return;
    }

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        alert('회원탈퇴 처리가 완료되었습니다. 그동안 이용해주셔서 대단히 감사합니다.');
        // 홈으로 보낸 뒤 브라우저 강제 리로드하여 잔여 데이터 제거
        router.push('/');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        const data = await res.json();
        alert(data.error || '회원탈퇴 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('회원탈퇴 처리 중 통신 오류가 발생했습니다.');
    }
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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => {
                setEditName(user.name);
                setShowProfileEditModal(true);
              }}
              className="btn btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: '700',
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                background: 'rgba(234, 88, 12, 0.03)'
              }}
            >
              👑 회원정보 수정
            </button>
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
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* 2. 주소록 편집 영역 */}
          <div className="glass-panel" style={{ flex: '1 1 420px', padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

          {/* 3. 바이브페이 및 다중 신용카드 자산 관리 영역 */}
          <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* A. 바이브페이 카드 관리 */}
            <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                ⚡ 바이브페이 자산 관리
              </h2>

              {registeredCard ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, var(--primary) 100%)',
                      color: '#fff',
                      padding: '20px',
                      borderRadius: '14px',
                      boxShadow: '0 8px 16px rgba(234,88,12,0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '150px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.9 }}>VibePay Quick</span>
                      <span style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '0.85rem' }}>{registeredCard.company}</span>
                    </div>
                    <div
                      style={{
                        width: '32px',
                        height: '24px',
                        background: 'linear-gradient(135deg, #ffe082 0%, #ffb300 100%)',
                        borderRadius: '4px',
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    />
                    <div style={{ fontSize: '1.05rem', letterSpacing: '0.12em', fontWeight: '700', fontFamily: 'monospace', zIndex: 2 }}>
                      {registeredCard.number}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setShowCardModal(true)} className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>재등록</button>
                    <button type="button" onClick={handleDeleteCard} className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>카드 삭제</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowCardModal(true)} className="btn btn-primary" style={{ padding: '12px' }}>
                  ⚡ 바이브페이 간편카드 등록
                </button>
              )}
            </div>

            {/* B. 다중 신용카드 자산 관리 패널 */}
            <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                💳 보유 신용카드 목록
              </h2>

              {creditCards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {creditCards.map((cc) => (
                    <div
                      key={cc.id}
                      style={{
                        background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                        color: '#fff',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.92rem', fontWeight: '700' }}>{cc.alias}</strong>
                        <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>{cc.company} ({cc.number})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCreditCard(cc.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.15)', background: 'transparent' }}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setShowCreditCardModal(true)}
                    className="btn btn-secondary"
                    style={{ padding: '10px', fontSize: '0.85rem', width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    ➕ 새 신용카드 등록
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>등록된 신용카드가 존재하지 않습니다.</span>
                  <button type="button" onClick={() => setShowCreditCardModal(true)} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                    ➕ 신용카드 등록하기
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 바이브페이 카드 등록 모달 */}
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

      {/* 다중 신용카드 등록 모달 */}
      {showCreditCardModal && (
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
              onClick={() => setShowCreditCardModal(false)}
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
              💳 신용카드 추가 등록
            </h3>

            <div
              style={{
                background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                color: '#fff',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '180px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.8 }}>CREDIT CARD</span>
                <span style={{ fontWeight: '800', fontStyle: 'italic', fontSize: '0.95rem' }}>{ccCompany}</span>
              </div>
              <div
                style={{
                  width: '38px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
                  borderRadius: '6px',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4)'
                }}
              />
              <div style={{ fontSize: '1.15rem', letterSpacing: '0.15em', fontWeight: '700', fontFamily: 'monospace', margin: '8px 0' }}>
                {ccNumber ? ccNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', opacity: 0.85, fontWeight: '600' }}>
                <span>{ccAlias || 'MY CREDIT CARD'}</span>
                <span>{ccExpiry || 'MM/YY'}</span>
              </div>
            </div>

            <form onSubmit={handleRegisterCreditCard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">카드 별칭 (조회용 명칭)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 현대 ZERO 카드, 회사 법인카드"
                  value={ccAlias}
                  onChange={(e) => setCcAlias(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">카드사</label>
                <select
                  value={ccCompany}
                  onChange={(e) => setCcCompany(e.target.value)}
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
                  <option value="현대카드">현대카드</option>
                  <option value="신한카드">신한카드</option>
                  <option value="삼성카드">삼성카드</option>
                  <option value="국민카드">국민카드</option>
                  <option value="농협카드">농협카드</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">카드번호 (16자리)</label>
                  <input
                    type="text"
                    maxLength={16}
                    className="form-input"
                    placeholder="16자리 숫자 입력"
                    value={ccNumber}
                    onChange={(e) => setCcNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">유효기간</label>
                  <input
                    type="text"
                    maxLength={5}
                    className="form-input"
                    placeholder="MM/YY"
                    value={ccExpiry}
                    onChange={(e) => setCcExpiry(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px', padding: '12px' }}
              >
                신용카드 목록에 추가
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 회원정보 수정 모달 */}
      {showProfileEditModal && (
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
            }}
          >
            <button
              onClick={() => {
                setShowProfileEditModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
              }}
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
              👑 회원정보 수정
            </h3>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">이메일 계정</label>
                <input
                  type="text"
                  className="form-input"
                  value={user.email}
                  disabled
                  style={{ background: '#f8fafc', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">이름</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="변경할 이름을 입력하세요"
                  required
                />
              </div>

              <div style={{ borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">현재 비밀번호 <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(비밀번호 변경 시 필수)</span></label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">새 비밀번호 <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(최소 6자 이상)</span></label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="변경할 새 비밀번호를 입력하세요"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">새 비밀번호 확인</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px', padding: '12px' }}
              >
                회원정보 저장하기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 회원 탈퇴 영역 (Danger Zone) */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          background: 'rgba(239, 68, 68, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '32px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444', marginBottom: '6px' }}>⚠️ 계정 탈퇴 및 서비스 해지</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            계정을 탈퇴하시면 고객님의 주문 내역 및 간편 카드 자산 정보가 즉시 영구 파기되며 복구할 수 없습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="btn btn-secondary"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            fontWeight: '700',
            padding: '10px 20px',
            fontSize: '0.85rem',
            background: 'transparent'
          }}
        >
          회원탈퇴
        </button>
      </div>
    </div>
  );
}
