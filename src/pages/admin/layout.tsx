import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";

const ADMIN_AUTH_KEY = "igrajse_admin_auth";

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function loginAdmin() {
  localStorage.setItem(ADMIN_AUTH_KEY, "true");
}

function SidebarItem({ to, icon, label, active }: { to: string; icon: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <i className={`${icon} text-lg`} />
      <span>{label}</span>
    </Link>
  );
}

export function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = [
    { path: "/admin/panel", icon: "ri-dashboard-line", label: "Dashboard" },
    { path: "/admin/proizvodi", icon: "ri-shopping-bag-line", label: "Proizvodi" },
    { path: "/admin/kategorije", icon: "ri-apps-line", label: "Kategorije" },
    { path: "/admin/porudzbine", icon: "ri-file-list-3-line", label: "Porudžbine" },
    { path: "/admin/blog-clanci", icon: "ri-article-line", label: "Blog članci" },
    { path: "/admin/blog-kategorije", icon: "ri-folder-line", label: "Blog kategorije" },
  ];

  const activePath = location.pathname;

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#161B22] border-r border-white/5 fixed h-screen">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
              <i className="ri-shield-user-line text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Admin Panel</p>
              <p className="text-[10px] text-gray-500">Moto Vasić</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => (
            <SidebarItem key={item.path} to={item.path} icon={item.icon} label={item.label} active={activePath === item.path} />
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <i className="ri-arrow-left-line text-lg" />
            <span>Nazad na sajt</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all mt-1"
          >
            <i className="ri-logout-box-line text-lg" />
            <span>Odjavi se</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#161B22] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <i className="ri-shield-user-line text-white text-sm" />
          </div>
          <span className="font-bold text-white text-sm">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="w-9 h-9 flex items-center justify-center text-white">
          <i className={`${mobileOpen ? "ri-close-line" : "ri-menu-line"} text-xl`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#0F1117] pt-16 px-4 pb-4">
          <nav className="space-y-1">
            {menu.map((item) => (
              <SidebarItem
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                active={activePath === item.path}
              />
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-white/5 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <i className="ri-arrow-left-line text-lg" />
              <span>Nazad na sajt</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <i className="ri-logout-box-line text-lg" />
              <span>Odjavi se</span>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminLayoutWrapper>
      <Outlet />
    </AdminLayoutWrapper>
  );
}