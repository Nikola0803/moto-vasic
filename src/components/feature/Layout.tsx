import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import TrustStrip from './TrustStrip';
import StickyMobileBar from './StickyMobileBar';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {!isHome && (
        <div className="mt-16 md:mt-[72px] lg:mt-[108px]">
          <TrustStrip />
        </div>
      )}
      <main className="flex-1 pb-[72px] md:pb-0">
        {children}
      </main>
      <Footer />
      <StickyMobileBar />
    </div>
  );
}
