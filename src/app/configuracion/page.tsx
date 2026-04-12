'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { Empresa } from '@/types';

export default function ConfiguracionPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const toast = useToast();
  useEffect(() => { supabase.from('empresa').select('*').limit(1).single().then(({ data }) => setEmpresa(data as Empresa)); }, []);
  if (!empresa) return null;
  return <Card>
    <div className="grid gap-2 md:grid-cols-2">
      <Input value={empresa.nombre} onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })} />
      <Input value={empresa.nif ?? ''} onChange={(e) => setEmpresa({ ...empresa, nif: e.target.value })} />
      <Input value={empresa.direccion ?? ''} onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })} />
      <Input value={empresa.telefono ?? ''} onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })} />
      <Input value={empresa.email ?? ''} onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })} />
      <Input value={empresa.iban ?? ''} onChange={(e) => setEmpresa({ ...empresa, iban: e.target.value })} />
      <textarea className="col-span-2 rounded border border-[#30363d] bg-[#0d1117] p-2" rows={6} value={empresa.condiciones_pdf ?? ''} onChange={(e) => setEmpresa({ ...empresa, condiciones_pdf: e.target.value })} />
    </div>
    <div className="mt-3"><Button onClick={async () => {
      const { error } = await supabase.from('empresa').update({
        nombre: empresa.nombre, nif: empresa.nif, direccion: empresa.direccion, telefono: empresa.telefono, email: empresa.email, iban: empresa.iban, condiciones_pdf: empresa.condiciones_pdf
      }).eq('id', empresa.id);
      if (error) toast.error(error.message); else toast.ok('Guardado');
    }}>Guardar cambios</Button></div>
  </Card>;
}
