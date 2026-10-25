'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productId: string;
  nameEn: string;
  nameBn?: string | null;
  packSize: string;
  sku: string;
  tradePrice: number;
  mrpPrice: number;
  sellingPrice: number;
  quantity: number;
  image?: string;
  minWholesaleQty?: number | null;
}

interface CartStore {
  items: CartItem[];
  buyerMode: 'RETAIL' | 'WHOLESALE';
  isCartDrawerOpen: boolean;
  customerDraft: {
    name: string;
    phone: string;
    district: string;
    upazila: string;
    address: string;
  };
  setBuyerMode: (mode: 'RETAIL' | 'WHOLESALE') => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerDraft: (draft: Partial<CartStore['customerDraft']>) => void;
  getCartSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      buyerMode: 'RETAIL',
      isCartDrawerOpen: false,
      customerDraft: {
        name: '',
        phone: '',
        district: '',
        upazila: '',
        address: '',
      },
      setBuyerMode: (mode) => set({ buyerMode: mode }),
      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find((item) => item.variantId === newItem.variantId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variantId === newItem.variantId
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
              isCartDrawerOpen: true,
            };
          }
          return { items: [...state.items, newItem], isCartDrawerOpen: true };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.variantId !== variantId)
              : state.items.map((item) =>
                  item.variantId === variantId ? { ...item, quantity } : item
                ),
        })),
      clearCart: () => set({ items: [] }),
      setCustomerDraft: (draft) =>
        set((state) => ({
          customerDraft: { ...state.customerDraft, ...draft },
        })),
      getCartSubtotal: () => {
        const { items, buyerMode } = get();
        return items.reduce((sum, item) => {
          const unitPrice = buyerMode === 'WHOLESALE' ? item.tradePrice : item.sellingPrice;
          return sum + unitPrice * item.quantity;
        }, 0);
      },
      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'agro-vet-cart',
    }
  )
);
