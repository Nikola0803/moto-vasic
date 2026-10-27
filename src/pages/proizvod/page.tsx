import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/feature/Layout';
import ProductCard from '@/components/feature/ProductCard';
import StarRating from '@/components/feature/StarRating';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  media: { url: string; type: string }[];
  product_categories: { id: number; name: string };
  short_description?: string;
  meta_title?: string;
  meta_description?: string;
  slug?: string;
}

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

const fakeReviews: Review[] = [
  { name: 'Milan D.', rating: 5, text: 'Kupio sam ovaj model pre mesec dana i oduševljen sam! Motor je jak i pouzdan, a vozilo je izuzetno stabilno na neravnom terenu. Dostava je bila brza, a pakovanje odlično. Preporuka!', date: '2026-04-15' },
  { name: 'Petar S.', rating: 5, text: 'Drugi put kupujem kod Moto Vasića i opet sam oduševljen. Garancija i podrška su na visokom nivou. Servisni tim je veoma profesionalan. Plaćanje pouzećem je veliki plus.', date: '2026-03-28' },
  { name: 'Jovana K.', rating: 4, text: 'Dobar proizvod, solidna izrada. Malo sam očekivala jači akselerator ali u globalu zadovoljna. Vozilo je hit kod mog sina!', date: '2026-03-10' },
  { name: 'Dejan R.', rating: 5, text: 'Kupio sam kao poklon za brata i bio je hit! Sve je savršeno upakovano, uputstva jasna. Definitivno preporučujem Moto Vasić svima koji traže kvalitetna moto vozila.', date: '2026-02-20' },
];

function getSpecsForCategory(catId: number) {
  switch (catId) {
    case 1: // ATV za odrasle
      return [
        { label: 'Brend', value: 'Tao Motor' },
        { label: 'Motor', value: '200cc-300cc 4T' },
        { label: 'Pogon', value: '4x4 sa diferencijalom' },
        { label: 'Menjač', value: 'Automatski sa reverzom' },
        { label: 'Gume', value: '22-26\'\' Off-road' },
        { label: 'Kočnice', value: 'Hidraulički diskovi' },
        { label: 'Homologacija', value: 'EEC / CE' },
        { label: 'Garancija', value: '12-24 meseca' },
      ];
    case 2: // ATV za decu
      return [
        { label: 'Brend', value: 'Tao Motor' },
        { label: 'Motor', value: '50cc-110cc 2T/4T' },
        { label: 'Pogon', value: 'Zadnji (2x4)' },
        { label: 'Menjač', value: 'Automatski' },
        { label: 'Gume', value: '14-16\'\' Terenske' },
        { label: 'Kočnice', value: 'Disk kočnice' },
        { label: 'Sigurnost', value: 'Prečage, ograničivač' },
        { label: 'Garancija', value: '12 meseci' },
      ];
    case 3: // Kros motori deca
      return [
        { label: 'Brend', value: 'Tao Motor' },
        { label: 'Motor', value: '50cc-110cc 2T/4T' },
        { label: 'Menjač', value: 'Auto / 3-4 brzine' },
        { label: 'Ovешanje', value: 'Dugačko, 90-110mm' },
        { label: 'Gume', value: '12-17\'\' Knobby' },
        { label: 'Kočnice', value: 'Disk na oba točka' },
        { label: 'Sigurnost', value: 'Pera, ograničivač' },
        { label: 'Garancija', value: '12 meseci' },
      ];
    case 4: // Dečiji kvadovi
      return [
        { label: 'Brend', value: 'Tao Motor' },
        { label: 'Motor', value: '50cc-70cc 2T/4T' },
        { label: 'Pogon', value: '4 točka (2x4)' },
        { label: 'Menjač', value: 'Automatski' },
        { label: 'Gume', value: '6-7\'\' Pneumatske' },
        { label: 'Kočnice', value: 'Zadnji disk' },
        { label: 'Sigurnost', value: 'Prečage, ograničivač 20-25km/h' },
        { label: 'Garancija', value: '12 meseci' },
      ];
    case 41: // Kros motori odrasli
      return [
        { label: 'Brend', value: 'Tao Motor' },
        { label: 'Motor', value: '250cc-450cc 4T' },
        { label: 'Snaga', value: '18-38 KS' },
        { label: 'Menjač', value: '5-6 brzina, mokra kvačila' },
        { label: 'Ovешanje', value: '280-310mm, gasni amortizeri' },
        { label: 'Gume', value: '21/19\'\' Racing knobby' },
        { label: 'Kočnice', value: 'Hidraulički perforirani diskovi' },
        { label: 'Homologacija', value: 'EEC / CE' },
        { label: 'Garancija', value: '18-24 meseca' },
      ];
    case 42: // Bagiji
      return [
        { label: 'Brend', value: 'Tao Motor' },
        { label: 'Motor', value: '200cc-300cc 4T' },
        { label: 'Pogon', value: '2x4 ili 4x4' },
        { label: 'Menjač', value: 'Automatski sa L-H-N-R' },
        { label: 'Gume', value: '22-24\'\' Terenske' },
        { label: 'Kočnice', value: 'Disk na svim točkovima' },
        { label: 'Sedišta', value: 'Dvosedišna kabina' },
        { label: 'Garancija', value: '18-24 meseca' },
      ];
    case 43: // Skuteri
      return [
        { label: 'Brend', value: 'Tao Motor' },
        { label: 'Motor', value: '50cc-125cc 4T' },
        { label: 'Snaga', value: '2.5-8.5 KS' },
        { label: 'Menjač', value: 'CVT automatski' },
        { label: 'Gume', value: '10-12\'\' Cestovne' },
        { label: 'Kočnice', value: 'Prednji disk / zadnji bubanj' },
        { label: 'Homologacija', value: 'EEC / CE, drumska' },
        { label: 'Garancija', value: '12-18 meseci' },
      ];
    case 44: // Moto oprema
      return [
        { label: 'Tip', value: 'Integralna / Motokros' },
        { label: 'Materijal', value: 'ABS / Kompozit' },
        { label: 'Sertifikat', value: 'ECE 22.05' },
        { label: 'Veličine', value: 'XXS do XXL' },
        { label: 'Težina', value: '1350-1450g' },
        { label: 'Vvizir', value: 'Anti-scratch, anti-fog' },
        { label: 'Ventilacija', value: 'Višeslojna, 10-16 otvora' },
        { label: 'Garancija', value: '24 meseca' },
      ];
    default:
      return [
        { label: 'Brend', value: 'Tao Motor' },
        { label: 'Garancija', value: '12-24 meseca' },
        { label: 'Sertifikat', value: 'CE / EEC' },
        { label: 'Dostava', value: '2-5 radnih dana' },
      ];
  }
}

