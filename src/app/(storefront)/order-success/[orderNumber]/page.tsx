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

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  return <OrderSuccessContent params={params} />;
}
