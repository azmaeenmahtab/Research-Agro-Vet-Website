// Centralized window.dataLayer dispatcher for GTM, Google Ads, and Meta Pixel

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type AnalyticsEvent =
  | {
      event: 'view_item';
      ecommerce: {
        currency: 'BDT';
        value: number;
        items: Array<{
          item_id: string;
          item_name: string;
          item_variant?: string;
          price: number;
          quantity: number;
        }>;
      };
      analyticsEventId?: string;
    }
  | {
      event: 'add_to_cart';
      ecommerce: {
        currency: 'BDT';
        value: number;
        items: Array<{
          item_id: string;
          item_name: string;
          item_variant?: string;
          price: number;
          quantity: number;
        }>;
      };
      analyticsEventId?: string;
    }
  | {
      event: 'begin_checkout';
      ecommerce: {
        currency: 'BDT';
        value: number;
        items: Array<{
          item_id: string;
          item_name: string;
          item_variant?: string;
          price: number;
          quantity: number;
        }>;
      };
      analyticsEventId?: string;
    }
  | {
      event: 'purchase';
      ecommerce: {
        transaction_id: string;
        currency: 'BDT';
        value: number;
        shipping?: number;
        items: Array<{
          item_id: string;
          item_name: string;
          item_variant?: string;
          price: number;
          quantity: number;
        }>;
      };
      analyticsEventId: string;
    };

export function dispatchDataLayer(payload: AnalyticsEvent): void {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload as Record<string, unknown>);
  }
}
