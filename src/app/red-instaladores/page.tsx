import type { Metadata } from 'next';
import Footer from '@/components/site/Footer';
import Header from '@/components/site/Header';
import { RedInstaladoresMain } from '@/components/site/RedInstaladoresMain';

export const metadata: Metadata = {
  title: 'Red de instaladores | Únete como técnico',
  description:
    'En T&V Servicios buscamos profesionales de confianza para unirse a nuestra red. Rellena el formulario y nos pondremos en contacto contigo.'
};

export default function RedInstaladoresPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <Header />
      <RedInstaladoresMain />
      <Footer />
    </div>
  );
}
