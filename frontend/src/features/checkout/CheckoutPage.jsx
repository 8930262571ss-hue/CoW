import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const paymentStatus = searchParams.get('status');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) {
        setError('No active booking specified.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.getBooking(bookingId);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  const handlePayUHostedCheckout = async () => {
    setIsProcessing(true);
    try {
      const initData = await api.initiatePayment(bookingId);
      
      // If live hosted PayU, create and submit form dynamically
      if (!initData.is_simulated) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = initData.action_url;

        Object.entries(initData.params).forEach(([key, val]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = val;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        // Simulated sandbox mode
        await api.simulatePaymentSuccess(bookingId);
        navigate(`/ride/${bookingId}/track?payment=success`);
      }
    } catch (err) {
      alert(`Payment initiation note: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleInstantSandboxPayment = async () => {
    setIsProcessing(true);
    try {
      await api.simulatePaymentSuccess(bookingId);
      navigate(`/ride/${bookingId}/track?payment=success`);
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <span className="material-symbols-outlined text-[#ffb4ab] text-5xl mb-3">error</span>
        <h2 className="font-serif text-2xl text-[#F7F3EC] font-bold mb-2">Checkout Error</h2>
        <p className="text-xs text-[#e6e2db]/70 mb-6">{error || 'Booking could not be found.'}</p>
        <button
          onClick={() => navigate('/booking/destination')}
          className="gold-gradient text-[#1B1B1B] text-xs font-bold px-6 py-2.5 rounded-full"
        >
          Start New Booking
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10 pb-28">
      {/* Top Banner */}
      <div className="border-b border-[#C9A667]/20 pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A667] font-semibold">
            Secure Payment Gateway
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#F7F3EC] font-bold mt-1">
            Confirm & Pay
          </h1>
        </div>
        <div className="flex items-center space-x-2 text-xs text-[#0E3B2E] bg-[#0E3B2E]/20 border border-[#9df1d6]/30 px-3.5 py-1.5 rounded-full text-[#9df1d6]">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>PayU India Verified</span>
        </div>
      </div>

      {paymentStatus === 'failed' && (
        <div className="p-4 bg-[#6E1F2B]/30 border border-[#ffb2b7]/40 rounded-xl text-xs text-[#ffdadb] flex items-center space-x-3">
          <span className="material-symbols-outlined text-lg">warning</span>
          <span>Previous transaction was cancelled or declined. You may reattempt below.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Order Review (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-serif text-2xl text-[#F7F3EC] font-semibold">
            Order Review
          </h2>

          {/* Theme & Add-on Card */}
          <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 flex items-start space-x-4">
            <span className="material-symbols-outlined text-[#C9A667] text-3xl mt-1">celebration</span>
            <div className="flex-grow">
              <span className="text-[10px] uppercase tracking-widest text-[#e6e2db]/50 block">Theme Atmosphere</span>
              <h3 className="font-serif text-xl text-[#F7F3EC] font-bold mt-0.5">{booking.theme_name}</h3>
              {booking.selected_add_ons?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {booking.selected_add_ons.map((a) => (
                    <span key={a.name} className="inline-block text-xs text-[#C9A667] mr-3">
                      • {a.name} (+{formatCurrencyINR(a.price_inr)})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Destination Card */}
          <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 flex items-start space-x-4">
            <span className="material-symbols-outlined text-[#C9A667] text-3xl mt-1">location_on</span>
            <div className="flex-grow">
              <span className="text-[10px] uppercase tracking-widest text-[#e6e2db]/50 block">Itinerary</span>
              <p className="text-xs text-[#e6e2db]/80 mt-1">
                <strong>From:</strong> {booking.pickup_location?.address}
              </p>
              {booking.optional_stop && (
                <p className="text-xs text-[#e6e2db]/80 mt-0.5">
                  <strong>Stop:</strong> {booking.optional_stop?.address}
                </p>
              )}
              <p className="text-xs text-[#e6e2db]/80 mt-0.5">
                <strong>To:</strong> {booking.destination?.address}
              </p>
              <div className="mt-2 text-[11px] text-[#C9A667] font-semibold">
                Est. Distance: {booking.estimated_distance_km} km • Duration: ~{booking.estimated_duration_min} min
              </div>
            </div>
          </div>

          {/* Vehicle & Slot Card */}
          <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 flex items-start space-x-4">
            <span className="material-symbols-outlined text-[#C9A667] text-3xl mt-1">directions_bus</span>
            <div className="flex-grow">
              <span className="text-[10px] uppercase tracking-widest text-[#e6e2db]/50 block">Vehicle & Schedule</span>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-[#e6e2db]/90">
                <div>Date: <strong className="text-[#F7F3EC]">{booking.scheduled_date}</strong></div>
                <div>Slot: <strong className="text-[#C9A667]">{booking.scheduled_time_slot}</strong></div>
                <div>Guests: <strong className="text-[#F7F3EC]">{booking.guest_count}</strong></div>
                <div>Status: <span className="uppercase text-amber-400 font-semibold">{booking.status.replace('_', ' ')}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PayU Payment Summary & Actions (5 cols) */}
        <div className="lg:col-span-5">
          <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/40 p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="font-serif text-2xl text-[#F7F3EC] font-bold border-b border-[#C9A667]/20 pb-4">
              Payment Summary
            </h3>

            {/* Line items */}
            <div className="space-y-2.5 text-xs text-[#e6e2db]/80">
              <div className="flex justify-between">
                <span>Theme Complete Base:</span>
                <span>{formatCurrencyINR(booking.pricing.base_price_inr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Extra Mileage:</span>
                <span>{formatCurrencyINR(booking.pricing.extra_km_charge_inr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Add-ons:</span>
                <span>{formatCurrencyINR(booking.pricing.add_ons_total_inr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Menu Refreshments:</span>
                <span>{formatCurrencyINR(booking.pricing.menu_total_inr)}</span>
              </div>
              {booking.pricing.discount_inr > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount:</span>
                  <span>-{formatCurrencyINR(booking.pricing.discount_inr)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-white/5">
                <span>GST (5% Hospitality):</span>
                <span>{formatCurrencyINR(booking.pricing.tax_inr)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-[#C9A667]/30">
              <div className="flex items-baseline justify-between mb-6">
                <span className="text-xs uppercase tracking-wider text-[#e6e2db]/60">Amount Payable</span>
                <span className="font-sans text-3xl font-bold text-[#C9A667]">
                  {formatCurrencyINR(booking.pricing.total_inr)}
                </span>
              </div>

              {/* PayU Hosted Button */}
              <button
                onClick={handlePayUHostedCheckout}
                disabled={isProcessing}
                className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase py-4 rounded-full soft-glow hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-xl"
              >
                <span>{isProcessing ? 'Connecting Gateway...' : 'Pay with PayU India (₹)'}</span>
                <span className="material-symbols-outlined text-sm">lock</span>
              </button>

              {/* Sandbox Quick Confirm Pill */}
              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <p className="text-[11px] text-[#e6e2db]/50 mb-2">Developer / Tester Shortcut:</p>
                <button
                  type="button"
                  onClick={handleInstantSandboxPayment}
                  disabled={isProcessing}
                  className="w-full text-xs font-semibold py-2.5 px-4 rounded-full bg-[#0E3B2E]/60 text-[#9df1d6] border border-[#9df1d6]/30 hover:bg-[#0E3B2E] transition-colors"
                >
                  ⚡ Instant Sandbox Payment Confirmation
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center space-x-3 text-[10px] text-[#e6e2db]/50">
                <span className="material-symbols-outlined text-xs">shield</span>
                <span>256-Bit SSL Encrypted • RBI Compliant PayU Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
