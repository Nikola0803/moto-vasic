import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  category_id: number | null;
  image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  blog_categories?: { name: string };
}

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  status: string;
  category_id: string;
  meta_title: string;
  meta_description: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 80);
}

const emptyForm: PostFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  status: "draft",
  category_id: "",
  meta_title: "",
  meta_description: "",
};

function PostFormModal({
  open,
  onClose,
  onSave,
  categories,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>, id?: number) => void;
  categories: BlogCategory[];
  editing: BlogPost | null;
}) {
  const [form, setForm] = useState<PostFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt || "",
        content: "",
        image: editing.image || "",
        status: editing.status,
        category_id: editing.category_id?.toString() || "",
        meta_title: editing.meta_title || "",
        meta_description: editing.meta_description || "",
      });
    } else {
      setForm(emptyForm);
    }
    setActiveTab("content");
  }, [editing, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = form.slug.trim() || slugify(form.title);

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      image: form.image.trim() || null,
      status: form.status,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    };

    onSave(payload, editing?.id);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white">{editing ? "Izmeni članak" : "Dodaj članak"}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-1 bg-[#0F1117] rounded-xl p-1">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "content" ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Sadržaj
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "seo" ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              SEO
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === "content" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Naslov *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="Naslov članka..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                    placeholder="slug-url-clanka"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Objavljen</option>
                    <option value="archived">Arhiviran</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Kategorija</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all appearance-none"
                >
                  <option value="">Bez kategorije</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Istaknuta slika (URL)</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Kratak uvod (excerpt)</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                  placeholder="Kratak opis koji se prikazuje na listi članaka..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Sadržaj članka</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                  placeholder="Celi tekst članka..."
                />
                <p className="text-[11px] text-gray-500 mt-1">Možete koristiti običan tekst. Formatiranje će biti sačuvano.</p>
              </div>
            </>
          )}

          {activeTab === "seo" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Meta naslov (title)</label>
                <input
                  value={form.meta_title}
                  onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="SEO naslov za Google..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Meta opis (description)</label>
                <textarea
                  value={form.meta_description}
                  onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                  placeholder="SEO opis koji se prikazuje u rezultatima pretrage..."
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 disabled:bg-gray-700 text-white transition-all whitespace-nowrap"
            >
              {saving ? "Čuvanje..." : editing ? "Sačuvaj izmene" : "Dodaj članak"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [toast, setToast] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (search) filters.search = search;
      if (filterStatus) filters.status = filterStatus;

      const result = await adminApi("list", "blog_posts", {
        selectQuery: "*, blog_categories(id, name)",
        filters: Object.keys(filters).length ? filters : undefined,
        orderBy: { column: "created_at", ascending: false },
        searchColumn: "title",
      });
      setPosts((result as any).rows as BlogPost[]);
    } catch (err: any) {
      setToast(err.message || "Greška pri učitavanju");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  const fetchCategories = useCallback(async () => {
    try {
      const catResult = await adminApi("list", "blog_categories", {
        orderBy: { column: "sort_order", ascending: true },
      });
      setCategories((catResult as any).rows as BlogCategory[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSave = async (data: Record<string, unknown>, id?: number) => {
    try {
      if (id) {
        await adminApi("update", "blog_posts", { id, data });
        setToast("Članak izmenjen!");
      } else {
        await adminApi("create", "blog_posts", { data });
        setToast("Članak dodat!");
      }
      setModalOpen(false);
      setEditing(null);
      fetchPosts();
    } catch (err: any) {
      setToast(err.message || "Greška pri čuvanju");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj članak?")) return;
    try {
      await adminApi("delete", "blog_posts", { id });
      setToast("Članak obrisan!");
      fetchPosts();
    } catch (err: any) {
      setToast(err.message || "Greška pri brisanju");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      published: "bg-emerald-500/10 text-emerald-400",
      draft: "bg-amber-500/10 text-amber-400",
      archived: "bg-gray-500/10 text-gray-400",
    };
    return map[status] || map.draft;
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#161B22] border border-white/10 rounded-xl px-5 py-3 flex items-center gap-2 shadow-xl">
          <i className="ri-information-line text-brand-400" />
          <span className="text-sm text-white">{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">Blog članci</h1>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Dodaj članak
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži članke..."
            className="w-full bg-[#161B22] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#161B22] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all appearance-none"
        >
          <option value="">Svi statusi</option>
          <option value="published">Objavljeni</option>
          <option value="draft">Draft</option>
          <option value="archived">Arhivirani</option>
        </select>
      </div>

      <div className="bg-[#161B22] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Učitavanje...</div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">Nema članaka</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Članak</th>
                  <th className="text-left px-5 py-3 font-medium">Kategorija</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Datum</th>
                  <th className="text-right px-5 py-3 font-medium">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <i className="ri-image-line text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{p.title}</p>
                          <p className="text-gray-500 text-xs">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-300 text-xs">{p.blog_categories?.name || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-300 text-xs">
                      {new Date(p.created_at).toLocaleDateString("sr-RS")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditing(p); setModalOpen(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PostFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        categories={categories}
        editing={editing}
      />
    </div>
  );
}