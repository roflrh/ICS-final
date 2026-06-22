'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  cartItemId: string;       // 고유 ID (menuId + 옵션 이름 조인)
  menuId: string;
  name: string;
  price: number;            // 옵션이 추가된 최종 단가
  quantity: number;
  imageUrl: string;
  selectedOptions?: string[]; // 선택된 옵션 목록 (예: ["치즈 추가 (+1,500원)"])
}

interface CartContextType {
  cartItems: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addToCart: (item: Omit<CartItem, 'quantity'>, rId: string, rName: string) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalPrice: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  // 로컬 스토리지에서 장바구니 불러오기
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedRestId = localStorage.getItem('cart_restaurant_id');
    const savedRestName = localStorage.getItem('cart_restaurant_name');

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('장바구니 파싱 오류:', e);
      }
    }
    if (savedRestId) setRestaurantId(savedRestId);
    if (savedRestName) setRestaurantName(savedRestName);
  }, []);

  // 장바구니 상태 변경 시 로컬 스토리지 저장
  const saveToLocalStorage = (items: CartItem[], rId: string | null, rName: string | null) => {
    localStorage.setItem('cart', JSON.stringify(items));
    if (rId) localStorage.setItem('cart_restaurant_id', rId);
    else localStorage.removeItem('cart_restaurant_id');

    if (rName) localStorage.setItem('cart_restaurant_name', rName);
    else localStorage.removeItem('cart_restaurant_name');
  };

  // 장바구니 담기
  const addToCart = (
    item: Omit<CartItem, 'quantity'>,
    rId: string,
    rName: string
  ): boolean => {
    // 다른 식당의 메뉴를 담는 경우 기존 장바구니 비우기 안내
    if (restaurantId && restaurantId !== rId) {
      const confirmClear = window.confirm(
        `장바구니에는 같은 식당의 메뉴만 담을 수 있습니다.\n'${restaurantName}'의 메뉴를 비우고 '${rName}'의 메뉴를 담으시겠습니까?`
      );
      if (!confirmClear) return false;

      // 비우고 새로 추가
      const newItems = [{ ...item, quantity: 1 }];
      setCartItems(newItems);
      setRestaurantId(rId);
      setRestaurantName(rName);
      saveToLocalStorage(newItems, rId, rName);
      return true;
    }

    // 동일 식당이거나 장바구니가 비어있는 경우
    setCartItems((prevItems) => {
      // 이제 cartItemId 기준으로 동일 상품 검색 (옵션 조합이 동일한지 판단)
      const existingItem = prevItems.find((i) => i.cartItemId === item.cartItemId);
      let newItems;

      if (existingItem) {
        // 이미 완전히 같은 옵션 조합이면 수량만 증가
        newItems = prevItems.map((i) =>
          i.cartItemId === item.cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        // 다른 옵션 조합이거나 아예 새 상품이면 신규 배치
        newItems = [...prevItems, { ...item, quantity: 1 }];
      }

      setRestaurantId(rId);
      setRestaurantName(rName);
      saveToLocalStorage(newItems, rId, rName);
      return newItems;
    });

    return true;
  };

  // 장바구니에서 특정 아이템 제거 (cartItemId 기준)
  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.cartItemId !== cartItemId);
      
      // 장바구니가 텅 비면 식당 정보도 초기화
      const nextRestId = newItems.length === 0 ? null : restaurantId;
      const nextRestName = newItems.length === 0 ? null : restaurantName;
      
      setRestaurantId(nextRestId);
      setRestaurantName(nextRestName);
      saveToLocalStorage(newItems, nextRestId, nextRestName);
      return newItems;
    });
  };

  // 수량 조절 (cartItemId 기준)
  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      );
      saveToLocalStorage(newItems, restaurantId, restaurantName);
      return newItems;
    });
  };

  // 장바구니 비우기
  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    saveToLocalStorage([], null, null);
  };

  // 총액 합계 계산
  const cartTotalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 총 상품 갯수 계산
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        restaurantName,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalPrice,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart는 CartProvider 내에서 사용되어야 합니다.');
  }
  return context;
}
