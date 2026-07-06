import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export default function AdminBlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", sort_order: "0" });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi("list", "blog_categories", {
        orderBy: { column: "sort_order", ascending: true },
      });
      setCategories((result as any).rows as BlogCategory[]);
    } catch (err: any) {
      setToast(err.message || "Greška");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 80);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", sort_order: "0" });
    setModalOpen(true);
  };

  const openEdit = (cat: BlogCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      sort_order: cat.sort_order?.toString() || "0",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = form.slug.trim() || slugify(form.name);
      const data = {
        name: form.name.trim(),
        slug,
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (editing) {
        await adminApi("update", "blog_categories", { id: editing.id, data });
        setToast("Kategorija izmenjena!");
      } else {
        await adminApi("create", "blog_categories", { data });
        setToast("Kategorija dodata!");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setToast(err.message || "Greška pri čuvanju");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovu kategoriju?")) return;
    try {
      await adminApi("delete", "blog_categories", { id });
      setToast("Kategorija obrisana!");
      fetchCategories();
    } catch (err: any) {
      setToast(err.message || "Greška pri brisanju");
    }
    setTimeout(() => setToast(""), 3000);
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
        <h1 className="text-2xl font-bold text-white">Blog kategorije</h1>
        <button
          onClick={openCreate}
          className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Dodaj kategoriju
        </button>
      </div>

      <div className="bg-[#161B22] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Učitavanje...</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">Nema kategorija</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Naziv</th>
                  <th className="text-left px-5 py-3 font-medium">Slug</th>
                  <th className="text-left px-5 py-3 font-medium">Redosled</th>
                  <th className="text-right px-5 py-3 font-medium">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{c.name}</td>
                    <td className="px-5 py-3 text-gray-300 text-xs">/{c.slug}</td>
                    <td className="px-5 py-3 text-gray-300">{c.sort_order}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">{editing ? "Izmeni kategoriju" : "Dodaj kategoriju"}</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Naziv *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="automobili-na-akumulator"
                />
                <p className="text-[11px] text-gray-500 mt-1">Ako ostavite prazno, generiše se automatski.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Redosled</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-all whitespace-nowrap"
                >
                  {editing ? "Sačuvaj" : "Dodaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}