import React, { Suspense } from 'react';
import OrderSuccessView from '@/components/storefront/OrderSuccessView';

export const metadata = {
  title: 'Order Confirmed — Research Agro Vet',
  description: 'Your order has been successfully placed with Research Agro Vet.',
};

async function OrderSuccessContent({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <OrderSuccessView orderNumber={orderNumber} />;
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#005d42] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent params={params} />
    </Suspense>
  );
}
