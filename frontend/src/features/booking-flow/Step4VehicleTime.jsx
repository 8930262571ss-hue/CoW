import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../api/client';
import BookingStepBar from './BookingStepBar';

const TIME_SLOTS = [
  { slot: '15:00 - 17:00', label: 'Afternoon Tea & Coastal Breeze' },
  { slot: '17:30 - 19:30', label: 'Golden Hour Sunset Drive' },
  { slot: '20:00 - 22:00', label: 'Twilight & Candlelight Dinner' },
  { slot: '22:30 - 00:30', label: 'Midnight Starlight Reverie' },
];

export default function Step4VehicleTime() {
  const navigate = useNavigate();
  const {
    selectedVehicleId, setSelectedVehicleId,
    scheduledDate, setScheduledDate,
    scheduledTimeSlot, setScheduledTimeSlot,
    guestCount, setGuestCount,
    specialRequests, setSpecialRequests,
  } = useBooking();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        setLoading(true);
        const data = await api.getVehicles();
        setVehicles(data);
        if (data.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(data[0].id || data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, [selectedVehicleId, setSelectedVehicleId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10 pb-28">
      <BookingStepBar currentStep={4} />

      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#C9A667] font-semibold">
          Step 4 of 5
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#F7F3EC] font-bold mt-1">
          Vehicle, Date & Time Slot
        </h1>
        <p className="text-xs sm:text-sm text-[#e6e2db]/70 mt-1">
          Select your dedicated luxury Mercedes Sprinter, private departure slot, and guest party size.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vehicle Fleet Picker (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-serif text-2xl text-[#F7F3EC] font-semibold border-b border-[#C9A667]/20 pb-3">
            Select Your Chauffeur Van
          </h2>

          <div className="space-y-4">
            {vehicles.map((v) => {
              const vId = v.id || v._id;
              const isSelected = selectedVehicleId === vId;
              const renderImg =
                v.render_image_url ||
                '/assets/renders/a_cinematic_realistic_3d_render_of_a_luxury_panel_van_mercedes_sprinter.png';

              return (
                <div
                  key={vId}
                  onClick={() => setSelectedVehicleId(vId)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-center ${
                    isSelected
                      ? 'bg-[#20201c] border-[#C9A667] shadow-gold-glow'
                      : 'bg-[#1B1B1B] border-white/10 hover:border-[#C9A667]/40'
                  }`}
                >
                  <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-[#141310] flex-shrink-0">
                    <img
                      src={renderImg}
                      alt={v.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#0E3B2E] text-[#9df1d6] text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-bold">
                      {v.status === 'available' ? 'Ready' : v.status}
                    </div>
                  </div>

                  <div className="flex-grow space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-lg font-bold text-[#F7F3EC]">
                        {v.name}
                      </h4>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#C9A667] border-[#C9A667] text-[#1B1B1B]'
                            : 'border-white/30 text-transparent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">check</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#C9A667] font-medium">{v.model}</p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-[#e6e2db]/70">
                      <span className="bg-[#141310] px-2.5 py-0.5 rounded-full border border-white/5">
                        Capacity: {v.seating_capacity} Guests
                      </span>
                      <span className="bg-[#141310] px-2.5 py-0.5 rounded-full border border-white/5">
                        Base: {v.current_location?.address?.split(',')[0] || 'Bandra West'}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#e6e2db]/50 pt-1">
                      Features: {v.features?.slice(0, 3).join(' • ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Date, Slot & Guest Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/40 p-6 shadow-2xl space-y-6">
            <h3 className="font-serif text-xl text-[#F7F3EC] font-bold border-b border-[#C9A667]/20 pb-3">
              Schedule & Guest Count
            </h3>

            {/* Date Input */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#C9A667] font-semibold mb-1.5">
                Journey Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#141310] border border-[#C9A667]/30 rounded-xl px-4 py-3 text-sm text-[#F7F3EC] focus:outline-none focus:border-[#C9A667]"
              />
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#C9A667] font-semibold mb-2">
                Curated Time Slot
              </label>
              <div className="space-y-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t.slot}
                    type="button"
                    onClick={() => setScheduledTimeSlot(t.slot)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      scheduledTimeSlot === t.slot
                        ? 'bg-[#20201c] border-[#C9A667] text-[#C9A667] font-semibold'
                        : 'bg-[#141310] border-white/10 text-[#e6e2db]/70 hover:border-[#C9A667]/30'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#F7F3EC]">{t.slot}</div>
                      <div className="text-[10px] text-[#e6e2db]/60">{t.label}</div>
                    </div>
                    {scheduledTimeSlot === t.slot && (
                      <span className="material-symbols-outlined text-sm text-[#C9A667]">
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Count Counter */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#C9A667] font-semibold mb-2">
                Number of Guests
              </label>
              <div className="flex items-center justify-between bg-[#141310] border border-[#C9A667]/30 rounded-xl px-4 py-3">
                <span className="text-sm text-[#e6e2db]/80 font-sans">
                  {guestCount} Guest{guestCount > 1 ? 's' : ''} (Max 7)
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-8 h-8 rounded-full border border-white/20 text-[#e6e2db] flex items-center justify-center hover:border-[#C9A667]"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-[#C9A667] w-4 text-center">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.min(7, guestCount + 1))}
                    className="w-8 h-8 rounded-full border border-white/20 text-[#e6e2db] flex items-center justify-center hover:border-[#C9A667]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Special Hospitality Requests */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#C9A667] font-semibold mb-1.5">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Chilled San Pellegrino on arrival, preferred cabin temperature 22°C..."
                rows={3}
                className="w-full bg-[#141310] border border-white/10 rounded-xl p-3 text-xs text-[#F7F3EC] placeholder-[#e6e2db]/30 focus:outline-none focus:border-[#C9A667]"
              />
            </div>

            {/* Next Step Action */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/booking/review')}
                className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase py-3.5 rounded-full soft-glow hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
              >
                <span>Step 5: Review Booking</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
