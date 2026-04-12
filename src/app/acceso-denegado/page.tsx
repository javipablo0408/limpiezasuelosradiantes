'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

export default function AccesoDenegadoPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="space-y-4 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
          <AlertTriangle size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Acceso denegado</h1>
          <p className="mt-2 text-sm text-[#8b949e]">
            Tu usuario no tiene permisos para acceder a esta sección del panel.
            Si crees que es un error, contacta con un administrador.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Link href="/dashboard">
            <Button variant="secondary">Volver al dashboard</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </Card>
    </div>
  );
}
