import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/feature/Layout';
import ProductCard from '@/components/feature/ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  media: { url: string; type: string }[];
  product_categories: { id: number; name: string };
  attributes: Record<string, string> | null;
}

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  _count?: number;
}

export default function Shop() {
  const { t } = useTranslation('common');
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterSize, setFilterSize] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  const selectedCategory = searchParams.get('kategorija');
  const searchQuery = searchParams.get('pretraga');

  // Load only categories that have products
  useEffect(() => {
    async function fetchCategories() {
      const { data: cats } = await supabase
        .from('product_categories')
        .select('id, name, parent_id')
        .order('name');

      const { data: prods } = await supabase
        .from('product_items')
        .select('category_id')
        .eq('status', 'active').limit(5000);

      if (!cats || !prods) return;

      const counts: Record<number, number> = {};
      prods.forEach((p) => {
        if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });

      const withProducts = cats
        .filter((c) => (counts[c.id] || 0) > 0)
        .map((c) => ({ ...c, _count: counts[c.id] || 0 }))
        .sort((a, b) => (b._count || 0) - (a._count || 0));

      setCategories(withProducts);
    }
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('product_items')
      .select('*, product_categories(id, name)')
      .eq('status', 'active').limit(5000);

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    if (searchQuery) {
      query = query.ilike('name', '%' + searchQuery + '%');
    }

    if (sortBy === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data } = await query;
    const loaded = (data || []) as Product[];
    setAllProducts(loaded);

    // Extract filter options from attributes
    const sizes = new Set<string>();
    const brands = new Set<string>();
    loaded.forEach((p) => {
      if (p.attributes) {
        if (p.attributes['Velicina'] || p.attributes['Veličina']) {
          const sizeStr = p.attributes['Veličina'] || p.attributes['Velicina'] || '';
          sizeStr.split(',').forEach((s: string) => { if (s.trim()) sizes.add(s.trim()); });
        }
        if (p.attributes['Brend']) brands.add(p.attributes['Brend'].trim());
      }
    });
    setAvailableSizes(Array.from(sizes).sort());
    setAvailableBrands(Array.from(brands).sort());
    setFilterSize('');
    setFilterBrand('');
    setLoading(false);
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Dynamic SEO per category
  useEffect(() => {
    const catSEO: Record<string, { title: string; desc: string }> = {
      '35': { title: 'Koferi za ATV Kvad — Moto Vasić | Kutije i Torbe za ATV', desc: 'Koferi i kutije za ATV kvadove — zaštita opreme na terenu. Lako montiranje, izdržljivi materijali. Besplatna dostava za porudžbine preko 50.000 RSD.' },
      '36': { title: 'Kros Motori za Decu — Moto Vasić | 50cc–110cc Dirt Bike', desc: 'Dečiji kros motori 50cc, 65cc i 110cc za off-road vožnju. Sigurni, pouzdani, sa CE sertifikatom. Uzrast 6–14 godina. Besplatna dostava širom Srbije.' },
      '37': { title: 'Kvadovi za Decu — Moto Vasić | 50cc i 110cc Mini ATV Kvad', desc: 'Dečiji ATV mini kvadovi 50cc i 110cc za uzrast 5–14 godina. Ograničivač brzine, sigurnosne prečage, CE sertifikat. Kupite online uz besplatnu dostavu.' },
      '38': { title: 'Električni Motori za Decu — Moto Vasić | Baterijski Mini Motori', desc: 'Električni motori za decu na bateriju — tihi, sigurni i zabavni. Idealni poklon za uzrast 3–10 godina. Besplatna dostava i garancija.' },
      '39': { title: 'Skuteri 50 Kubika — Moto Vasić | Mopedi i Skuteri 50cc', desc: 'Skuteri i mopedi 50cc za grad i prigradske vožnje. Ekonomični i laki za upravljanje. Besplatna dostava i garancija do 24 meseca.' },
      '40': { title: 'Gume za ATV i Motore — Moto Vasić | Off-Road i Terenske Gume', desc: 'Off-road i terenske gume za ATV kvadove i kros motore. Kvalitetne gume za različite terene. Besplatna dostava za porudžbine preko 50.000 RSD.' },
      '41': { title: 'Prikolice za ATV Kvad — Moto Vasić | ATV Trailer', desc: 'Prikolice za ATV kvadove — idealne za transport opreme i tereta po terenu. Čelična konstrukcija, lako kačenje. Naručite online uz besplatnu dostavu.' },
      '42': { title: 'Skuteri 125 Kubika — Moto Vasić | Homologovani Putni Skuteri', desc: 'Skuteri 125cc sa EEC homologacijom za drumski saobraćaj. Ekonomični, pouzdani i laki za vožnju. Besplatna dostava i garancija do 24 meseca.' },
      '43': { title: 'Kros Motori za Odrasle — Moto Vasić | 125cc–250cc Enduro', desc: 'Kros i enduro motori za odrasle 125cc do 250cc. Idealni za off-road i terenske staze. Garancija, servis i rezervni delovi dostupni. Naručite online.' },
      '44': { title: 'Moto Kacige — Moto Vasić | ECE Homologovane Kacige za Motore', desc: 'Full-face i motokros kacige sa ECE 22.05 homologacijom. Zaštita za sve uzraste. Proverite ponudu online uz besplatnu dostavu.' },
      '45': { title: 'Rezervni Delovi za ATV i Motore — Moto Vasić | Srbija', desc: 'Originalni rezervni delovi za ATV kvadove, kros motore i skutere. Lanci, kočnice, elektrika i motori. Brza dostava i autorizovani servis.' },
      '46': { title: 'Gume za ATV i Moto Vozila — Moto Vasić | Off-Road Gume', desc: 'Off-road i terenske gume za ATV kvadove i kros motore. Kvalitetne gume za različite terene. Besplatna dostava za porudžbine preko 50.000 RSD.' },
      '47': { title: 'Moto Zaštitna Oprema — Moto Vasić | Prsluk, Naramice, Rukavice', desc: 'Zaštitna moto oprema: prsluk, naramice, rukavice i čizme za motokros i off-road. CE sertifikat. Kompletan asortiman za decu i odrasle.' },
      '48': { title: 'Moto Dodaci i Oprema — Moto Vasić | Aksesori za ATV i Motore', desc: 'Moto dodaci i aksesori za ATV kvadove, kros motore i skutere. Rukohvati, nosači, zaštitna oprema i još mnogo toga. Naručite online.' },
      '49': { title: 'Električni Skuteri — Moto Vasić | E-Skuteri za Grad i Suburbu', desc: 'Električni skuteri za grad i prigradske vožnje. Tihi, ekonomični i ekološki. Besplatna dostava i garancija. Pogledajte ponudu online.' },
    };
    const seo = selectedCategory ? catSEO[selectedCategory] : null;
    document.title = seo ? seo.title : 'Prodavnica — Moto Vasić | ATV Kvadovi, Kros Motori, Bagiji, Skuteri';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', seo ? seo.desc : 'Kompletna ponuda ATV kvadova, kros motora, bagija, skutera i moto opreme za decu i odrasle. Besplatna dostava, plaćanje pouzećem, garancija do 24 meseca.');
  }, [selectedCategory]);

  // Client-side filtering by attributes + search
  useEffect(() => {
    let filtered = [...allProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (filterSize) {
      filtered = filtered.filter((p) => {
        const s = p.attributes?.['Veličina'] || p.attributes?.['Velicina'] || '';
        return s.toLowerCase().includes(filterSize.toLowerCase());
      });
    }

    if (filterBrand) {
      filtered = filtered.filter((p) => p.attributes?.['Brend'] === filterBrand);
    }

    setProducts(filtered);
  }, [allProducts, search, filterSize, filterBrand]);

  const handleCategoryChange = (catId: string | null) => {
    const params = new URLSearchParams();
    if (catId) params.set('kategorija', catId);
    setSearchParams(params);
  };

  const selectedCatName = categories.find((c) => String(c.id) === selectedCategory)?.name;
  const hasAttributeFilters = availableSizes.length > 0 || availableBrands.length > 1;

  const getBadge = (index: number, stock: number): 'bestseller' | 'new' | 'sale' | null => {
    if (index === 0) return 'bestseller';
    if (index === 1) return 'new';
    if (stock <= 3 && stock > 0) return 'sale';
    return null;
  };

  return (
    <Layout>
      {/* Header */}
      <div className="pt-20 md:pt-24 lg:pt-32 pb-8 px-4 md:px-10 bg-[#F8FBF8]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-3">
            <Link to="/" className="hover:text-brand-600 transition-colors">{t('nav_home')}</Link>
            <i className="ri-arrow-right-s-line" />
            {selectedCatName && (
              <>
                <button onClick={() => handleCategoryChange(null)} className="hover:text-brand-600 transition-colors">
                  {t('nav_shop')}
                </button>
                <i className="ri-arrow-right-s-line" />
              </>
            )}
            <span className="text-gray-500">{selectedCatName || t('nav_shop')}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            {selectedCatName || t('all_products')}
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {products.length} {products.length === 1 ? 'proizvod' : 'proizvoda'} u ponudi
          </p>
        </div>
      </div>

      <div className="pb-16 md:pb-24 px-4 md:px-10 bg-white min-h-screen">
        <div className="max-w-[1440px] mx-auto">

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 mb-4">
            <div className="relative flex-1">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pretraži proizvode..."
                className="w-full pl-10 pr-4 py-3 bg-[#F8FBF8] border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-brand-300 transition-all"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-[#F8FBF8] border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-brand-300 cursor-pointer"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="price_asc">{t('sort_price_asc')}</option>
              <option value="price_desc">{t('sort_price_desc')}</option>
            </select>
          </div>

          {/* Attribute filters — only when category is selected and has relevant attributes */}
          {selectedCategory && hasAttributeFilters && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-[#F8FBF8] rounded-xl border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Filtriraj:</span>
              {availableBrands.length > 1 && (
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:border-brand-300 cursor-pointer"
                >
                  <option value="">Svi brendovi</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              )}
              {availableSizes.length > 0 && (
                <select
                  value={filterSize}
                  onChange={(e) => setFilterSize(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[12px] text-gray-700 focus:outline-none focus:border-brand-300 cursor-pointer"
                >
                  <option value="">Sve veličine</option>
                  {availableSizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
              {(filterBrand || filterSize) && (
                <button
                  onClick={() => { setFilterBrand(''); setFilterSize(''); }}
                  className="px-3 py-2 text-[12px] text-red-500 hover:text-red-700 border border-red-200 rounded-lg bg-white transition-colors flex items-center gap-1"
                >
                  <i className="ri-close-line" />
                  Resetuj
                </button>
              )}
            </div>
          )}

          {/* Category pills — ONLY categories with products, sorted by count */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border ${
                !selectedCategory
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              Sve kategorije
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(String(cat.id))}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border ${
                  selectedCategory === String(cat.id)
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {cat.name}
                <span className="ml-1.5 text-[10px] opacity-60">({cat._count})</span>
              </button>
            ))}
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse border border-gray-100">
                  <div className="bg-gray-200 aspect-square rounded-xl mb-4" />
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                  <div className="bg-gray-200 h-5 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5 bg-gray-50 rounded-full">
                <i className="ri-shopping-bag-line text-3xl text-gray-300" />
              </div>
              <p className="text-gray-500 text-[15px] font-medium mb-2">{t('no_products')}</p>
              <p className="text-[13px] text-gray-400 mb-4">Pokušajte sa drugačijim filterima ili pretragom.</p>
              <button
                onClick={() => { handleCategoryChange(null); setSearch(''); setFilterBrand(''); setFilterSize(''); }}
                className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 underline"
              >
                Prikaži sve proizvode
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badge={getBadge(i, product.stock)}
                  rating={5}
                  reviewCount={6 + i * 4}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
