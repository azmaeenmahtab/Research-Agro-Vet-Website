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
  inStock?: boolean;
  isAvailable?: boolean;
  isPurchasable?: boolean;
  statusMessage?: string | null;
  hasDiscount?: boolean;
  discountPercent?: number;
  discountType?: 'INDIVIDUAL' | 'UNIVERSAL' | 'NONE';
}

interface CartStore {
  items: CartItem[];
  buyerMode: 'RETAIL' | 'WHOLESALE';
  isCartDrawerOpen: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
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
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      buyerMode: 'RETAIL',
      isCartDrawerOpen: false,
      isSyncing: false,
      lastSyncTime: null,
      customerDraft: {
        name: '',
        phone: '',
        district: '',
        upazila: '',
        address: '',
      },
      setBuyerMode: (mode) => set({ buyerMode: mode }),
      openCartDrawer: () => {
        set({ isCartDrawerOpen: true });
        // Sync in background when drawer is opened to guarantee real-time prices & stock
        get().syncWithServer();
      },
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      addItem: (newItem) => {
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
        });
        // Sync real-time inventory and discount pricing
        get().syncWithServer();
      },
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
      syncWithServer: async () => {
        const { items, isSyncing } = get();
        if (items.length === 0 || isSyncing) return;

        set({ isSyncing: true });
        try {
          const res = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
            }),
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            const serverMap = new Map<string, any>(data.items.map((i: any) => [i.variantId, i]));
            set((state) => ({
              items: state.items.map((localItem) => {
                const s = serverMap.get(localItem.variantId);
                if (!s) return localItem;
                return {
                  ...localItem,
                  nameEn: s.nameEn || localItem.nameEn,
                  nameBn: s.nameBn !== undefined ? s.nameBn : localItem.nameBn,
                  mrpPrice: s.mrpPrice !== undefined ? s.mrpPrice : localItem.mrpPrice,
                  sellingPrice: s.sellingPrice !== undefined ? s.sellingPrice : localItem.sellingPrice,
                  tradePrice: s.tradePrice !== undefined ? s.tradePrice : localItem.tradePrice,
                  inStock: s.inStock !== false,
                  isAvailable: s.isAvailable !== false,
                  isPurchasable: s.isPurchasable !== false,
                  statusMessage: s.statusMessage || null,
                  hasDiscount: Boolean(s.hasDiscount),
                  discountPercent: s.discountPercent || 0,
                  discountType: s.discountType || 'NONE',
                  image: s.image || localItem.image,
                };
              }),
              lastSyncTime: Date.now(),
            }));
          }
        } catch (err) {
          console.warn('Real-time cart sync failed:', err);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'agro-vet-cart',
      onRehydrateStorage: () => (state) => {
        // Automatically sync cart items with live database when page loads on user's device
        if (state && state.items.length > 0) {
          setTimeout(() => {
            state.syncWithServer();
          }, 100);
        }
      },
    }
  )
);
