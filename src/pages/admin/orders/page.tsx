import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  final_price: number;
}

interface Order {
  id: number;
  status: string;
  customer_notes: string | null;
  admin_notes: string | null;
  currency: string;
  shipping_total: number;
  subtotal_items: number;
  discount_price: number;
  recipient: { name?: string; phone?: string; email?: string; address?: string; city?: string };
  created_at: string;
  order_items: OrderItem[];
}

const statusOptions = [
  { value: "pending_payment", label: "Na čekanju", color: "bg-amber-500/10 text-amber-400" },
  { value: "paid", label: "Plaćeno", color: "bg-emerald-500/10 text-emerald-400" },
  { value: "processing", label: "U obradi", color: "bg-blue-500/10 text-blue-400" },
  { value: "shipped", label: "Poslato", color: "bg-purple-500/10 text-purple-400" },
  { value: "delivered", label: "Dostavljeno", color: "bg-teal-500/10 text-teal-400" },
  { value: "cancelled", label: "Otkazano", color: "bg-red-500/10 text-red-400" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi("orders_with_items", "order_headers");
      setOrders((data as any).rows as Order[]);
    } catch (err: any) {
      setToast(err.message || "Greška pri učitavanju");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await adminApi("update", "order_headers", {
        id: orderId,
        data: { status: newStatus },
      });
      setToast("Status izmenjen!");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      setToast(err.message || "Greška");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("sr-RS", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatPrice = (n: number) => `${Number(n).toLocaleString("sr-RS")} RSD`;

  const statusInfo = (status: string) => statusOptions.find((s) => s.value === status) || statusOptions[0];

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#161B22] border border-white/10 rounded-xl px-5 py-3 flex items-center gap-2 shadow-xl">
          <i className="ri-information-line text-brand-400" />
          <span className="text-sm text-white">{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">Porudžbine</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#161B22] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-all appearance-none"
        >
          <option value="">Svi statusi</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#161B22] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Učitavanje porudžbina...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">Nema porudžbina</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Kupac</th>
                  <th className="text-left px-5 py-3 font-medium">Iznos</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Datum</th>
                  <th className="text-right px-5 py-3 font-medium">Detalji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const total = (order.subtotal_items || 0) + (order.shipping_total || 0) - (order.discount_price || 0);
                  const s = statusInfo(order.status);
                  return (
                    <>
                      <tr key={order.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-5 py-3 text-gray-300 font-mono">#{order.id}</td>
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-gray-300 text-sm">{order.recipient?.name || "—"}</p>
                            <p className="text-gray-500 text-xs">{order.recipient?.phone || ""}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-300 font-medium">{formatPrice(total)}</td>
                        <td className="px-5 py-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 appearance-none cursor-pointer ${s.color}`}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(order.created_at)}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <i className={`${expanded === order.id ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-lg`} />
                          </button>
                        </td>
                      </tr>
                      {expanded === order.id && (
                        <tr>
                          <td colSpan={6} className="px-5 py-4 bg-[#0F1117]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Podaci o kupcu</h4>
                                <div className="space-y-2 text-sm">
                                  <p className="text-gray-300"><span className="text-gray-500">Ime:</span> {order.recipient?.name || "—"}</p>
                                  <p className="text-gray-300"><span className="text-gray-500">Telefon:</span> {order.recipient?.phone || "—"}</p>
                                  <p className="text-gray-300"><span className="text-gray-500">Email:</span> {order.recipient?.email || "—"}</p>
                                  <p className="text-gray-300"><span className="text-gray-500">Adresa:</span> {order.recipient?.address || "—"}, {order.recipient?.city || ""}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Proizvodi</h4>
                                <div className="space-y-2">
                                  {order.order_items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                                      <span className="text-gray-300">{item.product_name} x{item.quantity}</span>
                                      <span className="text-gray-400">{formatPrice((item.final_price || item.unit_price) * item.quantity)}</span>
                                    </div>
                                  ))}
                                  <div className="pt-2 flex items-center justify-between text-sm font-medium">
                                    <span className="text-white">Ukupno</span>
                                    <span className="text-brand-400">{formatPrice(total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {order.customer_notes && (
                              <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-xs text-gray-500 mb-1">Napomene kupca:</p>
                                <p className="text-sm text-gray-300">{order.customer_notes}</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
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