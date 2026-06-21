'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menu: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  status: 'PENDING' | 'PREPARING' | 'DELIVERING' | 'COMPLETED';
  totalPrice: number;
  address: string;
  riderRequest?: string | null;
  shopRequest?: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

const STATUS_MAP = {
  PENDING: { label: '접수 대기', step: 1, color: 'var(--warning)' },
  PREPARING: { label: '조리 중', step: 2, color: 'var(--info)' },
  DELIVERING: { label: '배달 중', step: 3, color: 'var(--secondary)' },
  COMPLETED: { label: '배달 완료', step: 4, color: 'var(--success)' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  // 주문 내역 가져오기
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      } else if (res.status === 401) {
        // 인증 실패 시 로그인으로 리다이렉트
        router.push('/login?redirect=/orders');
      }
    } catch (e) {
      console.error('주문 목록 페칭 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  // 데모 시뮬레이션용 주문 상태 한 단계 진전시키기
  const handleAdvanceStatus = async (orderId: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'];

    if (currentStatus === 'PENDING') nextStatus = 'PREPARING';
    else if (currentStatus === 'PREPARING') nextStatus = 'DELIVERING';
    else if (currentStatus === 'DELIVERING') nextStatus = 'COMPLETED';
    else return; // 이미 완료됨

    setUpdatingId(orderId);

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        // 프론트엔드 상태 즉각 업데이트
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: nextStatus } : order
          )
        );
      } else {
        alert('주문 상태 변경에 실패했습니다.');
      }
    } catch (e) {
      console.error('상태 전이 중 오류:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        주문 내역을 신속히 배달받는 중... 🛵
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '16px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '4rem', marginBottom: '24px', display: 'block' }}>📦</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-dark)' }}>
            주문 내역이 없습니다.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
            아직 주문하신 기록이 존재하지 않습니다. 첫 주문을 접수해 보세요!
          </p>
          <button onClick={() => router.push('/')} className="btn btn-primary" style={{ padding: '12px 32px' }}>
            첫 주문하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '24px', color: 'var(--text-dark)' }}>내 주문 내역</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {orders.map((order) => {
          const currentStatusInfo = STATUS_MAP[order.status];
          const orderDate = new Date(order.createdAt).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={order.id}
              className="glass-panel"
              style={{
                padding: '28px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* 주문 헤더 정보 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>주문 일시: {orderDate}</span>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                    주문 ID: {order.id}
                  </div>
                </div>

                {/* 실시간 뱃지 */}
                <span className={`badge badge-${order.status.toLowerCase()}`}>
                  ● {currentStatusInfo.label}
                </span>
              </div>

              {/* 주문 상품 상세 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {order.orderItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={item.menu.imageUrl}
                        alt={item.menu.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid var(--panel-border)',
                        }}
                      />
                      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-dark)' }}>
                        {item.menu.name} <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>x {item.quantity}</span>
                      </span>
                    </div>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                      {(item.price * item.quantity).toLocaleString('ko-KR')}원
                    </span>
                  </div>
                ))}
              </div>

              {/* 배송지 및 총액 정보 */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>📍 배달 주소 : </span>
                    <span style={{ color: 'var(--text-dark)' }}>{order.address}</span>
                  </div>
                  {order.shopRequest && order.shopRequest !== '없음' && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>👨‍🍳 가게 요청사항 : </span>
                      <span style={{ color: 'var(--text-dark)', fontWeight: '500' }}>{order.shopRequest}</span>
                    </div>
                  )}
                  {order.riderRequest && (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>🛵 라이더 요청사항 : </span>
                      <span style={{ color: 'var(--text-dark)', fontWeight: '500' }}>{order.riderRequest}</span>
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>결제 금액 : </span>
                  <strong style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>
                    {order.totalPrice.toLocaleString('ko-KR')}원
                  </strong>
                </div>
              </div>

              {/* 타임라인 상태 바 */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '0 10px' }}>
                  {/* 진행 라인 배경 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '0',
                      right: '0',
                      height: '4px',
                      background: '#e2e8f0',
                      zIndex: 1,
                    }}
                  />
                  {/* 활성화된 진행 라인 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '0',
                      width: `${((currentStatusInfo.step - 1) / 3) * 100}%`,
                      height: '4px',
                      background: currentStatusInfo.color,
                      zIndex: 2,
                      transition: 'all 0.5s ease',
                    }}
                  />

                  {/* 타임라인 각 단계 노드 */}
                  {Object.entries(STATUS_MAP).map(([key, value]) => {
                    const isActive = STATUS_MAP[order.status].step >= value.step;
                    const isCurrent = order.status === key;
                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: 3,
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isActive ? value.color : '#cbd5e1',
                            border: '4px solid #ffffff',
                            boxShadow: isActive ? `0 0 10px ${value.color}` : 'none',
                            transition: 'all 0.5s ease',
                            animation: isCurrent ? 'statusPulse 2s infinite ease-in-out' : 'none',
                            ...({ '--pulse-color': value.color } as React.CSSProperties),
                          }}
                        />
                        <span
                          style={{
                            marginTop: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: isActive ? 'var(--text-dark)' : 'var(--text-muted)',
                            transition: 'all 0.5s ease',
                          }}
                        >
                          {value.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 시뮬레이션 액션 컨트롤러 */}
              {order.status !== 'COMPLETED' && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '16px',
                  }}
                >
                  <button
                    onClick={() => handleAdvanceStatus(order.id, order.status)}
                    className="btn btn-secondary"
                    disabled={updatingId === order.id}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: 'var(--secondary)',
                    }}
                  >
                    {updatingId === order.id ? '상태 갱신 중...' : '⚙️ 데모용: 배달 상태 진전시키기'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 펄스 애니메이션 키프레임 */}
      <style>{`
        @keyframes statusPulse {
          0% {
            box-shadow: 0 0 4px var(--pulse-color);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 18px var(--pulse-color);
            transform: scale(1.15);
          }
          100% {
            box-shadow: 0 0 4px var(--pulse-color);
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
