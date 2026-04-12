'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

const CACHE_KEY = 'admin_has_session';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) throw error;

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionEmail = sessionData.session?.user?.email?.trim() ?? data.session?.user?.email?.trim() ?? email.trim();
      if (!sessionEmail) {
        throw new Error('No se pudo obtener el email de la sesión');
      }

      const { data: usuario, error: uErr } = await supabase
        .from('usuarios')
        .select('rol,activo')
        .eq('email', sessionEmail)
        .maybeSingle();

      if (uErr) throw uErr;
      if (!usuario?.activo) {
        await supabase.auth.signOut();
        sessionStorage.setItem(CACHE_KEY, '0');
        toast.error('Tu usuario no está dado de alta o no está activo en el panel');
        return;
      }

      sessionStorage.setItem(CACHE_KEY, '1');
      toast.ok('Sesión iniciada');
      const dest = usuario.rol === 'tecnico' ? '/calendario' : '/dashboard';
      router.replace(dest);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Acceso al panel</h1>
        <p className="mt-1 text-sm text-[#8b949e]">Inicia sesión con tu usuario de Supabase.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Card>
  );
}
