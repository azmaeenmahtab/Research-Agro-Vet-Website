'use client';

import React from 'react';
import { ToastProvider } from '@heroui/react';

export default function HeroToastProvider() {
  return <ToastProvider placement="top end" />;
}

