import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import BookingStepBar from './BookingStepBar';
import LiveMap from '../../components/tracking/LiveMap';

const POPULAR_PICKUPS = [
  { address: 'Bandra Bandstand Promenade, Mumbai', lat: 19.0596, lng: 72.8295 },
  { address: 'Juhu Beach Hotel Enclave, Mumbai', lat: 19.1075, lng: 72.8263 },
  { address: 'BKC Financial Center Luxury Hub, Mumbai', lat: 19.0664, lng: 72.8687 },
  { address: 'Chhatrapati Shivaji Terminal 2 (VIP Lane)', lat: 19.0902, lng: 72.8628 }
];

const POPULAR_DESTINATIONS = [
  { address: 'Marine Drive Promenade, South Mumbai', lat: 18.9438, lng: 72.8232 },
  { address: 'Worli Sea Face Coastal Overlook, Mumbai', lat: 19.0118, lng: 72.8155 },
  { address: 'Gateway of India Heritage Pier, Colaba', lat: 18.9220, lng: 72.8347 },
  { address: 'Carter Road Sunset Amphitheater, Bandra', lat: 19.0652, lng: 72.8267 }
];

export default function Step1Destination() {
  const navigate = useNavigate();
  const {
    pickup, setPickup,
    destination, setDestination,
    optionalStop, setOptionalStop,
    pricingBreakdown,
    isPricingLoading
  } = useBooking();

  const [hasStop, setHasStop] = useState(!!optionalStop);

  const handleToggleStop = () => {
    if (hasStop) {
      setHasStop(false);
      setOptionalStop(null);
    } else {
      setHasStop(true);
      setOptionalStop({
        lat: 19.0222,
        lng: 72.8180,
        address: 'Bandra-Worli Sea Link Vantage Stop'
      });
    }
  };

  const handleNext = () => {
    navigate('/booking/theme');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 pb-28">
      <BookingStepBar currentStep={1} />

      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-[#C9A667] font-semibold">
          Step 1 of 5
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#F7F3EC] font-bold mt-1">
          Where Shall We Escort You?
        </h1>
        <p className="text-xs sm:text-sm text-[#e6e2db]/70 mt-1">
          Select your departure sanctuary and scenic arrival destination across Mumbai.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Pickup Card */}
          <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-[#C9A667]">
              <span className="material-symbols-outlined">trip_origin</span>
              <h3 className="font-serif text-lg font-semibold text-[#F7F3EC]">Departure Point</h3>
            </div>

            <input
              type="text"
              value={pickup.address}
              onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
              placeholder="Enter pickup address, hotel or residence..."
              className="w-full bg-[#141310] border border-[#C9A667]/30 rounded-xl px-4 py-3 text-sm text-[#F7F3EC] placeholder-[#e6e2db]/30 focus:outline-none focus:border-[#C9A667]"
            />

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#e6e2db]/50 block mb-2">
                Popular Pickup Points:
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_PICKUPS.map((p) => (
                  <button
                    key={p.address}
                    type="button"
                    onClick={() => setPickup(p)}
                    className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                      pickup.address === p.address
                        ? 'bg-[#C9A667] text-[#1B1B1B] border-[#C9A667] font-semibold'
                        : 'bg-[#141310] text-[#e6e2db]/70 border-white/10 hover:border-[#C9A667]/40'
                    }`}
                  >
                    {p.address.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Scenic Stop Toggle */}
          <div className="bg-[#1B1B1B] rounded-2xl border border-white/10 p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[#C9A667]">route</span>
              <div>
                <h4 className="text-sm font-serif text-[#F7F3EC] font-semibold">Scenic Intermediate Stop</h4>
                <p className="text-xs text-[#e6e2db]/60">Pause for a 15-minute coastal photoshoot or coffee stop.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleStop}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                hasStop ? 'bg-[#C9A667]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#1B1B1B] transition-transform ${
                  hasStop ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {hasStop && (
            <div className="p-4 bg-[#141310] rounded-xl border border-[#C9A667]/30 space-y-2 animate-fade-in">
              <label className="text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold">
                Stop Location & Notes
              </label>
              <input
                type="text"
                value={optionalStop?.address || ''}
                onChange={(e) =>
                  setOptionalStop({
                    lat: optionalStop?.lat || 19.0222,
                    lng: optionalStop?.lng || 72.8180,
                    address: e.target.value
                  })
                }
                placeholder="e.g. Bandra-Worli Sea Link scenic overlook"
                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F7F3EC]"
              />
            </div>
          )}

          {/* Destination Card */}
          <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-[#0E3B2E]">
              <span className="material-symbols-outlined text-[#9df1d6]">flag</span>
              <h3 className="font-serif text-lg font-semibold text-[#F7F3EC]">Chosen Destination</h3>
            </div>

            <input
              type="text"
              value={destination.address}
              onChange={(e) => setDestination({ ...destination, address: e.target.value })}
              placeholder="Enter drop-off destination..."
              className="w-full bg-[#141310] border border-[#C9A667]/30 rounded-xl px-4 py-3 text-sm text-[#F7F3EC] placeholder-[#e6e2db]/30 focus:outline-none focus:border-[#C9A667]"
            />

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#e6e2db]/50 block mb-2">
                Scenic Destination Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_DESTINATIONS.map((d) => (
                  <button
                    key={d.address}
                    type="button"
                    onClick={() => setDestination(d)}
                    className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                      destination.address === d.address
                        ? 'bg-[#C9A667] text-[#1B1B1B] border-[#C9A667] font-semibold'
                        : 'bg-[#141310] text-[#e6e2db]/70 border-white/10 hover:border-[#C9A667]/40'
                    }`}
                  >
                    {d.address.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Map & Calculated Route Stats (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <LiveMap
            pickupLocation={pickup}
            destinationLocation={destination}
            optionalStop={optionalStop}
            vanLocation={{ lat: pickup.lat, lng: pickup.lng, heading: 45 }}
            vanName="Your Van Awaits Departure"
          />

          {/* Route Metrics Pill */}
          <div className="velvet-texture bg-[#1c1c18] rounded-2xl border border-[#C9A667]/30 p-5 shadow-xl">
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#e6e2db]/50 block">Distance</span>
                <span className="font-sans text-xl font-bold text-[#F7F3EC]">
                  {pricingBreakdown?.distance_km ?? '12.4'} km
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#e6e2db]/50 block">Est. Duration</span>
                <span className="font-sans text-xl font-bold text-[#C9A667]">
                  ~{pricingBreakdown?.estimated_duration_min ?? '45'} min
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#e6e2db]/50 block">Excess Mileage</span>
                <span className="font-sans text-xl font-bold text-[#9df1d6]">
                  {pricingBreakdown?.extra_km ? `+${pricingBreakdown.extra_km} km` : '0.0 km'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-[#e6e2db]/70 flex items-center justify-between">
              <span>First 10.0 km included complimentary</span>
              <span className="text-[#C9A667] font-medium">Extra: ₹8.00 / km</span>
            </div>
          </div>

          {/* Next Step CTA */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase px-10 py-4 rounded-full soft-glow hover:opacity-90 transition-all flex items-center space-x-2 active:scale-95 shadow-xl"
            >
              <span>Continue to Step 2: Select Theme</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
