import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { fetchWithCache } from '@/lib/cache';
import Layout from '@/components/feature/Layout';
import ProductCard from '@/components/feature/ProductCard';
import StarRating from '@/components/feature/StarRating';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  media: { url: string; type: string }[];
  product_categories: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
  image: string;
  count: number;
}

const HERO_BG = 'https://readdy.ai/api/search-image?query=A%20dramatic%20action%20shot%20of%20a%20child%20riding%20a%20blue%20mini%20ATV%20quad%20bike%20on%20a%20dirt%20trail%20kicking%20up%20dust%2C%20warm%20golden%20hour%20sunlight%2C%20dynamic%20motion%20blur%2C%20professional%20motorsport%20commercial%20photography%2C%20off-road%20adventure%20atmosphere%2C%20no%20text%20no%20logos%2C%20cinematic%20wide%20angle%20composition%20with%20rich%20warm%20earthy%20tones&width=1920&height=750&seq=moto-hero-v2&orientation=landscape';

const CAT_IMAGES: Record<number, string> = {
  35: 'https://readdy.ai/api/search-image?query=ATV%20quad%20bike%20hard%20case%20cargo%20box%20luggage%20mounted%20on%20rear%20rack%2C%20black%20plastic%20storage%20box%2C%20clean%20studio%20product%20shot%2C%20warm%20lighting%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-atv-case-v1&orientation=portrait',
  36: 'https://readdy.ai/api/search-image?query=A%20yellow%20kids%20cross%20dirt%20bike%20motorcycle%2050cc%20with%20knobby%20tires%20on%20a%20muddy%20off-road%20track%2C%20dynamic%20action%20photography%20with%20warm%20lighting%20and%20dust%2C%20professional%20motorsport%20shot%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-cross-kids-v2&orientation=portrait',
  37: 'https://readdy.ai/api/search-image?query=A%20small%20blue%20mini%20ATV%20quad%20bike%20for%20kids%20with%20safety%20bars%20parked%20on%20green%20grass%20field%2C%20playful%20atmosphere%20with%20warm%20sunlight%2C%20professional%20product%20photography%20showing%20child-sized%20proportions%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-atv-kids-v2&orientation=portrait',
  38: 'https://readdy.ai/api/search-image?query=A%20small%20electric%20kids%20motorcycle%20in%20red%20with%20battery%20indicator%2C%20clean%20studio%20background%2C%20warm%20lighting%2C%20child-sized%20proportions%2C%20professional%20product%20photography%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-emoto-kids-v1&orientation=portrait',
  39: 'https://readdy.ai/api/search-image?query=A%20sleek%2050cc%20scooter%20moped%20in%20white%20parked%20on%20a%20city%20street%2C%20modern%20design%2C%20warm%20afternoon%20lighting%2C%20professional%20commercial%20photography%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-scooter-50-v1&orientation=portrait',
  40: 'https://readdy.ai/api/search-image?query=Two%20aggressive%20off-road%20motorcycle%20tires%20with%20deep%20knobby%20tread%20patterns%20stacked%20diagonally%20against%20a%20warm%20dark%20background%2C%20dramatic%20studio%20lighting%20highlighting%20rubber%20texture%2C%20professional%20product%20photography%2C%20no%20text%20no%20logos&width=300&height=350&seq=cat-tires-v1&orientation=portrait',
  41: 'https://readdy.ai/api/search-image?query=A%20small%20metal%20ATV%20quad%20trailer%20with%20steel%20frame%20and%20rubber%20tires%20on%20grass%2C%20clean%20outdoor%20shot%2C%20warm%20natural%20lighting%2C%20professional%20product%20photography%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-atv-trailer-v1&orientation=portrait',
  42: 'https://readdy.ai/api/search-image?query=A%20modern%20white%20road%20scooter%20125cc%20parked%20on%20an%20urban%20street%20with%20city%20background%20slightly%20blurred%2C%20sleek%20and%20stylish%20design%2C%20warm%20afternoon%20lighting%2C%20professional%20commercial%20photography%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-scooter-125-v1&orientation=portrait',
  43: 'https://readdy.ai/api/search-image?query=A%20powerful%20250cc%20adult%20motocross%20dirt%20bike%20in%20black%20and%20orange%20on%20a%20forest%20trail%2C%20dramatic%20action%20shot%20with%20dust%20and%20warm%20golden%20hour%20light%2C%20professional%20motorsport%20photography%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-cross-adult-v1&orientation=portrait',
  44: 'https://readdy.ai/api/search-image?query=A%20sleek%20modern%20full-face%20motocross%20helmet%20in%20matte%20black%20with%20red%20accents%20displayed%20on%20a%20clean%20studio%20surface%2C%20dramatic%20side%20lighting%2C%20professional%20product%20photography%2C%20no%20text%20no%20logos&width=300&height=350&seq=cat-helmet-v1&orientation=portrait',
  45: 'https://readdy.ai/api/search-image?query=An%20organized%20arrangement%20of%20motorcycle%20spare%20parts%20including%20chains%20sprockets%20brake%20discs%20and%20engine%20components%20on%20a%20dark%20workbench%2C%20warm%20workshop%20lighting%2C%20professional%20industrial%20photography%2C%20no%20text%20no%20logos&width=300&height=350&seq=cat-parts-v1&orientation=portrait',
  46: 'https://readdy.ai/api/search-image?query=A%20professional%20motocross%20rider%20chest%20protector%20body%20armor%20in%20black%20and%20white%20with%20shoulder%20guards%20and%20elbow%20pads%20displayed%20on%20a%20mannequin%20torso%2C%20clean%20studio%20background%20with%20warm%20lighting%2C%20no%20text%20no%20logos&width=300&height=350&seq=cat-gear-v1&orientation=portrait',
  47: 'https://readdy.ai/api/search-image?query=A%20stylish%20collection%20of%20motorcycle%20accessories%20including%20riding%20gloves%20handlebar%20grips%20arranged%20on%20a%20dark%20slate%20surface%2C%20warm%20overhead%20lighting%2C%20professional%20product%20photography%2C%20no%20text%20no%20logos&width=300&height=350&seq=cat-accessories-v1&orientation=portrait',
  48: 'https://readdy.ai/api/search-image?query=A%20modern%20sleek%20electric%20scooter%20in%20matte%20black%20with%20red%20accents%20parked%20on%20an%20urban%20city%20street%20at%20golden%20hour%2C%20stylish%20minimalist%20design%20with%20LED%20lights%2C%20professional%20commercial%20product%20photography%2C%20no%20text%20no%20logos%20no%20people&width=300&height=350&seq=cat-escooter-v1&orientation=portrait',
  49: 'https://readdy.ai/api/search-image?query=A%20powerful%20adult%20ATV%20quad%20bike%20200cc%20red%20with%20large%20off-road%20tires%20climbing%20a%20rocky%20dirt%20hill%2C%20dramatic%20action%20shot%20with%20dust%20clouds%20and%20warm%20golden%20hour%20lighting%2C%20professional%20motorsport%20photography%2C%20no%20text%20no%20people&width=300&height=350&seq=cat-atv-adult-v2&orientation=portrait',
};

