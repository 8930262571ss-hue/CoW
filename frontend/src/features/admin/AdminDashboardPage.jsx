import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#C9A667]/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-bold">
            Executive Metrics
          </span>
          <h1 className="font-serif text-3xl text-[#F7F3EC] font-bold">
            Operations Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/rides"
            className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full"
          >
            Manage Rides
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="velvet-texture bg-[#1B1B1B] p-5 rounded-2xl border border-[#C9A667]/30 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-[#e6e2db]/60 text-xs">
            <span className="uppercase tracking-wider font-semibold">Total Revenue</span>
            <span className="material-symbols-outlined text-[#C9A667]">payments</span>
          </div>
          <div className="font-sans text-2xl font-bold text-[#C9A667]">
            {formatCurrencyINR(stats?.total_revenue_inr || 0)}
          </div>
          <div className="text-[11px] text-[#9df1d6]">Gross confirmed booking volume</div>
        </div>

        <div className="velvet-texture bg-[#1B1B1B] p-5 rounded-2xl border border-[#C9A667]/30 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-[#e6e2db]/60 text-xs">
            <span className="uppercase tracking-wider font-semibold">Total Bookings</span>
            <span className="material-symbols-outlined text-[#C9A667]">book_online</span>
          </div>
          <div className="font-sans text-2xl font-bold text-[#F7F3EC]">
            {stats?.total_bookings || 0}
          </div>
          <div className="text-[11px] text-[#e6e2db]/60">
            {stats?.confirmed_rides || 0} Confirmed • {stats?.in_progress_rides || 0} On Ride
          </div>
        </div>

        <div className="velvet-texture bg-[#1B1B1B] p-5 rounded-2xl border border-[#C9A667]/30 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-[#e6e2db]/60 text-xs">
            <span className="uppercase tracking-wider font-semibold">Sprinter Fleet</span>
            <span className="material-symbols-outlined text-[#C9A667]">airport_shuttle</span>
          </div>
          <div className="font-sans text-2xl font-bold text-[#9df1d6]">
            {stats?.fleet?.available_vans || 0} / {stats?.fleet?.total_vans || 0}
          </div>
          <div className="text-[11px] text-[#e6e2db]/60">Active Luxury Lounges</div>
        </div>

        <div className="velvet-texture bg-[#1B1B1B] p-5 rounded-2xl border border-[#C9A667]/30 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-[#e6e2db]/60 text-xs">
            <span className="uppercase tracking-wider font-semibold">Catalog Items</span>
            <span className="material-symbols-outlined text-[#C9A667]">inventory_2</span>
          </div>
          <div className="font-sans text-2xl font-bold text-[#F7F3EC]">
            {stats?.themes_count || 3} Themes • {stats?.menu_items_count || 10} Dishes
          </div>
          <div className="text-[11px] text-[#C9A667]">All active on customer app</div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-[#F7F3EC]">
            Recent Customer Bookings
          </h3>
          <Link to="/admin/rides" className="text-xs text-[#C9A667] hover:underline">
            View All Bookings →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#e6e2db]/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Booking ID</th>
                <th className="py-3 px-3">Theme</th>
                <th className="py-3 px-3">Date & Slot</th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Fare</th>
                <th className="py-3 px-3 text-center">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.recent_bookings?.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#C9A667]">
                    #{b.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3 px-3 font-medium text-[#F7F3EC]">{b.theme_name}</td>
                  <td className="py-3 px-3 text-[#e6e2db]/70">
                    {b.date} • {b.time_slot}
                  </td>
                  <td className="py-3 px-3 text-[#e6e2db]/80 max-w-[200px] truncate">
                    {b.pickup?.split(',')[0]} → {b.destination?.split(',')[0]}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${
                        b.status === 'confirmed'
                          ? 'bg-[#0E3B2E] text-[#9df1d6]'
                          : b.status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300'
                          : b.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-white/10 text-[#e6e2db]/70'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[#C9A667]">
                    {formatCurrencyINR(b.total_inr)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Link
                      to={`/ride/${b.id}/track`}
                      className="text-xs text-[#C9A667] hover:underline"
                    >
                      Open Live
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
