import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';
import BookingStepBar from './BookingStepBar';
import AuthModal from '../../components/common/AuthModal';

export default function Step5Review() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    pickup,
    destination,
    optionalStop,
    themeId,
    selectedAddOns,
    selectedMenuItems,
    selectedVehicleId,
    scheduledDate,
    scheduledTimeSlot,
    guestCount,
    specialRequests,
    promoCode, setPromoCode,
    pricingBreakdown,
    refreshPricing,
  } = useBooking();

  const [couponInput, setCouponInput] = useState(promoCode || '');
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponInput.trim()) return;

    try {
      const currentSubtotal = pricingBreakdown?.subtotal_inr || 3499;
      const res = await api.validateOffer(couponInput.trim(), currentSubtotal);
      setPromoCode(couponInput.trim().toUpperCase());
      setCouponSuccess(`Coupon applied! You saved ${formatCurrencyINR(res.discount_inr)}.`);
      refreshPricing();
    } catch (err) {
      setCouponError(err.message || 'Invalid promotional code.');
    }
  };

  const handleConfirmAndProceed = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        theme_id: themeId || 'romantic-date',
        selected_add_ons: selectedAddOns.map((a) => ({
          name: a.name,
          price_inr: a.price_inr,
          config: a.config || {},
        })),
        menu_items: selectedMenuItems.map((m) => ({
          item_id: m.item_id || m.id || m._id,
          name: m.name,
          quantity: m.quantity || 1,
          price_inr: m.price_inr,
        })),
        pickup_location: pickup,
        destination: destination,
        optional_stop: optionalStop,
        guest_count: guestCount,
        scheduled_date: scheduledDate,
        scheduled_time_slot: scheduledTimeSlot,
        vehicle_id: selectedVehicleId || null,
        special_requests: specialRequests,
        promo_code: promoCode ? promoCode.trim() : null,
      };

      const booking = await api.createBooking(payload);
      navigate(`/checkout?bookingId=${booking.id}`);
    } catch (err) {
      alert(`Booking creation note: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10 pb-28">
        <BookingStepBar currentStep={5} />

        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A667] font-semibold">
            Final Step 5 of 5
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F7F3EC] font-bold mt-1">
            Review Your Sanctuary Journey
          </h1>
          <p className="text-xs sm:text-sm text-[#e6e2db]/70 mt-1">
            Review your itinerary, atmosphere config, and transparent fare breakdown before checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Review Summary Panels (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Route & Schedule */}
            <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif text-lg font-semibold text-[#F7F3EC] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#C9A667]">route</span>
                  <span>Itinerary & Timing</span>
                </h3>
                <button
                  onClick={() => navigate('/booking/destination')}
                  className="text-xs text-[#C9A667] hover:underline"
                >
                  Edit Route
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-3">
                  <span className="material-symbols-outlined text-[#C9A667] text-base mt-0.5">trip_origin</span>
                  <div>
                    <span className="text-[10px] uppercase text-[#e6e2db]/50 tracking-wider block">Pickup Sanctuary</span>
                    <span className="font-medium text-[#F7F3EC]">{pickup.address}</span>
                  </div>
                </div>

                {optionalStop && (
                  <div className="flex items-start space-x-3 pl-0.5">
                    <span className="material-symbols-outlined text-amber-400 text-base mt-0.5">pause_circle</span>
                    <div>
                      <span className="text-[10px] uppercase text-[#e6e2db]/50 tracking-wider block">Scenic Vantage Stop</span>
                      <span className="font-medium text-[#F7F3EC]">{optionalStop.address}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <span className="material-symbols-outlined text-[#9df1d6] text-base mt-0.5">flag</span>
                  <div>
                    <span className="text-[10px] uppercase text-[#e6e2db]/50 tracking-wider block">Arrival Destination</span>
                    <span className="font-medium text-[#F7F3EC]">{destination.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex flex-wrap gap-4 text-xs text-[#e6e2db]/80">
                <div className="bg-[#141310] px-3 py-1.5 rounded-lg border border-white/5">
                  📅 Date: <strong className="text-[#F7F3EC]">{scheduledDate}</strong>
                </div>
                <div className="bg-[#141310] px-3 py-1.5 rounded-lg border border-white/5">
                  ⏰ Slot: <strong className="text-[#C9A667]">{scheduledTimeSlot}</strong>
                </div>
                <div className="bg-[#141310] px-3 py-1.5 rounded-lg border border-white/5">
                  👥 Guests: <strong className="text-[#F7F3EC]">{guestCount}</strong>
                </div>
                <div className="bg-[#141310] px-3 py-1.5 rounded-lg border border-white/5">
                  📍 Total: <strong className="text-[#F7F3EC]">{pricingBreakdown?.distance_km || 12} km</strong>
                </div>
              </div>
            </div>

            {/* Selected Add-ons and Menu */}
            <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-serif text-lg font-semibold text-[#F7F3EC] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#C9A667]">room_service</span>
                  <span>Atmosphere & Culinary Inclusions</span>
                </h3>
                <button
                  onClick={() => navigate('/booking/customize')}
                  className="text-xs text-[#C9A667] hover:underline"
                >
                  Edit Add-ons
                </button>
              </div>

              {/* Add-ons List */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-[#C9A667] font-semibold block">
                  Add-Ons:
                </span>
                {selectedAddOns.length === 0 ? (
                  <p className="text-xs text-[#e6e2db]/50 italic">Standard curated atmosphere included</p>
                ) : (
                  selectedAddOns.map((a) => (
                    <div key={a.name} className="flex justify-between text-xs text-[#e6e2db]/90 py-1 border-b border-white/5">
                      <span>✓ {a.name}</span>
                      <span className="font-bold text-[#C9A667]">+{formatCurrencyINR(a.price_inr)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Menu List */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] uppercase tracking-wider text-[#C9A667] font-semibold block">
                  Artisanal Refreshments:
                </span>
                {selectedMenuItems.length === 0 ? (
                  <p className="text-xs text-[#e6e2db]/50 italic">Complimentary espresso bar & mineral water included</p>
                ) : (
                  selectedMenuItems.map((m) => (
                    <div key={m.id || m._id || m.item_id} className="flex justify-between text-xs text-[#e6e2db]/90 py-1 border-b border-white/5">
                      <span>{m.quantity}x {m.name}</span>
                      <span className="font-bold text-[#C9A667]">+{formatCurrencyINR(m.price_inr * m.quantity)}</span>
                    </div>
                  ))
                )}
              </div>

              {specialRequests && (
                <div className="pt-2 text-xs text-[#e6e2db]/70">
                  <span className="text-[#C9A667] font-semibold">Special Instructions: </span>
                  {specialRequests}
                </div>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="bg-[#1B1B1B] rounded-2xl border border-white/10 p-5">
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#C9A667] font-semibold">
                  Promotional or Loyalty Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Try VELVET10 or WELCOME500"
                    className="flex-grow bg-[#141310] border border-white/20 rounded-xl px-4 py-2.5 text-xs text-[#F7F3EC] uppercase tracking-widest focus:outline-none focus:border-[#C9A667]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#C9A667] text-[#1B1B1B] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#E6D2AA] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponSuccess && <p className="text-xs text-emerald-400 mt-1">{couponSuccess}</p>}
                {couponError && <p className="text-xs text-red-400 mt-1">{couponError}</p>}
              </form>
            </div>
          </div>

          {/* Right Fare Breakdown (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/40 p-6 shadow-2xl space-y-6">
              <h3 className="font-serif text-xl text-[#F7F3EC] font-bold border-b border-[#C9A667]/20 pb-3">
                Fare Breakdown
              </h3>

              <div className="space-y-2.5 text-xs text-[#e6e2db]/80">
                <div className="flex justify-between">
                  <span>Theme Base Price:</span>
                  <span>{formatCurrencyINR(pricingBreakdown?.base_price_inr || 3499)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Included Complimentary:</span>
                  <span className="text-[#0E3B2E] text-[#9df1d6] font-semibold">10.0 km</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Extra Mileage ({pricingBreakdown?.extra_km || 0} km @ ₹8):
                  </span>
                  <span>{formatCurrencyINR(pricingBreakdown?.extra_km_charge_inr || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Atmosphere Add-Ons:</span>
                  <span>{formatCurrencyINR(pricingBreakdown?.add_ons_total_inr || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Artisanal Refreshments:</span>
                  <span>{formatCurrencyINR(pricingBreakdown?.menu_total_inr || 0)}</span>
                </div>

                {pricingBreakdown?.discount_inr > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-white/5">
                    <span>Discount ({pricingBreakdown.applied_offer_code}):</span>
                    <span>-{formatCurrencyINR(pricingBreakdown.discount_inr)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span>GST (5% Hospitality):</span>
                  <span>{formatCurrencyINR(pricingBreakdown?.tax_inr || 0)}</span>
                </div>
              </div>

              {/* Total Card */}
              <div className="pt-4 border-t border-[#C9A667]/30">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs uppercase tracking-wider text-[#e6e2db]/70">
                    Grand Total
                  </span>
                  <span className="font-sans text-3xl font-bold text-[#C9A667]">
                    {formatCurrencyINR(pricingBreakdown?.total_inr || 3499)}
                  </span>
                </div>

                <button
                  onClick={handleConfirmAndProceed}
                  disabled={isSubmitting}
                  className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase py-4 rounded-full soft-glow hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-2xl"
                >
                  <span>{isSubmitting ? 'Securing Booking...' : 'Proceed to PayU Checkout'}</span>
                  <span className="material-symbols-outlined text-sm">lock</span>
                </button>

                <p className="text-[10px] text-center text-[#e6e2db]/50 mt-3 font-sans">
                  Protected by 256-bit bank-grade encryption. Free cancellation up to 6 hours before departure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          mode="login"
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => {}}
        />
      )}
    </>
  );
}
