import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";

interface Category {
  id: number;
  name: string;
  sort_order: number;
  image: string | null;
  parent_id: number | null;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", sort_order: "0", image: "", parent_id: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const SUPABASE_URL = "https://sfglamzkxetrhcfbthhb.supabase.co";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ2xhbXpreGV0cmhjZmJ0aGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk0Mjk3OCwiZXhwIjoyMDk0NTE4OTc4fQ.34ZY3HBvqf5Ht3VoGWhiEicqQbcC5X76DDkgI7QPpGY";

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `categories/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "apikey": SERVICE_KEY,
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: file,
      });
      if (!res.ok) throw new Error(await res.text());
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
      setForm((prev) => ({ ...prev, image: publicUrl }));
    } catch (err: any) {
      setUploadError(`Greška: ${err.message}`);
    }
    setUploading(false);
    e.target.value = "";
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi("list", "product_categories", {
        orderBy: { column: "sort_order", ascending: true },
      });
      setCategories((result as any).rows as Category[]);
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

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", sort_order: "0", image: "", parent_id: "" });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      sort_order: cat.sort_order?.toString() || "0",
      image: cat.image || "",
      parent_id: cat.parent_id?.toString() || "",
    });
    setModalOpen(true);
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent?.name || null;
  };

  const getCategoryDepth = (cat: Category): number => {
    let depth = 0;
    let current = cat;
    while (current.parent_id) {
      depth++;
      const parent = categories.find((c) => c.id === current.parent_id);
      if (!parent) break;
      current = parent;
    }
    return depth;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name.trim(),
        sort_order: parseInt(form.sort_order) || 0,
        image: form.image.trim() || null,
        parent_id: form.parent_id ? parseInt(form.parent_id) : null,
      };
      if (editing) {
        await adminApi("update", "product_categories", { id: editing.id, data });
        setToast("Kategorija izmenjena!");
      } else {
        await adminApi("create", "product_categories", { data });
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
      await adminApi("delete", "product_categories", { id });
      setToast("Kategorija obrisana!");
      fetchCategories();
    } catch (err: any) {
      setToast(err.message || "Greška pri brisanju");
    }
    setTimeout(() => setToast(""), 3000);
  };

  // Sort so parents come before children
  const sortedCategories = [...categories].sort((a, b) => {
    const depthA = getCategoryDepth(a);
    const depthB = getCategoryDepth(b);
    if (depthA !== depthB) return depthA - depthB;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  const parentOptions = editing
    ? categories.filter((c) => c.id !== editing.id)
    : categories;

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#161B22] border border-white/10 rounded-xl px-5 py-3 flex items-center gap-2 shadow-xl">
          <i className="ri-information-line text-brand-400" />
          <span className="text-sm text-white">{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">Kategorije</h1>
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
                  <th className="text-left px-5 py-3 font-medium">Roditelj</th>
                  <th className="text-left px-5 py-3 font-medium">Redosled</th>
                  <th className="text-left px-5 py-3 font-medium">Slika</th>
                  <th className="text-right px-5 py-3 font-medium">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedCategories.map((c) => {
                  const depth = getCategoryDepth(c);
                  return (
                    <tr key={c.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-white font-medium">
                        <div className="flex items-center gap-2">
                          {depth > 0 && (
                            <span className="text-gray-600">
                              {"└─ ".repeat(depth)}
                            </span>
                          )}
                          {c.name}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-300 text-xs">
                        {getParentName(c.parent_id) || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-300">{c.sort_order}</td>
                      <td className="px-5 py-3">
                        {c.image ? (
                          <img src={c.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                            <i className="ri-image-line text-gray-600" />
                          </div>
                        )}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Roditeljska kategorija</label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all appearance-none"
                >
                  <option value="">Nema (glavna kategorija)</option>
                  {parentOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Redosled (sort_order)</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Slika kategorije</label>
                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all mb-2 ${uploading ? "border-brand-500 bg-brand-500/5" : "border-white/10 hover:border-brand-500/50 hover:bg-white/3"}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  {uploading ? (
                    <><i className="ri-loader-4-line text-brand-400 text-xl animate-spin mb-1" /><span className="text-xs text-gray-400">Uploading...</span></>
                  ) : form.image ? (
                    <><img src={form.image} alt="" className="h-16 w-auto object-contain rounded-lg" /><span className="text-[11px] text-gray-500 mt-1">Klikni da promeniš</span></>
                  ) : (
                    <><i className="ri-upload-cloud-2-line text-gray-400 text-xl mb-1" /><span className="text-xs text-gray-300">Klikni da uploaduješ sliku</span></>
                  )}
                </label>
                {uploadError && <p className="text-xs text-red-400 mb-2">{uploadError}</p>}
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="ili unesi URL ručno..."
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