const brandLogos = [
  { name: 'TAO MOTOR', abbr: 'TAO' },
  { name: 'FOX RACING', abbr: 'FOX' },
  { name: 'ALPINESTARS', abbr: 'ALP' },
  { name: '100%', abbr: '100' },
  { name: 'LEATT', abbr: 'LEA' },
  { name: 'MT HELMETS', abbr: 'MT' },
];

const testimonials = [
  { name: 'Milan D.', location: 'Beograd', text: 'Kupio sam Tao Motor ATV 200cc i oduševljen sam! Vozilo je brutalno na off-road stazama, motor jak i pouzdan. Dostava je bila brza, a cena najbolja na tržištu. Svaka preporuka za Moto Vasić!', rating: 5 },
  { name: 'Petar S.', location: 'Novi Sad', text: 'Drugi put kupujem kod vas — prvo kros motor 65cc za sina, sad bagi 250cc za sebe. Oba puta odlična usluga, originalni proizvodi sa garancijom. Servisni tim je vrhunski.', rating: 5 },
  { name: 'Jovana K.', location: 'Kragujevac', text: 'Skuter 125cc koji sam kupila pre 6 meseci radi savršeno. Homologacija je prošla bez problema, a potrošnja je iznenađujuće niska. Moto Vasić je moja prva adresa za moto.', rating: 5 },
  { name: 'Dejan R.', location: 'Niš', text: 'Bagi 200cc je prava mašina! Porodica obožava vikend vožnje po Fruškoj Gori. Motor je pouzdan, a dostava je stigla za 2 dana. Hvala na profesionalnosti!', rating: 5 },
];

