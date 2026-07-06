import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '@/components/feature/Layout';

const stats = [
  { num: '20+', label: 'Godina iskustva', desc: 'Od 2006. godine poverenje moto entuzijasta' },
  { num: '24+', label: 'Modela vozila', desc: 'U ponudi uvek aktuelni modeli' },
  { num: '1000+', label: 'Zadovoljnih kupaca', desc: 'Poverenje koje gradimo godinama' },
  { num: '6', label: 'Kategorija', desc: 'Sve na jednom mestu' },
];

export default function About() {
  const { t } = useTranslation('common');

  useEffect(() => {
    document.title = 'O nama | Moto Vasić — Više od 20 Godina Iskustva u Prodaji Moto Vozila';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Moto Vasić je porodična firma iz Smedereva sa više od 20 godina iskustva u prodaji ATV kvadova, kros motora, bagija i skutera. Autorizovani servis, garancija i rezervni delovi.');
  }, []);

  return (
    <Layout>
      <div className="pt-20 md:pt-24 lg:pt-32 pb-12 md:pb-16 px-4 md:px-10 bg-[#1A1A1A]">
        <div className="max-w-[1440px] mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-brand-400 mb-4 bg-brand-900/50 px-3 py-1 rounded-full">
              Upoznajte nas
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Više od 20 godina gradimo poverenje sa ljubiteljima <span className="text-brand-400">adrenalina i moto sporta</span>
            </h1>
            <p className="text-[13px] md:text-base text-white/60 leading-relaxed max-w-xl">
              Moto Vasić je specijalizovana prodavnica ATV kvadova, kros motora, bagija, skutera i dodatne opreme za decu i odrasle. Porodična firma posvećena kvalitetu, brzini i vrhunskoj usluzi.
            </p>
          </div>
        </div>
      </div>

      <div className="py-10 md:py-14 px-4 md:px-10 bg-brand-600">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-5xl font-bold text-white mb-2">{stat.num}</p>
              <p className="text-sm font-semibold text-white/90 mb-1">{stat.label}</p>
              <p className="text-[11px] text-white/60">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-16 md:pb-24 px-4 md:px-10 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center py-16 md:py-24">
            <div className="order-2 md:order-1">
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-brand-600 mb-3 bg-brand-50 px-3 py-1 rounded-full">
                Naša priča
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">
                Od porodične radnje do omiljene moto prodavnice
              </h2>
              <div className="space-y-4 text-[13px] md:text-sm text-gray-600 leading-relaxed">
                <p>
                  Moto Vasić je osnovan sa jednostavnom idejom: da svako u Srbiji ima pristup kvalitetnim, sigurnim i zabavnim moto vozilima. Počeli smo kao mala porodična radnja u Smederevu, a danas smo ponosni što smo postali omiljena destinacija hiljada moto entuzijasta širom zemlje.
                </p>
                <p>
                  Sva vozila u našoj ponudi dolaze isključivo od proverenih proizvođača kao što su Tao Motor, sa punim CE i EEC sertifikatima. Verujemo da kupci zaslužuju potpuni mir uma kada kupuju moto vozilo — bilo da je reč o prvom kros motoru za dete ili snažnom ATV kvadu za odrasle.
                </p>
                <p>
                  Nudimo plaćanje pouzećem širom Srbije, besplatnu dostavu za porudžbine preko 50.000 RSD, garanciju do 2 godine i sopstveni autorizovani servis. Naš tim je tu da vam pomogne pri odabiru pravog vozila za vaše potrebe i budžet.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="https://readdy.ai/api/search-image?query=A%20modern%20motorsport%20showroom%20interior%20displaying%20rugged%20ATV%20quad%20bikes%2C%20red%20off-road%20buggies%2C%20mini%20cross%20motorcycles%20and%20scooters%20arranged%20in%20rows%2C%20industrial%20concrete%20floor%20with%20warm%20ambient%20lighting%2C%20professional%20commercial%20interior%20photography%20with%20rich%20earthy%20tones%2C%20premium%20retail%20environment%20for%20motor%20vehicles%2C%20no%20people&width=600&height=500&seq=moto-about&orientation=landscape"
                alt="Moto Vasić prodavnica"
                className="w-full rounded-2xl object-cover aspect-[4/3]"
              />
            </div>
          </div>

          <div className="py-12 md:py-16">
            <div className="text-center mb-10 md:mb-14">
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-brand-600 mb-3 bg-brand-50 px-3 py-1 rounded-full">
                Naše vrednosti
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Zašto kupci veruju Moto Vasić?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {[
                { icon: 'ri-verified-badge-line', title: 'Originalni proizvodi', desc: 'Samo provereni brendovi kao Tao Motor sa CE i EEC sertifikatima. Bez kopija, bez kompromisa.' },
                { icon: 'ri-shield-check-line', title: 'Sigurnost na prvom mestu', desc: 'Sva vozila ispunjavaju evropske bezbednosne standarde. Detaljno testirana pre prodaje.' },
                { icon: 'ri-truck-line', title: 'Dostava širom Srbije', desc: '2-5 radnih dana. Besplatna dostava za porudžbine preko 50.000 RSD.' },
                { icon: 'ri-hand-coin-line', title: 'Plaćanje pouzećem', desc: 'Platite prilikom preuzimanja. Bez rizika, bez stresa. Dodatnih 3% popusta za keš.' },
                { icon: 'ri-tools-line', title: 'Servis i rezervni delovi', desc: 'Sopstveni autorizovani servis i velika ponuda rezervnih delova. Besplatan prvi servis.' },
                { icon: 'ri-customer-service-2-line', title: 'Stručna podrška', desc: 'Pomažemo vam da odaberete idealno vozilo — bilo da ste početnik ili iskusni vozač.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 bg-[#F8FBF8] rounded-2xl p-6 border border-gray-100 hover:border-brand-200 transition-colors">
                  <div className="w-12 h-12 flex items-center justify-center bg-brand-600 rounded-xl shrink-0">
                    <i className={`${item.icon} text-white text-xl`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-[15px] mb-1.5">{item.title}</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-brand-600 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                Spremni ste za novu avanturu?
              </h3>
              <p className="text-sm text-white/80 mb-6 max-w-md mx-auto">
                Pogledajte našu ponudu i pronađite savršeno moto vozilo za vas ili vašu porodicu.
              </p>
              <Link
                to="/shop"
                className="inline-block bg-white text-brand-700 font-bold px-8 py-3 rounded-full hover:bg-brand-50 transition-all text-sm whitespace-nowrap"
              >
                Pogledaj ponudu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}