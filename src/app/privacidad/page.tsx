import type { Metadata } from 'next';
import Footer from '@/components/site/Footer';
import Header from '@/components/site/Header';
import { PrivacidadMain } from '@/components/site/PrivacidadMain';

export const metadata: Metadata = {
  title: 'Políticas de privacidad',
  description: 'Políticas de privacidad de limpiezasuelosradiantes.com.'
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <Header />
      <PrivacidadMain />
      <Footer />
    </div>
  );
}
