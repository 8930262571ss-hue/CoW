import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rides'); // 'rides' | 'info' | 'preferences' | 'saved'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
    notify_weather: true,
    notify_events: true,
    notify_day: true,
    favorite_cuisines: ['Coffee & Beverages', 'Bakery & Desserts'],
    favorite_moods: ['romantic', 'comfort']
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const [bookingsData, meData] = await Promise.all([
          api.getBookings(),
          api.getMe(),
        ]);
        setBookings(bookingsData);
        if (meData.preferences) {
          setPrefs(meData.preferences);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  const handleSavePreferences = async () => {
    try {
      await api.updatePreferences(prefs);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Could not save preferences: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <span className="material-symbols-outlined text-[#C9A667] text-5xl mb-3">lock</span>
        <h2 className="font-serif text-2xl text-[#F7F3EC] font-bold mb-2">Sign In Required</h2>
        <p className="text-xs text-[#e6e2db]/70 mb-6">Please authenticate to manage your private sanctuary journeys and preferences.</p>
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
      {/* Profile Header */}
      <div className="border-b border-[#C9A667]/20 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-[#1B1B1B] border-2 border-[#C9A667] flex items-center justify-center text-[#C9A667] shadow-gold-glow">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
          <div>
            <h1 className="font-serif text-3xl text-[#F7F3EC] font-bold">{user?.name}</h1>
            <p className="text-xs text-[#e6e2db]/60 font-sans">{user?.email} • Role: {user?.role}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/booking/destination')}
          className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full soft-glow self-start sm:self-auto"
        >
          Book New Journey
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav (4 cols) */}
        <aside className="md:col-span-4 velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('rides')}
            className={`w-full text-left p-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 transition-colors ${
              activeTab === 'rides'
                ? 'bg-[#20201c] border border-[#C9A667] text-[#C9A667] shadow-gold-glow'
                : 'text-[#e6e2db]/70 hover:bg-white/5 hover:text-[#F7F3EC]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">directions_car</span>
            <span>My Journeys ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full text-left p-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 transition-colors ${
              activeTab === 'preferences'
                ? 'bg-[#20201c] border border-[#C9A667] text-[#C9A667] shadow-gold-glow'
                : 'text-[#e6e2db]/70 hover:bg-white/5 hover:text-[#F7F3EC]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">tune</span>
            <span>AI & Hospitality Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`w-full text-left p-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 transition-colors ${
              activeTab === 'info'
                ? 'bg-[#20201c] border border-[#C9A667] text-[#C9A667] shadow-gold-glow'
                : 'text-[#e6e2db]/70 hover:bg-white/5 hover:text-[#F7F3EC]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">person</span>
            <span>Personal Profile Info</span>
          </button>

          <button
            onClick={logout}
            className="w-full text-left p-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center space-x-3 text-red-400 hover:bg-red-500/10 transition-colors pt-4 border-t border-white/5 mt-4"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Content Area (8 cols) */}
        <main className="md:col-span-8 space-y-6">
          {/* Tab 1: My Rides */}
          {activeTab === 'rides' && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-[#F7F3EC] font-semibold border-b border-white/10 pb-3">
                Your Sanctuary Bookings
              </h2>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16 bg-[#1B1B1B] rounded-2xl border border-white/10 p-8">
                  <span className="material-symbols-outlined text-[#C9A667] text-4xl mb-2">directions_bus</span>
                  <p className="text-sm text-[#e6e2db]/70">No ride bookings recorded yet.</p>
                  <button
                    onClick={() => navigate('/booking/destination')}
                    className="mt-4 gold-gradient text-[#1B1B1B] text-xs font-bold px-6 py-2.5 rounded-full"
                  >
                    Reserve Your First Ride
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#C9A667] transition-all"
                    >
                      <div className="space-y-1 flex-grow">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-lg font-bold text-[#F7F3EC]">
                            {b.theme_name}
                          </span>
                          <span
                            className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
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

                        <p className="text-xs text-[#e6e2db]/80">
                          {b.pickup_location?.address?.split(',')[0]} → {b.destination?.address?.split(',')[0]}
                        </p>

                        <div className="text-[11px] text-[#e6e2db]/60 flex items-center space-x-4 pt-1">
                          <span>📅 {b.scheduled_date}</span>
                          <span>⏰ {b.scheduled_time_slot}</span>
                          <span className="text-[#C9A667] font-semibold">
                            {formatCurrencyINR(b.pricing?.total_inr)}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between">
                        {b.status === 'confirmed' || b.status === 'in_progress' ? (
                          <Link
                            to={`/ride/${b.id}/track`}
                            className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-gold-glow flex items-center space-x-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">my_location</span>
                            <span>Live Track</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/checkout?bookingId=${b.id}`}
                            className="bg-[#242424] text-[#C9A667] border border-[#C9A667]/40 text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full hover:bg-[#C9A667] hover:text-[#1B1B1B] transition-colors"
                          >
                            Complete Pay
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Preferences */}
          {activeTab === 'preferences' && (
            <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 sm:p-8 shadow-xl space-y-6">
              <h2 className="font-serif text-2xl text-[#F7F3EC] font-semibold border-b border-white/10 pb-3">
                AI & Experience Preferences
              </h2>
              <p className="text-xs text-[#e6e2db]/70">
                Our rule-based intelligence uses these settings to dynamically tailor recommendation banners and cabin aromas to your tastes.
              </p>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-[#141310] rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-[#F7F3EC]">Weather-Sensitive Suggestions</h4>
                    <p className="text-[11px] text-[#e6e2db]/60">Suggest Comfort Drive with warm roasts when it rains in Mumbai.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.notify_weather}
                    onChange={(e) => setPrefs({ ...prefs, notify_weather: e.target.checked })}
                    className="w-5 h-5 accent-[#C9A667] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#141310] rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-[#F7F3EC]">Anniversary & Event Alerts</h4>
                    <p className="text-[11px] text-[#e6e2db]/60">Receive proactive reminders for candlelit romantic bookings.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.notify_events}
                    onChange={(e) => setPrefs({ ...prefs, notify_events: e.target.checked })}
                    className="w-5 h-5 accent-[#C9A667] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#141310] rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-[#F7F3EC]">Weekend Midnight Drive Nudges</h4>
                    <p className="text-[11px] text-[#e6e2db]/60">Notify when starlight sky conditions are optimal along coastal routes.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.notify_day}
                    onChange={(e) => setPrefs({ ...prefs, notify_day: e.target.checked })}
                    className="w-5 h-5 accent-[#C9A667] cursor-pointer"
                  />
                </div>
              </div>

              {saveSuccess && (
                <p className="text-xs text-emerald-400 font-semibold">Preferences saved successfully!</p>
              )}

              <button
                onClick={handleSavePreferences}
                className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-8 py-3 rounded-full soft-glow"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* Tab 3: Profile Info */}
          {activeTab === 'info' && (
            <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 sm:p-8 shadow-xl space-y-6">
              <h2 className="font-serif text-2xl text-[#F7F3EC] font-semibold border-b border-white/10 pb-3">
                Account Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#141310] rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#e6e2db]/50 uppercase block">Name</span>
                  <span className="font-bold text-[#F7F3EC] text-sm">{user?.name}</span>
                </div>
                <div className="p-3 bg-[#141310] rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#e6e2db]/50 uppercase block">Email</span>
                  <span className="font-bold text-[#F7F3EC] text-sm">{user?.email}</span>
                </div>
                <div className="p-3 bg-[#141310] rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#e6e2db]/50 uppercase block">Phone</span>
                  <span className="font-bold text-[#F7F3EC] text-sm">{user?.phone || 'Not configured'}</span>
                </div>
                <div className="p-3 bg-[#141310] rounded-xl border border-white/5">
                  <span className="text-[10px] text-[#e6e2db]/50 uppercase block">Tier</span>
                  <span className="font-bold text-[#C9A667] text-sm uppercase">Velvet Sovereign Guest</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
