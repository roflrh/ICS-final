'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from 'src/context/CartContext';
import Link from 'next/link';

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

  // 1. 주소록 관련 상태 (집 / 회사 / 학교)
  const [addressTab, setAddressTab] = useState<'home' | 'office' | 'school'>('home');
  const [addressBook, setAddressBook] = useState({
    home: '부산 해운대구 우동 마린시티 해원로 35 (자이아파트)',
    office: '부산 해운대구 센텀동로 9 벡스코 스페이스',
    school: '부산 해운대구 달맞이길 117 해운대중학교 정문',
  });

  // 2. 요청사항 관련 상태 (배달기사 / 가게 조리)
  const [riderRequestType, setRiderRequestType] = useState('문 앞에 두고 벨 누르기');
  const [customRiderRequest, setCustomRiderRequest] = useState('');
  const [shopRequest, setShopRequest] = useState('');

  const riderOptions = [
    '문 앞에 두고 벨 누르기',
    '벨 누르지 말고 문 앞에 두기',
    '직접 수령',
    '직접 입력',
  ];

  // 3. 결제 방식 및 카드 등록 상태
  const [paymentMethod, setPaymentMethod] = useState<'quickpay' | 'card' | 'meet'>('quickpay');
  
  // 바이브페이 전용 등록 카드
  const [registeredCard, setRegisteredCard] = useState<CardInfo | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);

  // 다중 신용카드 상태
  const [creditCards, setCreditCards] = useState<CreditCardInfo[]>([]);
  const [selectedCreditCardId, setSelectedCreditCardId] = useState<string>('');
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

  // 로컬 스토리지 데이터 로드
  useEffect(() => {
    // 최근 저장한 주소록 불러오기
    const savedHome = localStorage.getItem('addr_book_home');
    const savedOffice = localStorage.getItem('addr_book_office');
    const savedSchool = localStorage.getItem('addr_book_school');
    setAddressBook({
      home: savedHome || '부산 해운대구 우동 마린시티 해원로 35 (자이아파트)',
      office: savedOffice || '부산 해운대구 센텀동로 9 벡스코 스페이스',
      school: savedSchool || '부산 해운대구 달맞이길 117 해운대중학교 정문',
    });

    // 기본 최초 주소 설정
    setAddress(savedHome || '부산 해운대구 우동 마린시티 해원로 35 (자이아파트)');

    // 등록 바이브페이 카드 정보 불러오기
    const savedCard = localStorage.getItem('registered_card');
    if (savedCard) {
      try {
        setRegisteredCard(JSON.parse(savedCard));
      } catch (e) {
        console.error(e);
      }
    }

    // 등록 신용카드 다중 리스트 불러오기
    const savedCreditCards = localStorage.getItem('registered_credit_cards');
    if (savedCreditCards) {
      try {
        const parsed = JSON.parse(savedCreditCards);
        setCreditCards(parsed);
        if (parsed.length > 0) {
          setSelectedCreditCardId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 주소록 탭 전환 처리
  const handleTabChange = (tab: 'home' | 'office' | 'school') => {
    setAddressTab(tab);
    setAddress(addressBook[tab]);
  };

  // 현재 입력된 주소를 선택된 탭 주소로 저장
  const handleSaveCurrentAddress = () => {
    if (!address.trim()) {
      alert('저장할 주소를 입력해주세요.');
      return;
    }
    const updatedBook = { ...addressBook, [addressTab]: address };
    setAddressBook(updatedBook);
    localStorage.setItem(`addr_book_${addressTab}`, address);
    alert(`⭐ 입력하신 주소가 주소록 [${addressTab === 'home' ? '집' : addressTab === 'office' ? '회사' : '학교'}]에 저장되었습니다.`);
  };

  // 바이브페이 카드 등록 실행
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
    alert('💳 간편 결제용 바이브페이 카드가 성공적으로 등록되었습니다.');
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
    setSelectedCreditCardId(newCard.id);
    setShowCreditCardModal(false);

    // 폼 클리어
    setCcAlias('');
    setCcNumber('');
    setCcExpiry('');
    alert(`💳 [${ccAlias}] 신용카드가 자산 목록에 추가되었습니다.`);
  };

  // 신용카드 삭제 실행
  const handleDeleteCreditCard = (idToDelete: string) => {
    if (!confirm('선택한 신용카드를 삭제하시겠습니까?')) return;
    const updatedList = creditCards.filter((c) => c.id !== idToDelete);
    setCreditCards(updatedList);
    localStorage.setItem('registered_credit_cards', JSON.stringify(updatedList));
    if (selectedCreditCardId === idToDelete) {
      setSelectedCreditCardId(updatedList.length > 0 ? updatedList[0].id : '');
    }
    alert('🗑️ 신용카드가 삭제되었습니다.');
  };

  // 주문 전송 핸들러
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('배달받으실 주소를 정확히 입력해주세요.');
      return;
    }

    if (paymentMethod === 'quickpay' && !registeredCard) {
      setError('바이브페이 빠른 결제를 이용하시려면 먼저 카드를 등록해주세요.');
      return;
    }

    if (paymentMethod === 'card' && creditCards.length === 0) {
      setError('신용카드 결제를 이용하시려면 먼저 1개 이상의 신용카드를 등록/선택해 주세요.');
      return;
    }

    // 1. 로그인 세션 확인
    try {
      const checkRes = await fetch('/api/auth/me');
      if (!checkRes.ok) {
        alert('주문을 진행하려면 로그인이 필요합니다.');
        router.push('/login?redirect=/cart');
        return;
      }
    } catch (err) {
      setError('인증 확인 중 오류가 발생했습니다.');
      return;
    }

    setLoading(true);

    const finalRiderRequest = riderRequestType === '직접 입력' ? customRiderRequest : riderRequestType;

    try {
      // 2. 주문 생성 API 호출
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          address,
          totalPrice: cartTotalPrice,
          riderRequest: finalRiderRequest,
          shopRequest: shopRequest || '없음',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '주문 생성에 실패했습니다.');
      }

      // 주소 자동보관
      localStorage.setItem('last_delivery_address', address);

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
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-dark)' }}>
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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '24px', color: 'var(--text-dark)' }}>주문하기</h1>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* 왼쪽: 장바구니 아이템 요약 목록 */}
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
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-dark)', marginTop: '4px' }}>
              🏪 {restaurantName}
            </h2>
          </div>

          {cartItems.map((item) => (
            <div
              key={item.cartItemId}
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
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)' }}>{item.name}</h3>
                  
                  {/* 선택된 옵션들 렌더링 추가 */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', marginBottom: '6px' }}>
                      {item.selectedOptions.map((opt, idx) => (
                        <span key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          ➕ {opt}
                        </span>
                      ))}
                    </div>
                  )}

                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {item.price.toLocaleString('ko-KR')}원
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="btn"
                    style={{ padding: '6px 12px', background: 'transparent', borderRadius: '0' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 12px', fontSize: '0.95rem', fontWeight: '700', minWidth: '32px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="btn"
                    style={{ padding: '6px 12px', background: 'transparent', borderRadius: '0' }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.cartItemId)}
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

        {/* 오른쪽: 배송 정보 및 요청사항, 결제 수단 */}
        <div style={{ flex: '1 1 380px' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-dark)' }}>
              결제 및 배송지 정보
            </h2>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
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
              
              {/* 1. 주소록 및 주소 입력 */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label">배달 주소 (주소록)</label>
                  
                  {/* 주소록 탭 버튼 */}
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                    {(['home', 'office', 'school'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleTabChange(tab)}
                        style={{
                          border: 'none',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: addressTab === tab ? 'var(--primary)' : 'transparent',
                          color: addressTab === tab ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {tab === 'home' ? '🏠 집' : tab === 'office' ? '🏢 회사' : '🏫 학교'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="배달받으실 주소를 입력해주세요"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSaveCurrentAddress}
                    className="btn btn-secondary"
                    style={{ padding: '0 12px', fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    ⭐ 주소저장
                  </button>
                </div>
              </div>

              {/* 2. 가게 요청사항 (음식 조리 관련) */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">가게 요청사항 (음식 조리)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 덜 맵게 해주세요, 단무지 빼주세요"
                  value={shopRequest}
                  onChange={(e) => setShopRequest(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* 3. 배달기사 요청사항 (수령 방법 관련) */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">배달기사 요청사항</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {riderOptions.map((option) => (
                    <label
                      key={option}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.88rem',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: riderRequestType === option ? 'rgba(234, 88, 12, 0.06)' : '#f8fafc',
                        border: `1px solid ${riderRequestType === option ? 'var(--primary)' : '#e2e8f0'}`,
                        transition: 'var(--transition-smooth)',
                      }}
                    >
                      <input
                        type="radio"
                        name="riderRequest"
                        value={option}
                        checked={riderRequestType === option}
                        onChange={() => setRiderRequestType(option)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>

                {riderRequestType === '직접 입력' && (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="배달 기사님께 전할 요청사항을 입력해주세요"
                    value={customRiderRequest}
                    onChange={(e) => setCustomRiderRequest(e.target.value)}
                    style={{ marginTop: '8px' }}
                    disabled={loading}
                    required
                  />
                )}
              </div>

              {/* 4. 결제 수단 선택 및 자산 패널 */}
              <div className="form-group" style={{ marginBottom: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <label className="form-label">결제 수단</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  {(['quickpay', 'card', 'meet'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        border: 'none',
                        padding: '12px 6px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        background: paymentMethod === method ? 'var(--primary)' : '#f1f5f9',
                        color: paymentMethod === method ? '#fff' : 'var(--text-muted)',
                        boxShadow: paymentMethod === method ? '0 4px 10px var(--primary-glow)' : 'none',
                        transition: 'var(--transition-smooth)',
                      }}
                    >
                      {method === 'quickpay' ? '⚡ 바이브페이' : method === 'card' ? '💳 신용카드' : '🤝 만나서결제'}
                    </button>
                  ))}
                </div>

                {/* A. 바이브페이 선택 시 간편 카드 상태 위젯 */}
                {paymentMethod === 'quickpay' && (
                  <div style={{ marginTop: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    {registeredCard ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>등록된 카드</span>
                          <strong style={{ color: 'var(--text-dark)', fontSize: '0.92rem' }}>
                            💳 {registeredCard.company} ({registeredCard.number})
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCardModal(true)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--secondary)',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          변경
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                          등록된 결제용 카드가 없습니다.
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCardModal(true)}
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '6px' }}
                        >
                          💳 간편 결제 카드 등록하기
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* B. 일반 신용카드 선택 시 다중 신용카드 선택 및 관리 패널 구현 */}
                {paymentMethod === 'card' && (
                  <div style={{ marginTop: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    {creditCards.length > 0 ? (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>결제할 신용카드 선택</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                          <select
                            value={selectedCreditCardId}
                            onChange={(e) => setSelectedCreditCardId(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              color: 'var(--text-dark)',
                              background: '#fff',
                              fontSize: '0.88rem',
                              fontWeight: '700'
                            }}
                          >
                            {creditCards.map((cc) => (
                              <option key={cc.id} value={cc.id}>
                                {cc.alias} - {cc.company} ({cc.number})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDeleteCreditCard(selectedCreditCardId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              padding: '8px'
                            }}
                          >
                            삭제
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCreditCardModal(true)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.82rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'block',
                            margin: '0 auto'
                          }}
                        >
                          ➕ 새 신용카드 등록하기
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                          등록된 신용카드가 존재하지 않습니다.
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCreditCardModal(true)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '6px' }}
                        >
                          ➕ 새 카드 등록 및 자산추가
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 금액 요약 */}
              <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>주문금액</span>
                  <span>{cartTotalPrice.toLocaleString('ko-KR')}원</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>배달팁</span>
                  <span style={{ color: 'var(--success)' }}>0원 (무료 배달 이벤트!)</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    color: 'var(--text-dark)',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <span>총 결제금액</span>
                  <span style={{ color: 'var(--primary)' }}>{cartTotalPrice.toLocaleString('ko-KR')}원</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? '주문 처리 중...' : paymentMethod === 'quickpay' ? '⚡ 원클릭 결제 및 주문하기' : '결제 및 주문하기'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 5. 바이브페이 카드 등록 모달 */}
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

      {/* 6. 다중 신용카드 등록 모달 */}
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

            {/* 신용카드용 실물 모형 그래픽 */}
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

              {/* 은빛 IC 칩 모형 */}
              <div
                style={{
                  width: '38px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
                  borderRadius: '6px',
                  margin: '12px 0 4px 0',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.08)'
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
    </div>
  );
}
