import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "./layout";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (pin === "igrajse2025") {
        loginAdmin();
        navigate("/admin/panel");
      } else {
        setError("Pogrešan PIN. Pokušajte ponovo.");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-brand-600/20">
            <i className="ri-shield-user-line text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-sm text-gray-400">Unesite PIN da pristupite upravljanju</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#161B22] border border-white/5 rounded-2xl p-6 md:p-8">
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">PIN kod</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••••"
              maxLength={20}
              className="w-full bg-[#0F1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <i className="ri-error-warning-line text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="ri-loader-4-line animate-spin" />
                Provera...
              </span>
            ) : (
              "Prijavi se"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gray-600">
          PIN: <code className="text-gray-500">igrajse2025</code>
        </p>
      </div>
    </div>
  );
}