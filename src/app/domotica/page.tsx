import type { Metadata } from 'next';
import Footer from '@/components/site/Footer';
import Header from '@/components/site/Header';
import { DomoticaConsultaForm } from '@/components/site/DomoticaConsultaForm';
import { DomoticaHero } from '@/components/site/DomoticaHero';

export const metadata: Metadata = {
  title: 'Domótica avanzada con Home Assistant | T&V Servicios',
  description:
    'Diseñamos e implantamos ecosistemas inteligentes a medida con Home Assistant como núcleo central. Integración total, local y sin dependencia de la nube.'
};

export default function DomoticaPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <Header />
      <main className="bg-white">
        <DomoticaHero />
        <DomoticaConsultaForm />
      </main>
      <Footer />
    </div>
  );
}
