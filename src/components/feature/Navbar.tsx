import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// NOVI LOGO — zameni ovaj URL kad uploaduješ logo u Readdy dashboard
const LOGO_URL = 'https://storage.readdy-site.link/project_files/61fdb422-0dcb-4eb0-a45b-7b7a91c25d08/4eaf9fa5-e52a-4de5-88f1-997a451d5a99_unnamed.png?v=2e5f0fe86ca25632eb8fd2a1cbcfdd14';

export default function Navbar() {
  const { t } = useTranslation('common');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const navBg = scrolled || !isHome
    ? 'bg-[#1A1A1A]/95 backdrop-blur-md shadow-lg'
    : 'bg-[#1A1A1A]/80 backdrop-blur-sm';

  const navLinks = [
    { to: '/', label: t('nav_home') },
    { to: '/shop', label: t('nav_shop') },
    { to: '/blog', label: 'Blog' },
    { to: '/o-nama', label: t('nav_about') },
    { to: '/kontakt', label: t('nav_contact') },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?pretraga=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top info bar */}
      <div className="hidden lg:flex items-center justify-between px-4 md:px-10 h-9 bg-[#111] text-white/60 text-[11px]">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <i className="ri-truck-line" />
            Dostava širom Srbije
          </span>
          <span className="flex items-center gap-1.5">
            <i className="ri-hand-coin-line" />
            Plaćanje pouzećem
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:+381621541944" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
            <i className="ri-phone-line" />
            062/1541944
          </a>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5">
            <i className="ri-mail-line" />
            info@motovasic.com
          </span>
        </div>
      </div>

      <header className={`fixed top-0 lg:top-9 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="flex items-center justify-between px-4 md:px-10 h-16 md:h-[72px] max-w-[1440px] mx-auto">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={LOGO_URL}
              alt="Moto Vasić"
              className="h-10 md:h-12 w-auto object-contain drop-shadow-lg"
            />
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži proizvode..."
                className="w-full pl-4 pr-12 py-2.5 bg-white/10 border border-white/20 rounded-lg text-[13px] text-white placeholder-white/40 focus:outline-none focus:border-brand-400 focus:bg-white/15 transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-brand-600 rounded-md hover:bg-brand-500 transition-colors">
                <i className="ri-search-line text-white text-sm" />
              </button>
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-[13px] font-medium tracking-wide transition-all whitespace-nowrap rounded-lg ${
                  location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
                    ? 'text-brand-400 bg-white/10 font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+381621541944"
              className="flex items-center gap-2 text-[13px] font-semibold text-white/90 hover:text-white transition-colors whitespace-nowrap"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-600">
                <i className="ri-phone-line text-white text-sm" />
              </div>
              <span className="hidden xl:inline">062/1541944</span>
            </a>
            <Link
              to="/shop"
              className="bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-all whitespace-nowrap tracking-wide shadow-lg shadow-brand-600/25"
            >
              {t('nav_shop')}
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <i className="ri-search-line text-lg" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <i className={`ri-${mobileOpen ? 'close' : 'menu'}-line text-xl`} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži proizvode..."
                className="w-full pl-4 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-[13px] text-white placeholder-white/40 focus:outline-none focus:border-brand-400"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-brand-600 rounded-lg">
                <i className="ri-search-line text-white text-sm" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#1A1A1A] border-t border-white/10 shadow-2xl">
            <nav className="flex flex-col px-4 py-3 gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`py-3 px-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
                      ? 'text-brand-400 bg-white/10 font-semibold'
                      : 'text-white/80 hover:text-brand-400 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 pt-3 border-t border-white/10">
                <a
                  href="tel:+381621541944"
                  className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-brand-400"
                >
                  <i className="ri-phone-line" />
                  062/1541944
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}