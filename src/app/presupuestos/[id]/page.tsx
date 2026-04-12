'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PresupuestoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? '');

  useEffect(() => {
    router.replace(`/solicitudes/${id}`);
  }, [id, router]);

  return null;
}
