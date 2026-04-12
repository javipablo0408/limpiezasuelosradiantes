import type { Metadata } from 'next';
import Footer from '@/components/site/Footer';
import Header from '@/components/site/Header';
import { AstroHomeMain } from '@/components/site/AstroHomeMain';

export const metadata: Metadata = {
  title: 'Limpieza profesional de suelo radiante | TSV Servicios',
  description:
    'Recupera la eficiencia de tu suelo radiante con una limpieza/desfangado profesional. Solicita presupuesto técnico en PDF.'
};

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <Header />
      <AstroHomeMain />
      <Footer />
    </div>
  );
}
