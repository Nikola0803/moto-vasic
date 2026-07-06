import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/lib/admin-api";

interface Stats {
  products: number;
  categories: number;
  orders: number;
  activeProducts: number;
}

interface Order {
  id: number;
  status: string;
  recipient: { name?: string; phone?: string };
  created_at: string;
  order_items: { id: number; product_name: string; quantity: number; final_price: number }[];
}

const statCards = [
  { key: "products" as const, label: "Ukupno proizvoda", icon: "ri-shopping-bag-line", color: "bg-blue-500/10 text-blue-400" },
  { key: "activeProducts" as const, label: "Aktivni proizvodi", icon: "ri-check-double-line", color: "bg-emerald-500/10 text-emerald-400" },
  { key: "categories" as const, label: "Kategorije", icon: "ri-apps-line", color: "bg-amber-500/10 text-amber-400" },
  { key: "orders" as const, label: "Porudžbine", icon: "ri-file-list-3-line", color: "bg-brand-500/10 text-brand-400" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, categories: 0, orders: 0, activeProducts: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodResult, catResult, ordResult] = await Promise.all([
          adminApi("list", "product_items", { selectQuery: "id,status" }),
          adminApi("list", "product_categories"),
          adminApi("orders_with_items", "order_headers"),
        ]);
        const products = (prodResult as any).rows || [];
        const categories = (catResult as any).rows || [];
        const orders = (ordResult as any).rows || [];
        setStats({
          products: (prodResult as any).total || products.length,
          categories: categories.length,
          orders: orders.length,
          activeProducts: products.filter((p: { status: string }) => p.status === "active").length,
        });
        setRecentOrders((orders as Order[]).slice(0, 5));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("sr-RS");
  const formatPrice = (n: number) => `${Number(n).toLocaleString("sr-RS")} RSD`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <div key={card.key} className="bg-[#161B22] border border-white/5 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <i className={`${card.icon} text-lg`} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {loading ? "—" : stats[card.key]}
            </p>
            <p className="text-xs text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link
          to="/admin/proizvodi"
          className="bg-[#161B22] border border-white/5 rounded-xl p-5 hover:border-brand-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <i className="ri-shopping-bag-line text-lg" />
            </div>
            <i className="ri-arrow-right-line text-gray-600 group-hover:text-brand-400 transition-colors" />
          </div>
          <p className="font-semibold text-white text-sm">Upravljaj proizvodima</p>
          <p className="text-xs text-gray-500 mt-1">Dodaj, izmeni ili obriši proizvode</p>
        </Link>
        <Link
          to="/admin/kategorije"
          className="bg-[#161B22] border border-white/5 rounded-xl p-5 hover:border-brand-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <i className="ri-apps-line text-lg" />
            </div>
            <i className="ri-arrow-right-line text-gray-600 group-hover:text-brand-400 transition-colors" />
          </div>
          <p className="font-semibold text-white text-sm">Kategorije</p>
          <p className="text-xs text-gray-500 mt-1">Organizuj kategorije proizvoda</p>
        </Link>
        <Link
          to="/admin/porudzbine"
          className="bg-[#161B22] border border-white/5 rounded-xl p-5 hover:border-brand-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <i className="ri-file-list-3-line text-lg" />
            </div>
            <i className="ri-arrow-right-line text-gray-600 group-hover:text-brand-400 transition-colors" />
          </div>
          <p className="font-semibold text-white text-sm">Porudžbine</p>
          <p className="text-xs text-gray-500 mt-1">Pregled svih porudžbina</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#161B22] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">Skorije porudžbine</h2>
          <Link to="/admin/porudzbine" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Pogledaj sve
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Učitavanje...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Nema porudžbina</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Kupac</th>
                  <th className="text-left px-5 py-3 font-medium">Proizvodi</th>
                  <th className="text-left px-5 py-3 font-medium">Iznos</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => {
                  const total = order.order_items.reduce((sum: number, item: { final_price: number; quantity: number }) => sum + (item.final_price || 0) * item.quantity, 0);
                  return (
                    <tr key={order.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-gray-300 font-mono">#{order.id}</td>
                      <td className="px-5 py-3 text-gray-300">{order.recipient?.name || "—"}</td>
                      <td className="px-5 py-3 text-gray-300">{order.order_items.length} proizvod(a)</td>
                      <td className="px-5 py-3 text-gray-300">{formatPrice(total)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === "paid" ? "bg-emerald-500/10 text-emerald-400" :
                          order.status === "pending_payment" ? "bg-amber-500/10 text-amber-400" :
                          order.status === "shipped" ? "bg-blue-500/10 text-blue-400" :
                          "bg-gray-500/10 text-gray-400"
                        }`}>
                          {order.status === "paid" && <i className="ri-check-line" />}
                          {order.status === "pending_payment" && <i className="ri-time-line" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(order.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}