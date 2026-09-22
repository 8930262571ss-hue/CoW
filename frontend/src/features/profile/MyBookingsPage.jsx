import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';

export default function MyBookingsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const data = await api.getBookings();
        setBookings(data);
      } catch (err) {
        console.error('Failed to load journeys:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <span className="material-symbols-outlined text-[#C9A667] text-5xl mb-3">lock</span>
        <h2 className="font-serif text-2xl text-[#F7F3EC] font-bold mb-2">Sign In Required</h2>
        <p className="text-xs text-[#e6e2db]/70 mb-6">Sign in to view your upcoming and completed sanctuary journeys.</p>
        <button
          onClick={() => navigate('/')}
          className="gold-gradient text-[#1B1B1B] text-xs font-bold px-6 py-2.5 rounded-full"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8 pb-28">
      <div className="border-b border-[#C9A667]/20 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A667] font-semibold">
            Travel History & Schedule
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#F7F3EC] font-bold mt-1">
            My Journeys
          </h1>
        </div>

        <button
          onClick={() => navigate('/booking/destination')}
          className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full soft-glow"
        >
          Book New Ride
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-[#1B1B1B] rounded-2xl border border-white/10 p-8 max-w-xl mx-auto">
          <span className="material-symbols-outlined text-[#C9A667] text-5xl mb-3">directions_car</span>
          <h3 className="font-serif text-xl font-bold text-[#F7F3EC] mb-2">No Active Journeys</h3>
          <p className="text-xs text-[#e6e2db]/70 mb-6">
            You do not have any pending or completed rides on Cafe on Wheels yet.
          </p>
          <button
            onClick={() => navigate('/booking/destination')}
            className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase px-8 py-3 rounded-full soft-glow"
          >
            Start Your First Reservation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#C9A667] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] tracking-widest uppercase text-[#C9A667] font-semibold">
                    Booking #{b.id.slice(-6).toUpperCase()}
                  </span>
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
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#F7F3EC] mb-1">
                  {b.theme_name}
                </h3>

                <p className="text-xs text-[#e6e2db]/80">
                  {b.pickup_location?.address} → {b.destination?.address}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-xs text-[#e6e2db]/70">
                  <div>📅 Date: <strong className="text-[#F7F3EC]">{b.scheduled_date}</strong></div>
                  <div>⏰ Slot: <strong className="text-[#C9A667]">{b.scheduled_time_slot}</strong></div>
                  <div>👥 Party: <strong className="text-[#F7F3EC]">{b.guest_count} Guests</strong></div>
                  <div>📍 Distance: <strong className="text-[#F7F3EC]">{b.estimated_distance_km} km</strong></div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#e6e2db]/50 uppercase block">Total Paid</span>
                  <span className="font-sans text-xl font-bold text-[#C9A667]">
                    {formatCurrencyINR(b.pricing?.total_inr)}
                  </span>
                </div>

                {b.status === 'confirmed' || b.status === 'in_progress' ? (
                  <Link
                    to={`/ride/${b.id}/track`}
                    className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-gold-glow flex items-center space-x-1"
                  >
                    <span className="material-symbols-outlined text-sm">my_location</span>
                    <span>Live Tracking</span>
                  </Link>
                ) : (
                  <Link
                    to={`/checkout?bookingId=${b.id}`}
                    className="bg-[#242424] text-[#C9A667] border border-[#C9A667]/40 text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full hover:bg-[#C9A667] hover:text-[#1B1B1B] transition-colors"
                  >
                    Pay Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