const faqs = [
  { q: 'Da li moto vozila imaju homologaciju za drumski saobraćaj?', a: 'Sva cestovna vozila (skuteri, ATV 4x4 sa homologacijom) dolaze sa EEC homologacijom i mogu se registrovati. Kros motori i bagiji su namenjeni isključivo za off-road i privatne površine, osim ako posebno nije naznačeno da imaju homologaciju. Detaljne informacije o homologaciji možete pronaći u opisu svakog proizvoda.' },
  { q: 'Koliko traje isporuka moto vozila?', a: 'Isporuka širom Srbije traje 2-5 radnih dana. Za Beograd i okolinu obično 1-2 dana. Moto vozila stižu kompletno sastavljena i testirana, spremna za vožnju odmah po preuzimanju.' },
  { q: 'Da li mogu platiti pouzećem?', a: 'Da! Plaćanje pouzećem prilikom preuzimanja je dostupno za celu Srbiju. Takođe možete platiti karticom online ili u radnji u Nišu.' },
  { q: 'Da li vršite servis i imate rezervne delove?', a: 'Da, imamo sopstveni autorizovani servis u Smederevu i veliku ponudu rezervnih delova za sva vozila iz naše ponude — od guma i lanaca do motora i elektrike. Svaki kupac dobija besplatan prvi servis u roku od 30 dana od kupovine.' },
  { q: 'Koji je uzrast za dečije kros motore i mini ATV kvadove?', a: 'Mini ATV kvadovi 50cc su namenjeni deci od 5-8 godina, mini ATV 110cc za 8-14 godina. Kros motori 50cc za 6-10 godina, 65cc za 8-12 godina, a 110cc za 10-14 godina. Sva dečija vozila imaju ograničivač brzine, sigurnosne prečage i CE sertifikat.' },
  { q: 'Da li je zaštitna oprema obavezna i šta preporučujete?', a: 'Kaciga je zakonom obavezna za svaku vožnju moto vozila na drumu, a mi je preporučujemo i za off-road. Za motokros i off-road preporučujemo i zaštitni prsluk, naramenice, rukavice i čizme. Sva oprema u našoj ponudi ima ECE 22.05 homologaciju.' },
];

