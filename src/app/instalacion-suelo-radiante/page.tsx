import type { Metadata } from 'next';
import Footer from '@/components/site/Footer';
import Header from '@/components/site/Header';
import { InstalacionSueloRadianteMain } from '@/components/site/InstalacionSueloRadianteMain';

export const metadata: Metadata = {
  title: 'Instalación de Suelo Radiante en Madrid | T&V Servicios y Complementos',
  description:
    'Instalamos suelo radiante y refrescante en Madrid y alrededores. Sistemas llave en mano, enfoque técnico e inteligente.'
};

export default function InstalacionSueloRadiantePage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <Header />
      <InstalacionSueloRadianteMain />
      <Footer />
    </div>
  );
}
