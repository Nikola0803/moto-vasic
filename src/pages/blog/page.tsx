import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/feature/Layout';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  status: string;
  created_at: string;
  category_id: number | null;
  blog_categories?: { id: number; name: string; slug: string };
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Blog | Moto Vasić — Saveti, vodiči i novosti o ATV kvadovima i moto vozilima';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Moto Vasić blog — stručni saveti o ATV kvadovima, kros motorima, bagijima i skuterima. Vodiči za kupovinu, saveti za bezbednost i moto opremu za decu i odrasle.');

    async function fetchData() {
      setLoading(true);
      const { data: catData } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .order('sort_order');
      if (catData) setCategories(catData);

      let query = supabase
        .from('blog_posts')
        .select('*, blog_categories(id, name, slug)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data: postData } = await query;
      if (postData) setPosts(postData as BlogPost[]);
      setLoading(false);
    }
    fetchData();
  }, [selectedCategory]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <div className="pt-24 md:pt-32 pb-10 md:pb-14 px-4 md:px-10 bg-[#FFFDF9]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-3">
            <Link to="/" className="hover:text-brand-600 transition-colors">Početna</Link>
            <i className="ri-arrow-right-s-line" />
            <span className="text-gray-500">Blog</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">Blog — Saveti i vodiči</h1>
          <p className="text-[13px] text-gray-500 max-w-xl">
            Najnoviji članci o dečijim vozilima, igračkama, bezbednosti i saveti za roditelje prilikom kupovine.
          </p>
        </div>
      </div>

      <div className="pb-16 md:pb-24 px-4 md:px-10 bg-white min-h-screen">
        <div className="max-w-[1440px] mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border ${
                !selectedCategory
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              Svi članci
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                  <div className="bg-gray-200 aspect-[16/10] rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="bg-gray-200 h-4 rounded w-1/4" />
                    <div className="bg-gray-200 h-5 rounded w-3/4" />
                    <div className="bg-gray-200 h-3 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5 bg-gray-50 rounded-full">
                <i className="ri-article-line text-3xl text-gray-300" />
              </div>
              <p className="text-gray-500 text-[15px] font-medium mb-2">Nema objavljenih članaka</p>
              <p className="text-[13px] text-gray-400">Uskoro stižu novi članci!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article key={post.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand-200 transition-all">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="aspect-[16/10] bg-[#FFFDF9] overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="ri-image-line text-4xl text-gray-200" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {post.blog_categories && (
                        <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                          {post.blog_categories.name}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">{formatDate(post.created_at)}</span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="block">
                      <h3 className="text-[15px] font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3">
                      {post.excerpt || 'Pročitajte više o ovoj temi...'}
                    </p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors mt-4"
                    >
                      Pročitaj više
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}