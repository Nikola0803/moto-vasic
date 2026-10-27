import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LOGO_URL = 'https://storage.readdy-site.link/project_files/61fdb422-0dcb-4eb0-a45b-7b7a91c25d08/4eaf9fa5-e52a-4de5-88f1-997a451d5a99_unnamed.png?v=2e5f0fe86ca25632eb8fd2a1cbcfdd14';

export default function Footer() {
  const { t } = useTranslation('common');

  const categories = [
    { name: 'ATV Kvadovi za odrasle', path: '/shop?kategorija=1' },
    { name: 'ATV Kvadovi za decu', path: '/shop?kategorija=2' },
    { name: 'Kros motori za decu', path: '/shop?kategorija=3' },
    { name: 'Bagi za odrasle', path: '/shop?kategorija=42' },
    { name: 'Skuteri', path: '/shop?kategorija=43' },
    { name: 'Rukavice', path: '/shop' },
    { name: 'Kacige', path: '/shop' },
    { name: 'Zaštitna oprema', path: '/shop' },
    { name: 'Rezervni delovi', path: '/shop' },
  ];

  const links = [
    { name: t('nav_home'), path: '/' },
    { name: t('nav_shop'), path: '/shop' },
    { name: 'Blog', path: '/blog' },
    { name: t('nav_about'), path: '/o-nama' },
    { name: t('nav_contact'), path: '/kontakt' },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="px-4 md:px-10 py-14 md:py-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          <div className="space-y-5">
            <img src={LOGO_URL} alt="Moto Vasić" className="h-10 w-auto object-contain drop-shadow-lg" />
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Specijalizovana prodavnica ATV kvadova, kros motora, bagija, skutera i dodatne opreme. Vozila za decu i odrasle — prodaja, servis i rezervni delovi.
            </p>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Više od 20 godina gradimo poverenje sa ljubiteljima adrenalina i moto sporta.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/motovasicnn/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-brand-600 text-gray-400 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <i className="ri-instagram-line text-base" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-[13px] tracking-wide uppercase">Dodatne pogodnosti:</h4>
            <ul className="space-y-3 text-[13px] text-gray-400">
              {[
                'Radimo javna preduzeća',
                'Plaćanje pouzećem za celu Srbiju',
                'Garancija do 24 meseca',
                'Autorizovani servis u Nišu',
                'Besplatan prvi servis (30 dana)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <i className="ri-check-line text-brand-400 text-xs mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-[13px] tracking-wide uppercase">Korisni linkovi:</h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-[13px] text-gray-400 hover:text-brand-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li><Link to="/o-nama" className="text-[13px] text-gray-400 hover:text-brand-400 transition-colors">Politika privatnosti</Link></li>
              <li><Link to="/o-nama" className="text-[13px] text-gray-400 hover:text-brand-400 transition-colors">Reklamacije</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5 text-[13px] tracking-wide uppercase">Prodaja i informacije:</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[13px] text-gray-300">
                <i className="ri-mail-line text-brand-400 text-sm" />
                <span>info@motovasic.com</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-gray-300">
                <i className="ri-map-pin-line text-brand-400 text-sm" />
                <span>Topličkog Partizanskog Odreda 10, Niš 18250</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-gray-300">
                <i className="ri-phone-line text-brand-400 text-sm" />
                <a href="tel:+381621541944" className="hover:text-brand-400 transition-colors">062/1541944</a>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-gray-300">
                <i className="ri-phone-line text-brand-400 text-sm" />
                <a href="tel:+381621541936" className="hover:text-brand-400 transition-colors">062/1541936</a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto mt-10 pt-8 border-t border-white/10">
          <h4 className="font-semibold text-white mb-4 text-[13px] tracking-wide uppercase">Kategorije proizvoda:</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {categories.map((cat) => (
              <Link key={cat.path + cat.name} to={cat.path} className="text-[12px] text-gray-400 hover:text-brand-400 transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 md:px-10 py-5">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            Kolačiće koristimo za poboljšanje iskustva na našoj veb stranici.
          </p>
          <div className="flex items-center gap-3">
            <button className="text-xs text-gray-400 hover:text-white transition-colors">Više informacija</button>
            <button className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">Prihvati</button>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-4 pt-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-white/25">
            Sajt napravio{' '}
            <a href="https://velocity72.com" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-brand-400 transition-colors font-medium">
              Velocity72
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