function getPackageItems(catId: number) {
  if (catId === 44) {
    return [
      'Homologirana kaciga u originalnoj kutiji',
      'Torbica za nošenje i čuvanje',
      'Rezervni set unutrašnjosti',
      'Uputstvo za upotrebu na srpskom',
      'Garancijski list',
    ];
  }
  if (catId === 45) {
    return [
      'Rezervni deo kompletan set',
      'Set alata za montažu',
      'Uputstvo za instalaciju',
      'Garancijski list',
    ];
  }
  return [
    'Moto vozilo kompletno sastavljeno i testirano',
    'Akumulator i punjač (gde je primenljivo)',
    'Set alata za osnovno održavanje',
    'Uputstvo za upotrebu i održavanje na srpskom',
    'Garancijski list i servisna knjižica',
    'Homologaciona dokumentacija (za cestovna vozila)',
  ];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('common');
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [viewerCount] = useState(() => Math.floor(Math.random() * 8) + 3);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);

      const { data } = await supabase
        .from('product_items')
        .select('*, product_categories(id, name)')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setProduct(data as Product);
        setActiveImage(0);

        const pageTitle = data.meta_title || `${data.name} | Moto Vasić — Cena i Specifikacije`;
        document.title = pageTitle;
        const metaDesc = data.meta_description || data.short_description || `Kupite ${data.name} po najboljoj ceni u Srbiji. Plaćanje pouzećem, garancija, autorizovani servis u Nišu. Tao Motor ovlašćeni distributer.`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', metaDesc);

        // JSON-LD structured data for SEO
        const existingScript = document.querySelector('script[data-product-schema]');
        if (existingScript) existingScript.remove();
        const schema = document.createElement('script');
        schema.type = 'application/ld+json';
        schema.setAttribute('data-product-schema', '');
        schema.text = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: metaDesc,
          image: data.media?.[0]?.url || '',
          sku: String(data.id),
          brand: { '@type': 'Brand', name: 'Tao Motor' },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'RSD',
            price: data.price > 0 ? String(data.price) : undefined,
            availability: data.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'Moto Vasić' },
          },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '24' },
        });
        document.head.appendChild(schema);

        const { data: rel } = await supabase
          .from('product_items')
          .select('*, product_categories(id, name)')
          .eq('status', 'active')
          .eq('category_id', data.category_id)
          .neq('id', id)
          .limit(4);

        if (rel) setRelated(rel as Product[]);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="pt-24 md:pt-28 lg:pt-36 px-4 md:px-10 max-w-[1440px] mx-auto pb-12">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-5 rounded w-40 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-gray-200 aspect-square rounded-xl" />
              <div className="space-y-5">
                <div className="bg-gray-200 h-8 rounded w-3/4" />
                <div className="bg-gray-200 h-10 rounded w-1/3" />
                <div className="bg-gray-200 h-40 rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-24 md:pt-28 lg:pt-36 px-4 md:px-10 text-center py-24">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5 bg-gray-50 rounded-full">
            <i className="ri-error-warning-line text-3xl text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Proizvod nije pronađen</h2>
          <p className="text-sm text-gray-500 mb-6">Proizvod koji tražite možda više nije dostupan.</p>
          <Link to="/shop" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            {t('back_to_shop')}
          </Link>
        </div>
      </Layout>
    );
  }

  const allImages = product.media?.length > 0 ? product.media : [{ url: '', type: 'image' }];
  const stockPercent = Math.min((product.stock / 20) * 100, 100);
  const catId = product.product_categories?.id || 0;
  const specs = getSpecsForCategory(catId);
  const packageItems = getPackageItems(catId);

  return (
    <Layout>
      <div className="pt-24 md:pt-28 lg:pt-36 pb-16 md:pb-24 px-4 md:px-10 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-8">
            <Link to="/" className="hover:text-brand-600 transition-colors">{t('nav_home')}</Link>
            <i className="ri-arrow-right-s-line" />
            <Link to="/shop" className="hover:text-brand-600 transition-colors">{t('nav_shop')}</Link>
            <i className="ri-arrow-right-s-line" />
            <span className="text-gray-500 line-clamp-1">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14">
            <div>
              <div className="bg-[#F8FBF8] rounded-2xl p-6 md:p-10 mb-4 border border-gray-100">
                <img
                  src={allImages[activeImage]?.url}
                  alt={product.name}
                  className="w-full aspect-square object-contain object-center"
                />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#F8FBF8] p-2 flex-shrink-0 border-2 transition-all ${
                        idx === activeImage ? 'border-brand-500 shadow-sm' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-contain object-center" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <p className="text-[11px] font-bold text-brand-600 tracking-wider uppercase mb-3">
                {product.product_categories?.name}
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-[42px] font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {product.short_description && (
                <p className="text-[13px] md:text-sm text-gray-500 leading-relaxed mb-4">
                  {product.short_description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-5">
                <StarRating rating={5} size="md" />
                <span className="text-[13px] text-gray-500">(24 recenzije)</span>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  Na stanju
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                {product.price > 0 ? (
                  <p className="text-3xl md:text-4xl font-bold text-gray-900">
                    {product.price.toLocaleString('sr-RS')}
                    <span className="text-lg font-medium text-gray-400 ml-1.5">RSD</span>
                  </p>
                ) : (
                  <p className="text-2xl md:text-3xl font-bold text-brand-600">
                    Kontakt za upit
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mb-5 text-[12px] text-gray-500">
                <div className="flex -space-x-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-brand-200 border border-white flex items-center justify-center text-[7px] font-bold text-brand-700">
                      {['M', 'P', 'J'][i - 1]}
                    </div>
                  ))}
                </div>
                <span><strong className="text-brand-600">{viewerCount}</strong> ljudi gleda ovaj proizvod trenutno</span>
              </div>

              {product.stock > 0 && product.stock <= 8 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-fire-line text-red-500" />
                    <span className="text-[13px] font-bold text-red-600">
                      🔥 Preostalo samo {product.stock} komada
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all"
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { icon: 'ri-truck-line', text: 'Brza dostava' },
                  { icon: 'ri-hand-coin-line', text: 'Pouzećem' },
                  { icon: 'ri-shield-check-line', text: 'Garancija' },
                ].map((item) => (
                  <div key={item.text} className="flex flex-col items-center gap-1.5 bg-[#F8FBF8] rounded-xl p-3 border border-gray-100">
                    <i className={`${item.icon} text-brand-500 text-lg`} />
                    <span className="text-[11px] font-semibold text-gray-700 text-center">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 mb-8">
                <a
                  href="tel:+381621541944"
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm whitespace-nowrap text-center tracking-wide shadow-lg shadow-brand-600/25"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-phone-line" />
                    {product.price > 0
                      ? `Nazovi i naruči — ${product.price.toLocaleString('sr-RS')} RSD`
                      : 'Nazovi za cenu i informacije'}
                  </span>
                </a>
                <a
                  href="tel:+381621541936"
                  className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl transition-all text-sm whitespace-nowrap text-center tracking-wide"
                >
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-phone-line" />
                    062/1541936
                  </span>
                </a>
                <Link
                  to="/kontakt"
                  className="border-2 border-gray-200 hover:border-brand-300 hover:text-brand-600 text-gray-600 font-medium px-8 py-3.5 rounded-xl transition-all text-center text-sm whitespace-nowrap"
                >
                  {t('contact_us')}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 md:mt-16">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-8">
              {[
                { key: 'desc' as const, label: 'Opis proizvoda' },
                { key: 'specs' as const, label: 'Specifikacije' },
                { key: 'reviews' as const, label: `Recenzije (${fakeReviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'desc' && (
              <div className="max-w-3xl">
                <p className="text-[13px] md:text-sm text-gray-600 leading-relaxed">
                  {product.description || `${product.name} je dostupan u Moto Vasić prodavnici — ovlašćenom distributeru Tao Motor za Srbiju. Vozilo dolazi kompletno sastavljeno i testirano, sa svom potrebnom dokumentacijom. Naš tim stručnjaka je uvek spreman da vam pomogne sa odabirom, isporukom i servisiranjem vozila.`}
                </p>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: 'ri-shield-check-line', title: 'CE / EEC sertifikat', desc: 'Sva vozila ispunjavaju evropske bezbednosne standarde' },
                    { icon: 'ri-tools-line', title: 'Autorizovani servis', desc: 'Servis i rezervni delovi dostupni u Nišu' },
                    { icon: 'ri-hand-coin-line', title: 'Plaćanje pouzećem', desc: 'Platite kada vozilo stigne na vašu adresu' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-3 bg-[#F8FBF8] rounded-xl border border-gray-100">
                      <i className={`${item.icon} text-brand-500 text-lg mt-0.5`} />
                      <div>
                        <p className="text-[12px] font-semibold text-gray-700">{item.title}</p>
                        <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-5 bg-[#F8FBF8] rounded-xl border border-gray-100">
                  <h4 className="font-semibold text-gray-800 text-[14px] mb-3">Šta je uključeno u pakovanje?</h4>
                  <ul className="space-y-2 text-[13px] text-gray-500">
                    {packageItems.map((item, i) => (
                      <li key={i} className="flex items-center gap-2"><i className="ri-check-line text-emerald-500" /> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between p-4 bg-[#F8FBF8] rounded-xl border border-gray-100">
                      <span className="text-[13px] text-gray-500">{spec.label}</span>
                      <span className="text-[13px] font-semibold text-gray-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-6 p-4 bg-[#F8FBF8] rounded-xl border border-gray-100">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">4.8</p>
                    <StarRating rating={5} />
                    <p className="text-[11px] text-gray-500 mt-1">na osnovu 24 recenzije</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 w-3">{star}</span>
                        <i className="ri-star-fill text-[10px] text-amber-400" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${star === 5 ? 75 : star === 4 ? 20 : star === 3 ? 5 : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 w-6 text-right">{star === 5 ? '18' : star === 4 ? '5' : star === 3 ? '1' : '0'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {fakeReviews.map((review, i) => (
                    <div key={i} className="p-5 bg-[#F8FBF8] rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                            <p className="text-[11px] text-gray-400">{review.date}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-16 md:mt-24">
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Slični proizvodi koje će vam se svideti
                </h2>
                <Link
                  to={`/shop?kategorija=${product.category_id}`}
                  className="flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Pogledaj sve
                  <i className="ri-arrow-right-line" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6" data-product-shop>
                {related.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    badge={i === 0 ? 'bestseller' : null}
                    rating={5}
                    reviewCount={8 + i * 3}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}