function HorizontalCarousel({ title, subtitle, products, viewAllLink }: { title: string; subtitle?: string; products: Product[]; viewAllLink: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 340;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14 px-4 md:px-10 bg-white">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-[13px] text-gray-500 mt-1.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={viewAllLink}
              className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors whitespace-nowrap bg-brand-50 px-4 py-2 rounded-full"
            >
              Pogledaj sve modele
              <i className="ri-arrow-right-line" />
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                <i className="ri-arrow-left-s-line" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                <i className="ri-arrow-right-s-line" />
              </button>
            </div>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, i) => (
            <div key={product.id} className="snap-start">
              <ProductCard
                product={product}
                badge={i === 0 ? 'bestseller' : i === 1 ? 'new' : null}
                rating={5}
                reviewCount={12 + i * 8}
                variant="horizontal"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation('common');
  const [productsByCat, setProductsByCat] = useState<Record<number, Product[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterDrive, setFilterDrive] = useState('');
  const [filterEngine, setFilterEngine] = useState('');
  const [filterAge, setFilterAge] = useState('');

  useEffect(() => {
    document.title = 'Moto Vasić | ATV Kvadovi, Kros Motori, Bagiji i Skuteri — Srbija';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Moto Vasić — stručna prodaja ATV kvadova, kros motora, bagija i skutera za decu i odrasle. Plaćanje pouzećem, garancija do 24 meseca, autorizovani servis u Nišu. Tao Motor ovlašćeni distributer za Srbiju.');
  }, []);

  useEffect(() => {
    interface HomeData { products: Product[]; cats: { id: number; name: string; image: string | null }[] }

    fetchWithCache<HomeData>(
      'mv:home:v1',
      async () => {
        const [{ data: products }, { data: cats }] = await Promise.all([
          supabase.from('product_items').select('*, product_categories(id, name)').eq('status', 'active').limit(5000).order('created_at', { ascending: false }),
          supabase.from('product_categories').select('id, name, image').is('parent_id', null).order('sort_order'),
        ]);
        return { products: (products || []) as Product[], cats: cats || [] };
      },
      ({ products, cats }) => {
        const byCat: Record<number, Product[]> = {};
        products.forEach((p) => {
          const catId = (p as any).category_id;
          if (!byCat[catId]) byCat[catId] = [];
          byCat[catId].push(p);
        });
        setProductsByCat(byCat);

        const counts: Record<number, number> = {};
        products.forEach((p) => {
          const catId = (p as any).category_id;
          if (catId) counts[catId] = (counts[catId] || 0) + 1;
        });
        setCategories(cats.map((c) => ({
          id: c.id,
          name: c.name,
          image: c.image || CAT_IMAGES[c.id] || '',
          count: counts[c.id] || 0,
        })));
        setLoading(false);
      }
    ).catch(() => setLoading(false));
  }, []);

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (filterVehicle) params.set('kategorija', filterVehicle);
    window.location.href = `/shop?${params.toString()}`;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[520px] md:min-h-[680px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt="ATV Kvad off-road akcija"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="relative z-10 w-full px-4 md:px-10 max-w-[1440px] mx-auto pb-12 md:pb-20">
          <div className="max-w-2xl">
            <p className="text-sm md:text-base text-white/80 mb-3 font-medium">
              Zabava za celu porodicu
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-[64px] font-extrabold text-white mb-6 leading-[1.05]">
              Motori za decu<br />i odrasle
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop?kategorija=37"
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-3 rounded-lg transition-all text-[13px] whitespace-nowrap tracking-wide"
              >
                Kvadovi za decu
              </Link>
              <Link
                to="/shop?kategorija=36"
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-lg transition-all text-[13px] whitespace-nowrap tracking-wide border border-white/30"
              >
                Kros motori za decu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-6 md:py-8 px-4 md:px-10 bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Pronađi vozilo koje odgovara baš tebi</h2>
          <p className="text-[13px] text-gray-500 mb-5">
            Brzo i jednostavno, poruči sebi ili dragoj osobi ATV Kvad, bagi, skuter ili kros motor. U ponudi su dečiji i modeli za odrasle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-brand-300 cursor-pointer"
            >
              <option value="">VRSTA VOZILA</option>
              <option value="1">ATV Kvadovi za odrasle</option>
              <option value="2">ATV Kvadovi za decu</option>
              <option value="3">Kros motori za decu</option>
              <option value="41">Kros motori za odrasle</option>
              <option value="42">Bagi za odrasle</option>
              <option value="49">Električni skuteri</option>
            </select>
            <select
              value={filterDrive}
              onChange={(e) => setFilterDrive(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-brand-300 cursor-pointer"
            >
              <option value="">POGON</option>
              <option value="2x4">2x4 (Zadnji)</option>
              <option value="4x4">4x4 (Sva četiri)</option>
            </select>
            <select
              value={filterEngine}
              onChange={(e) => setFilterEngine(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-brand-300 cursor-pointer"
            >
              <option value="">KUBIKAŽA</option>
              <option value="50">50cc</option>
              <option value="110">110cc</option>
              <option value="125">125cc</option>
              <option value="200">200cc</option>
              <option value="250">250cc</option>
              <option value="300">300cc+</option>
            </select>
            <select
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-brand-300 cursor-pointer"
            >
              <option value="">UZRAST</option>
              <option value="5-8">5-8 godina</option>
              <option value="8-14">8-14 godina</option>
              <option value="14+">14+ godina (Odrasli)</option>
            </select>
            <button
              onClick={handleFilter}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3 rounded-lg transition-all text-[13px] whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <i className="ri-filter-line" />
                FILTER
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-10 md:py-14 px-4 md:px-10 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?kategorija=${cat.id}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/5] md:aspect-[3/4] block"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold text-white leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-white/60 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {cat.count} proizvoda →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product Carousels - dinamički po kategorijama */}
      {loading ? (
        <div className="py-10 px-4 md:px-10">
          <div className="max-w-[1440px] mx-auto">
            <div className="h-6 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[280px] h-[380px] bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {categories
            .filter((cat) => (productsByCat[cat.id] || []).length > 0)
            .map((cat, idx) => (
              <div key={cat.id} className={idx % 2 === 1 ? "bg-[#F8FBF8]" : ""}>
                <HorizontalCarousel
                  title={cat.name}
                  products={productsByCat[cat.id] || []}
                  viewAllLink={'/shop?kategorija=' + cat.id}
                />
              </div>
            ))}
        </>
      )}

      {/* Why Choose Us */}
      <section className="relative py-16 md:py-24 px-4 md:px-10 bg-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://readdy.ai/api/search-image?query=A%20dramatic%20cinematic%20shot%20of%20an%20adult%20riding%20a%20black%20cross%20motorcycle%20250cc%20on%20a%20forest%20dirt%20trail%20at%20golden%20hour%2C%20dust%20clouds%20and%20warm%20sunlight%2C%20professional%20motorsport%20photography%20with%20rich%20warm%20tones%2C%20side%20angle%20composition%2C%20no%20text%20no%20logos&width=1920&height=600&seq=why-us-bg&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/90 to-[#1A1A1A]/70" />
        <div className="relative z-10 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Zašto kupovati kod nas?
              </h2>
              <p className="text-[13px] md:text-sm text-white/60 leading-relaxed mb-8">
                Pored godina iskustva u Moto Vasiću možete pronaći više od prodavca. Mi smo podrška i sigurnost. Uz nas dobijate ceo paket od vozila, do servisa, garancije i rezervnih delova.
              </p>
              <p className="text-[13px] md:text-sm text-white/60 leading-relaxed mb-8">
                Više od 20 godina gradimo poverenje sa ljubiteljima adrenalina i moto sporta. Moto Vasić je porodična firma posvećena kvalitetu, brzini i vrhunskoj usluzi.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+381621541944"
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-3 rounded-lg transition-all text-[13px] whitespace-nowrap text-center"
                >
                  Želite da ostvarimo saradnju? — Pozovite nas
                </a>
                <Link
                  to="/kontakt"
                  className="border border-white/30 hover:border-white/60 text-white font-semibold px-6 py-3 rounded-lg transition-all text-[13px] whitespace-nowrap text-center"
                >
                  Pošaljite nam upit
                </Link>
              </div>
              <p className="mt-4 text-[13px] text-brand-400 font-semibold">
                Plaćanje pouzećem — platite tek kada vozilo stigne!
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="space-y-4">
                {[
                  { icon: 'ri-verified-badge-line', title: 'Originalni proizvodi', desc: 'Sva vozila dolaze od proverenih proizvođača kao što su Tao Motor, sa punom homologacijom i CE sertifikatima.' },
                  { icon: 'ri-truck-line', title: 'Dostava na kućnu adresu', desc: 'Dostavljamo kompletno sastavljena i testirana vozila širom Srbije. Isporuka 2-5 radnih dana.' },
                  { icon: 'ri-hand-coin-line', title: 'Plaćanje pouzećem', desc: 'Platite pri preuzimanju — bez rizika za kupca. Plaćanje dostupno za celu Srbiju.' },
                  { icon: 'ri-tools-line', title: 'Servis i rezervni delovi', desc: 'Imamo sopstveni autorizovani servis i veliku ponudu rezervnih delova. Besplatan prvi servis u roku od 30 dana.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="w-10 h-10 flex items-center justify-center bg-brand-600 rounded-lg shrink-0">
                      <i className={`${item.icon} text-white text-lg`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-[14px] mb-1">{item.title}</h3>
                      <p className="text-[12px] text-white/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessories */}
      <section className="py-10 md:py-14 px-4 md:px-10 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900">Dodatna oprema za ATV Kvad, motore i skutere</h2>
              <p className="text-[13px] text-gray-500 mt-1.5">Opremite se od glave do pete, kod nas imate sve!</p>
            </div>
            <Link
              to="/shop?kategorija=44"
              className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors whitespace-nowrap bg-brand-50 px-4 py-2 rounded-full"
            >
              Pogledaj sve
              <i className="ri-arrow-right-line" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5" data-product-shop>
              {[
                ...(productsByCat[44] || []),
                ...(productsByCat[46] || []),
                ...(productsByCat[47] || []),
                ...(productsByCat[48] || []),
              ].slice(0, 8).map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badge={i === 0 ? 'bestseller' : null}
                  rating={5}
                  reviewCount={8 + i * 4}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-10 md:py-14 px-4 md:px-10 bg-[#F8FBF8] border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {brandLogos.map((brand) => (
              <div key={brand.name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-900 rounded-lg text-white text-xs font-bold">
                  {brand.abbr}
                </div>
                <span className="text-sm font-bold text-gray-800 tracking-wide hidden md:inline">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 md:px-10 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-brand-600 mb-3 bg-brand-50 px-3 py-1 rounded-full">
              Šta kažu naši kupci
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
              Zadovoljni vozači širom Srbije
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[#F8FBF8] border border-gray-100 rounded-2xl p-6">
                <StarRating rating={t.rating} />
                <p className="text-[13px] text-gray-600 leading-relaxed mt-4 mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-[11px] text-gray-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 md:px-10 bg-[#F8FBF8]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-brand-600 mb-3 bg-brand-50 px-3 py-1 rounded-full">
              Često postavljana pitanja
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
              Imate pitanja? Mi imamo odgovore
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl border transition-all ${openFaq === i ? 'border-brand-200 shadow-sm' : 'border-gray-100'}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <span className="font-semibold text-gray-800 text-[14px] md:text-[15px] pr-4">{faq.q}</span>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 transition-all ${openFaq === i ? 'bg-brand-600 text-white rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                    <i className="ri-arrow-down-s-line" />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-[13px] md:text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-[13px] text-gray-500 mb-3">Niste pronašli odgovor koji tražite?</p>
            <Link
              to="/kontakt"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Kontaktirajte nas
              <i className="ri-arrow-right-line" />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Text Block */}
      <section className="py-10 md:py-14 px-4 md:px-10 bg-white border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-3">ATV Kvadovi i Kros Motori u Srbiji</h2>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Moto Vasić je ovlašćeni distributer Tao Motor za Srbiju sa više od 20 godina iskustva. U ponudi su ATV kvadovi 50cc–300cc, kros motori za decu i odrasle, bagiji, skuteri i kompletna moto oprema. Sva vozila dolaze sa CE i EEC sertifikatima, sastavljena i testirana pre isporuke.
              </p>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-3">Dečiji Kvadovi i Kros Motori — Sigurnost na prvom mestu</h2>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Mini ATV kvadovi 50cc i 110cc za uzrast 5–14 godina opremljeni su ograničivačem brzine i sigurnosnim prečagama. Dečiji kros motori 50cc–110cc idealni su za uzrast od 6 godina. Sva dečija vozila imaju CE sertifikat i garanciju od 12 meseci.
              </p>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-3">Servis, Garancija i Rezervni Delovi</h2>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Moto Vasić ima sopstveni autorizovani servis u Nišu i veliku ponudu originalnih rezervnih delova za sva vozila iz ponude. Svi kupci dobijaju besplatan prvi servis u roku od 30 dana od kupovine i garanciju do 24 meseca.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 md:px-10 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Spremni za <span className="text-brand-400">novu avanturu</span>?
          </h2>
          <p className="text-sm md:text-base text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
            Preko 30 različitih modela ATV kvadova, kros motora, bagija, skutera i opreme čeka na vas. Plaćanje pouzećem, garancija do 24 meseca, autorizovani servis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-10 py-4 rounded-lg transition-all text-sm whitespace-nowrap tracking-wide shadow-xl shadow-brand-600/30"
            >
              <span className="flex items-center gap-2">
                <i className="ri-shopping-bag-3-line" />
                Pogledaj ponudu
              </span>
            </Link>
            <a
              href="tel:+381621541944"
              className="border-2 border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold px-8 py-4 rounded-lg transition-all text-sm whitespace-nowrap tracking-wide"
            >
              <span className="flex items-center gap-2">
                <i className="ri-phone-line" />
                062/1541944
              </span>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}