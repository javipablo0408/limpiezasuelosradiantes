'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PresupuestosPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/solicitudes');
  }, [router]);
  return null;
}
