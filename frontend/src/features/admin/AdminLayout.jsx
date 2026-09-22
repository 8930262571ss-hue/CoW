import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard Overview', icon: 'dashboard' },
  { path: '/admin/themes', label: 'Themes & Add-ons', icon: 'palette' },
  { path: '/admin/vehicles', label: 'Fleet Vehicles', icon: 'airport_shuttle' },
  { path: '/admin/menu', label: 'Artisanal Menu', icon: 'restaurant_menu' },
  { path: '/admin/pricing', label: 'Pricing & Offers', icon: 'sell' },
  { path: '/admin/rides', label: 'Rides & Bookings', icon: 'receipt_long' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#141310] text-[#e6e2db] flex flex-col md:flex-row pt-20">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0f0e0b] border-r border-[#C9A667]/20 flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-3 py-2 border-b border-white/5 pb-4">
            <span className="material-symbols-outlined text-[#C9A667] text-2xl">admin_panel_settings</span>
            <div>
              <h2 className="font-serif text-sm font-bold text-[#F7F3EC] uppercase tracking-wider">
                Admin Console
              </h2>
              <span className="text-[10px] text-[#9df1d6] font-mono">Live Operations Hub</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium tracking-wider transition-colors ${
                    active
                      ? 'bg-[#20201c] border border-[#C9A667]/50 text-[#C9A667] shadow-gold-glow font-bold'
                      : 'text-[#e6e2db]/70 hover:bg-white/5 hover:text-[#F7F3EC]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Exit Admin */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <div className="px-3 py-2 bg-[#141310] rounded-xl border border-white/5 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="block font-bold text-[#F7F3EC]">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] text-[#e6e2db]/50">{user?.email}</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#6E1F2B] text-[#ffdadb] font-bold">
              ADMIN
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-xs text-[#C9A667] border border-[#C9A667]/30 hover:bg-[#C9A667]/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Exit to Customer Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <main className="flex-grow p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
