import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface Product {
  id: number;
  name: string;
  category_id: number | null;
  status: string;
  price: number;
  stock: number;
  discount_enabled: boolean;
  discount_price: number | null;
  media: { url: string; type: string }[];
  short_description: string | null;
  description: string | null;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  product_categories?: { name: string };
}

interface ProductFormData {
  name: string;
  category_id: string;
  status: string;
  short_description: string;
  description: string;
  price: string;
  stock: string;
  discount_enabled: boolean;
  discount_price: string;
  images: string[];
  slug: string;
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

const emptyForm: ProductFormData = {
  name: "",
  category_id: "",
  status: "active",
  short_description: "",
  description: "",
  price: "",
  stock: "",
  discount_enabled: false,
  discount_price: "",
  images: [],
  slug: "",
  meta_title: "",
  meta_description: "",
};

function ProductFormModal({
  open,
  onClose,
  onSave,
  categories,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>, id?: number) => void;
  categories: Category[];
  editing: Product | null;
}) {
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "seo" | "gallery">("basic");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const SUPABASE_URL = "https://sfglamzkxetrhcfbthhb.supabase.co";
  const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZ2xhbXpreGV0cmhjZmJ0aGhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk0Mjk3OCwiZXhwIjoyMDk0NTE4OTc4fQ.34ZY3HBvqf5Ht3VoGWhiEicqQbcC5X76DDkgI7QPpGY";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
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
        uploaded.push(publicUrl);
      } catch (err: any) {
        setUploadError(`Greška pri uploadu: ${err.message}`);
      }
    }
    if (uploaded.length > 0) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
    }
    setUploading(false);
    e.target.value = "";
  };

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        category_id: editing.category_id?.toString() || "",
        status: editing.status,
        short_description: editing.short_description || "",
        description: editing.description || "",
        price: editing.price?.toString() || "",
        stock: editing.stock?.toString() || "",
        discount_enabled: editing.discount_enabled,
        discount_price: editing.discount_price?.toString() || "",
        images: editing.media?.map((m) => m.url) || [],
        slug: editing.slug || "",
        meta_title: editing.meta_title || "",
        meta_description: editing.meta_description || "",
      });
    } else {
      setForm(emptyForm);
    }
    setActiveTab("basic");
    setNewImageUrl("");
  }, [editing, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const media = form.images
      .filter((url) => url.trim())
      .map((url) => ({ url: url.trim(), type: "image" }));

    const slug = form.slug.trim() || slugify(form.name);

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      category_id: form.category_id ? parseInt(form.category_id) : null,
      status: form.status,
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      price: form.price ? parseFloat(form.price) : 0,
      stock: form.stock ? parseInt(form.stock) : 0,
      discount_enabled: form.discount_enabled,
      discount_price: form.discount_enabled && form.discount_price ? parseFloat(form.discount_price) : null,
      media,
      slug,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    };

    onSave(payload, editing?.id);
    setSaving(false);
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
    setNewImageUrl("");
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const tabs = [
    { key: "basic" as const, label: "Osnovno", icon: "ri-file-info-line" },
    { key: "gallery" as const, label: "Galerija", icon: "ri-image-line" },
    { key: "seo" as const, label: "SEO", icon: "ri-search-line" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white">
            {editing ? "Izmeni proizvod" : "Dodaj proizvod"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 bg-[#0F1117] rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-brand-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <i className={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === "basic" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Naziv proizvoda *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="npr. Automobil na akumulator BMW"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="active">Aktivan</option>
                    <option value="inactive">Neaktivan</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Kratak opis</label>
                <textarea
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  rows={2}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                  placeholder="Kratak opis za karticu proizvoda..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Dugi opis</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all resize-none"
                  placeholder="Detaljan opis proizvoda..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Cena (RSD) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                    placeholder="15000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Zaliha *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="disc"
                  type="checkbox"
                  checked={form.discount_enabled}
                  onChange={(e) => setForm({ ...form, discount_enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-[#0F1117] text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="disc" className="text-sm text-gray-300">Akcijska cena</label>
              </div>
              {form.discount_enabled && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Akcijska cena (RSD)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.discount_price}
                    onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                    className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                    placeholder="12000"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Slug (URL identifikator)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="automobil-na-akumulator-bmw"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Ako ostavite prazno, generiše se automatski iz naziva.
                </p>
              </div>
            </>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-4">
              {/* Upload dugme */}
              <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? "border-brand-500 bg-brand-500/5" : "border-white/10 hover:border-brand-500/50 hover:bg-white/3"}`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <i className="ri-loader-4-line text-brand-400 text-2xl animate-spin mb-2" />
                    <span className="text-sm text-gray-400">Uploading...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-upload-cloud-2-line text-gray-400 text-2xl mb-2" />
                    <span className="text-sm text-gray-300 font-medium">Klikni ili prevuci slike ovde</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG, WebP — više fajlova odjednom</span>
                  </>
                )}
              </label>

              {uploadError && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{uploadError}</p>
              )}

              {/* URL fallback */}
              <div className="flex gap-2">
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                  className="flex-1 bg-[#0F1117] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
                  placeholder="ili unesi URL slike ručno..."
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white transition-all whitespace-nowrap"
                >
                  <i className="ri-add-line" /> Dodaj
                </button>
              </div>

              {form.images.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">Nema dodatih slika</p>
              )}
              <div className="grid grid-cols-3 gap-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0F1117]">
                    <img src={url} alt="" className="w-full aspect-square object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="ri-close-line text-xs" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded-md font-medium">Glavna</span>
                    )}
                  </div>
                ))}
              </div>
              {form.images.length > 1 && (
                <p className="text-[11px] text-gray-500">Prva slika je glavna. Obriši i dodaj ponovo da promeniš redosled.</p>
              )}
            </div>
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
              {saving ? "Čuvanje..." : editing ? "Sačuvaj izmene" : "Dodaj proizvod"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PAGE_SIZE = 40;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [toast, setToast] = useState("");

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchProducts = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (search) filters.search = search;
      if (filterCategory) filters.category_id = parseInt(filterCategory);
      if (filterStatus) filters.status = filterStatus;

      const result = await adminApi("list", "product_items", {
        selectQuery: "*, product_categories(id, name)",
        filters: Object.keys(filters).length ? filters : undefined,
        orderBy: { column: "created_at", ascending: false },
        page: p,
        pageSize: PAGE_SIZE,
      });
      setProducts((result as any).rows as Product[]);
      setTotal((result as any).total);
    } catch (err: any) {
      setToast(err.message || "Greška pri učitavanju");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus, page]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await adminApi("list", "product_categories", {
        orderBy: { column: "sort_order", ascending: true },
      });
      setCategories((result as any).rows as Category[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(page); }, [search, filterCategory, filterStatus, page]);

  // Reset to page 1 when filters change
  const applySearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryFilter = (val: string) => {
    setFilterCategory(val);
    setPage(1);
  };

  const handleStatusFilter = (val: string) => {
    setFilterStatus(val);
    setPage(1);
  };

  const handleSave = async (data: Record<string, unknown>, id?: number) => {
    try {
      if (id) {
        await adminApi("update", "product_items", { id, data });
        setToast("Proizvod izmenjen!");
      } else {
        await adminApi("create", "product_items", { data });
        setToast("Proizvod dodat!");
      }
      setModalOpen(false);
      setEditing(null);
      fetchProducts(page);
    } catch (err: any) {
      setToast(err.message || "Greška pri čuvanju");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj proizvod?")) return;
    try {
      await adminApi("delete", "product_items", { id });
      setToast("Proizvod obrisan!");
      // If we deleted last item on this page, go back
      if (products.length === 1 && page > 1) setPage(p => p - 1);
      else fetchProducts(page);
    } catch (err: any) {
      setToast(err.message || "Greška pri brisanju");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const openEdit = (product: Product) => { setEditing(product); setModalOpen(true); };
  const openCreate = () => { setEditing(null); setModalOpen(true); };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-emerald-500/10 text-emerald-400",
      inactive: "bg-gray-500/10 text-gray-400",
      draft: "bg-amber-500/10 text-amber-400",
    };
    return map[status] || map.inactive;
  };

  const formatPrice = (n: number) => `${Number(n).toLocaleString("sr-RS")} RSD`;

  const pageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
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
        <div>
          <h1 className="text-2xl font-bold text-white">Proizvodi</h1>
          {!loading && <p className="text-gray-500 text-sm mt-0.5">{total} ukupno</p>}
        </div>
        <button
          onClick={openCreate}
          className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <i className="ri-add-line" />
          Dodaj proizvod
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Pretraži proizvode..."
              className="w-full bg-[#161B22] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>
          <button
            onClick={applySearch}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-xl transition-all whitespace-nowrap"
          >
            Traži
          </button>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="bg-[#161B22] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all appearance-none"
        >
          <option value="">Sve kategorije</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="bg-[#161B22] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all appearance-none"
        >
          <option value="">Svi statusi</option>
          <option value="active">Aktivan</option>
          <option value="inactive">Neaktivan</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#161B22] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Učitavanje proizvoda...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">Nema proizvoda</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left px-5 py-3 font-medium">Proizvod</th>
                  <th className="text-left px-5 py-3 font-medium">Kategorija</th>
                  <th className="text-left px-5 py-3 font-medium">Cena</th>
                  <th className="text-left px-5 py-3 font-medium">Zaliha</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {p.media?.[0]?.url ? (
                            <img src={p.media[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <i className="ri-image-line text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{p.name}</p>
                          <p className="text-gray-500 text-xs">ID: {p.id}{p.slug ? ` | /${p.slug}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{p.product_categories?.name || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="text-gray-300">
                        {p.price > 0 ? formatPrice(p.price) : <span className="text-brand-400 text-xs">Upit</span>}
                        {p.discount_enabled && p.discount_price && (
                          <span className="block text-xs text-emerald-400">{formatPrice(p.discount_price)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{p.stock}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                          title="Izmeni"
                        >
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Obriši"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-gray-500 text-sm">
            Stranica {page} od {totalPages} &nbsp;·&nbsp; {total} proizvoda
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Prva"
            >
              <i className="ri-skip-back-line text-xs" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <i className="ri-arrow-left-s-line" />
            </button>
            {pageNumbers().map((n, i) =>
              n === '...' ? (
                <span key={i} className="w-8 h-8 flex items-center justify-center text-gray-600 text-sm">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                    page === n
                      ? 'bg-brand-600 text-white font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              )
            )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <i className="ri-arrow-right-s-line" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Poslednja"
            >
              <i className="ri-skip-forward-line text-xs" />
            </button>
          </div>
        </div>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        categories={categories}
        editing={editing}
      />
    </div>
  );
}
