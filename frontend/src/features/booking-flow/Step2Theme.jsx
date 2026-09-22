import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';
import BookingStepBar from './BookingStepBar';

export default function Step2Theme() {
  const navigate = useNavigate();
  const { themeId, setThemeId, pricingBreakdown } = useBooking();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getThemes();
        setThemes(data);
      } catch (err) {
        console.error('Failed to load themes:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 pb-28">
      <BookingStepBar currentStep={2} />

      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-[#C9A667] font-semibold">
          Step 2 of 5
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#F7F3EC] font-bold mt-1">
          Choose Your Sanctuary Theme
        </h1>
        <p className="text-xs sm:text-sm text-[#e6e2db]/70 mt-1">
          Select the interior styling, lighting temperature, and acoustic atmosphere for your journey.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {themes.map((theme) => {
            const isSelected = themeId === theme.slug;
            const heroImg =
              theme.hero_images?.[0] ||
              '/assets/renders/cinematic_3d_render_of_the_romantic_date_theme_inside_a_luxury_van._intimate_2.png';

            return (
              <div
                key={theme.slug}
                onClick={() => setThemeId(theme.slug)}
                className={`cursor-pointer rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col justify-between velvet-texture ${
                  isSelected
                    ? 'bg-[#20201c] border-[#C9A667] shadow-gold-glow-lg scale-[1.02]'
                    : 'bg-[#1B1B1B] border-white/10 hover:border-[#C9A667]/50'
                }`}
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden bg-[#141310]">
                  <img
                    src={heroImg}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-transparent to-black/20" />
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-[#C9A667] text-[#1B1B1B] px-3 py-1 rounded-full font-bold text-xs flex items-center space-x-1 shadow-lg">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Selected</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#141310]/90 text-[#C9A667] font-semibold border border-[#C9A667]/30">
                      {theme.mood_tags?.[0] || 'Exclusive'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl text-[#F7F3EC] font-bold mb-2">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-[#e6e2db]/75 leading-relaxed mb-4">
                      {theme.description}
                    </p>

                    <div className="space-y-1 text-xs text-[#e6e2db]/60 mb-6">
                      <div>• Complimentary 10 km Included</div>
                      <div>• Chauffeur & Hospitality Concierge</div>
                      <div>• Integrated Ambient Audio & Lighting</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-[#e6e2db]/50 block">Base Price</span>
                      <span className="font-sans text-xl font-bold text-[#C9A667]">
                        {formatCurrencyINR(theme.base_price_inr)}
                      </span>
                    </div>

                    <div
                      className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-[#C9A667] text-[#1B1B1B] border-[#C9A667]'
                          : 'border-[#C9A667]/40 text-[#C9A667] hover:bg-[#C9A667]/10'
                      }`}
                    >
                      {isSelected ? 'Theme Selected' : 'Choose Theme'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-white/10">
        <button
          onClick={() => navigate('/booking/destination')}
          className="text-xs uppercase tracking-widest text-[#e6e2db]/70 hover:text-[#C9A667] transition-colors flex items-center space-x-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Destination</span>
        </button>

        <button
          onClick={() => navigate('/booking/customize')}
          className="gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase px-9 py-3.5 rounded-full soft-glow hover:opacity-90 transition-all flex items-center space-x-2 active:scale-95 shadow-xl"
        >
          <span>Step 3: Customize Menu & Add-ons</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
