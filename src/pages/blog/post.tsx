import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/feature/Layout';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  status: string;
  created_at: string;
  meta_title: string | null;
  meta_description: string | null;
  category_id: number | null;
  blog_categories?: { id: number; name: string; slug: string };
}

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      setLoading(true);

      const { data } = await supabase
        .from('blog_posts')
        .select('*, blog_categories(id, name, slug)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (data) {
        setPost(data as BlogPost);
        document.title = data.meta_title || `${data.title} | Moto Vasić Blog`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', data.meta_description || data.excerpt || 'Pročitajte stručni članak na Moto Vasić blogu o ATV kvadovima, kros motorima i moto opremi.');

        const { data: rel } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, image, created_at')
          .eq('status', 'published')
          .neq('id', data.id)
          .limit(3)
          .order('created_at', { ascending: false });
        if (rel) setRelated(rel as BlogPost[]);
      }
      setLoading(false);
    }
    fetchPost();
  }, [slug]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="pt-24 md:pt-32 px-4 md:px-10 max-w-[1440px] mx-auto pb-12">
          <div className="animate-pulse max-w-3xl mx-auto">
            <div className="bg-gray-200 h-5 rounded w-32 mb-8" />
            <div className="bg-gray-200 aspect-[16/9] rounded-2xl mb-8" />
            <div className="bg-gray-200 h-8 rounded w-3/4 mb-4" />
            <div className="bg-gray-200 h-4 rounded w-full mb-2" />
            <div className="bg-gray-200 h-4 rounded w-5/6 mb-2" />
            <div className="bg-gray-200 h-4 rounded w-4/5" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="pt-24 md:pt-32 px-4 md:px-10 text-center py-24">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5 bg-gray-50 rounded-full">
            <i className="ri-error-warning-line text-3xl text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Članak nije pronađen</h2>
          <p className="text-sm text-gray-500 mb-6">Članak koji tražite možda više nije dostupan.</p>
          <Link to="/blog" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Nazad na blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-10 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-8">
              <Link to="/" className="hover:text-brand-600 transition-colors">Početna</Link>
              <i className="ri-arrow-right-s-line" />
              <Link to="/blog" className="hover:text-brand-600 transition-colors">Blog</Link>
              {post.blog_categories && (
                <>
                  <i className="ri-arrow-right-s-line" />
                  <Link to={`/blog?kategorija=${post.blog_categories.id}`} className="hover:text-brand-600 transition-colors">
                    {post.blog_categories.name}
                  </Link>
                </>
              )}
              <i className="ri-arrow-right-s-line" />
              <span className="text-gray-500 line-clamp-1">{post.title}</span>
            </div>

            {/* Category + Date */}
            <div className="flex items-center gap-3 mb-5">
              {post.blog_categories && (
                <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">
                  {post.blog_categories.name}
                </span>
              )}
              <span className="text-[12px] text-gray-400">{formatDate(post.created_at)}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Featured Image */}
            {post.image && (
              <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-[#FFFDF9]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              {post.content ? (
                <div className="text-[14px] md:text-[15px] text-gray-700 leading-[1.8] whitespace-pre-wrap">
                  {post.content}
                </div>
              ) : (
                <p className="text-[14px] text-gray-500 italic">Sadržaj članka uskoro dostupan.</p>
              )}
            </div>

            {/* Share */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <p className="text-[12px] font-semibold text-gray-500 mb-3 uppercase tracking-wide">Pratite nas</p>
              <div className="flex gap-2">
                <a
                  href="https://www.instagram.com/motovasicnn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-all"
                  aria-label="Instagram"
                >
                  <i className="ri-instagram-line" />
                </a>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16 md:mt-24 max-w-3xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">Povezani članci</h2>
              <div className="space-y-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to={`/blog/${r.slug}`}
                    className="flex gap-4 p-4 bg-[#FFFDF9] rounded-xl border border-gray-100 hover:border-brand-200 transition-all group"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-white overflow-hidden shrink-0 flex items-center justify-center">
                      {r.image ? (
                        <img src={r.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <i className="ri-image-line text-gray-300 text-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                        {r.title}
                      </h3>
                      <p className="text-[12px] text-gray-500 line-clamp-2">{r.excerpt || ''}</p>
                      <span className="text-[11px] text-gray-400 mt-2 block">{formatDate(r.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}