import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';

export default function AdminRidesPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings(statusFilter ? { status_filter: statusFilter } : {});
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.updateBookingStatus(bookingId, { status: newStatus });
      loadBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#C9A667]/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-bold">
            Guest Reservations
          </span>
          <h1 className="font-serif text-3xl text-[#F7F3EC] font-bold">
            Rides & Bookings Management
          </h1>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#141310] border border-white/20 text-xs text-[#F7F3EC] rounded-xl px-4 py-2.5 focus:border-[#C9A667]"
        >
          <option value="">All Statuses</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-[#1B1B1B] rounded-2xl border border-white/10 p-8">
          <p className="text-xs text-[#e6e2db]/60">No bookings matching filter.</p>
        </div>
      ) : (
        <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#e6e2db]/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Booking ID</th>
                <th className="py-3 px-3">Guest & Theme</th>
                <th className="py-3 px-3">Date & Slot</th>
                <th className="py-3 px-3">Departure & Destination</th>
                <th className="py-3 px-3">Total Fare</th>
                <th className="py-3 px-3">Status Action</th>
                <th className="py-3 px-3 text-right">Live View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#C9A667]">
                    #{b.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#F7F3EC] block">{b.theme_name}</span>
                    <span className="text-[11px] text-[#e6e2db]/60">{b.guest_count} Guests</span>
                  </td>
                  <td className="py-3 px-3 text-[#e6e2db]/80 whitespace-nowrap">
                    <div>{b.scheduled_date}</div>
                    <div className="text-[11px] text-[#C9A667]">{b.scheduled_time_slot}</div>
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-[#e6e2db]/70">
                    <div><strong>From:</strong> {b.pickup_location?.address?.split(',')[0]}</div>
                    <div><strong>To:</strong> {b.destination?.address?.split(',')[0]}</div>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#F7F3EC] whitespace-nowrap">
                    {formatCurrencyINR(b.pricing?.total_inr)}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className={`text-[10px] uppercase font-bold rounded-lg px-2.5 py-1.5 border bg-[#141310] cursor-pointer ${
                        b.status === 'confirmed'
                          ? 'text-[#9df1d6] border-[#0E3B2E]'
                          : b.status === 'in_progress'
                          ? 'text-amber-300 border-amber-500/50'
                          : b.status === 'completed'
                          ? 'text-blue-300 border-blue-500/50'
                          : 'text-[#e6e2db]/60 border-white/20'
                      }`}
                    >
                      <option value="pending_payment">Pending Payment</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <Link
                      to={`/ride/${b.id}/track`}
                      className="text-xs text-[#C9A667] hover:underline whitespace-nowrap"
                    >
                      Customer View
                    </Link>
                    <Link
                      to={`/driver/ride/${b.id}`}
                      target="_blank"
                      className="text-xs text-[#ffdadb] hover:underline whitespace-nowrap"
                    >
                      Driver GPS ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
