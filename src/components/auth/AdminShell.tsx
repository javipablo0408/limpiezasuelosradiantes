'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Spinner } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import type { ReactNode } from 'react';
import type { RolUsuario } from '@/types';

type AuthContextValue = { role: RolUsuario | null; usuarioId: string | null };
const AdminAuthContext = createContext<AuthContextValue>({ role: null, usuarioId: null });

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

const CACHE_KEY = 'admin_has_session';
const tecnicoAllowedRoots = new Set(['/calendario', '/acceso-denegado']);

const PUBLIC_MARKETING = new Set([
  '/',
  '/domotica',
  '/instalacion-suelo-radiante',
  '/solicitar-presupuesto',
  '/privacidad',
  '/red-instaladores'
]);

function isPublicMarketing(pathname: string) {
  return PUBLIC_MARKETING.has(pathname);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const isLoginRoute = pathname === '/login';
  const publicMarketing = isPublicMarketing(pathname);
  const root = `/${pathname.split('/')[1]}`;
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<RolUsuario | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  const contextValue = useMemo(() => ({ role, usuarioId }), [role, usuarioId]);

  useEffect(() => {
    const cachedSession = sessionStorage.getItem(CACHE_KEY) === '1';
    if (cachedSession) {
      setAuthed(true);
      setLoading(false);
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const hasSession = Boolean(data.session);
      setAuthed(hasSession);
      setUserEmail(data.session?.user.email ?? null);
      sessionStorage.setItem(CACHE_KEY, hasSession ? '1' : '0');
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = Boolean(session);
      setAuthed(hasSession);
      setUserEmail(session?.user.email ?? null);
      sessionStorage.setItem(CACHE_KEY, hasSession ? '1' : '0');
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const enforceAccess = async () => {
      if (!authed) {
        setRole(null);
        setUsuarioId(null);
        if (!isLoginRoute && !publicMarketing) router.replace('/login');
        return;
      }

      if (!userEmail) {
        setRole(null);
        setUsuarioId(null);
        if (!isLoginRoute && !publicMarketing) router.replace('/login');
        return;
      }

      const { data, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id,rol,activo')
        .eq('email', userEmail)
        .maybeSingle();

      if (usuarioError) {
        setRole(null);
        setUsuarioId(null);
        if (!isLoginRoute && root !== '/acceso-denegado') router.replace('/acceso-denegado');
        return;
      }

      if (!data || !data.activo) {
        setRole(null);
        setUsuarioId(null);
        if (!isLoginRoute && root !== '/acceso-denegado') router.replace('/acceso-denegado');
        return;
      }

      const currentRole = data.rol as RolUsuario;
      setUsuarioId(data.id as string);
      setRole(currentRole);

      if (isLoginRoute) {
        router.replace(currentRole === 'tecnico' ? '/calendario' : '/dashboard');
        return;
      }

      if (pathname === '/') {
        router.replace(currentRole === 'tecnico' ? '/calendario' : '/dashboard');
        return;
      }

      if (currentRole === 'tecnico' && !tecnicoAllowedRoots.has(root) && !publicMarketing) {
        router.replace('/acceso-denegado');
      }
    };

    void enforceAccess();
  }, [authed, userEmail, isLoginRoute, pathname, publicMarketing, root, router]);

  if (loading) return <Spinner text="Verificando sesión..." />;

  if (isLoginRoute) {
    return (
      <AdminAuthContext.Provider value={contextValue}>
        <main className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </AdminAuthContext.Provider>
    );
  }

  if (publicMarketing && !(pathname === '/' && authed)) {
    return <>{children}</>;
  }

  if (pathname === '/' && authed) {
    return <Spinner text="Abriendo panel..." />;
  }

  if (!authed) return <Spinner text="Redirigiendo al login..." />;

  return (
    <AdminAuthContext.Provider value={contextValue}>
      <div className="flex">
        <div className="no-print">
          <Sidebar />
        </div>
        <div className="min-h-screen flex-1">
          <div className="no-print">
            <Topbar />
          </div>
          <main className="p-4">{children}</main>
        </div>
      </div>
    </AdminAuthContext.Provider>
  );
}
