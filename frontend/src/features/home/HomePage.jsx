import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import { formatCurrencyINR } from '../../utils/currency';
import RecommendationBanner from '../../components/ai/RecommendationBanner';

export default function HomePage() {
  const navigate = useNavigate();
  const { setThemeId } = useBooking();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadThemes() {
      try {
        const data = await api.getThemes();
        setThemes(data);
      } catch (err) {
        console.error('Failed to load themes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadThemes();
  }, []);

  const handleBookTheme = (slug) => {
    setThemeId(slug);
    navigate(`/theme/${slug}`);
  };

  return (
    <div className="space-y-16 pb-24">
      {/* Hero Section */}
      <section className="relative w-full min-h-[75vh] md:min-h-[82vh] flex items-center justify-center overflow-hidden rounded-b-3xl md:rounded-3xl border border-[#C9A667]/30 shadow-2xl relative">
        {/* Cinematic 3D Van Background */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/assets/renders/a_cinematic_realistic_3d_render_of_a_luxury_panel_van_mercedes_sprinter.png"
            alt="Mercedes-Benz Sprinter Luxury Mobile Cafe"
            className="w-full h-full object-cover object-center"
          />
          {/* Radial & Gradient Darkness for High-End Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141310] via-[#141310]/60 to-[#141310]/30" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#141310]/40 to-[#141310]/80" />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1B1B1B]/80 border border-[#C9A667]/40 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#C9A667] animate-pulse"></span>
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#C9A667] font-semibold">
              India's Premier Mobile Sanctuary
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-[#F7F3EC] leading-[1.1] mb-6 drop-shadow-2xl">
            A Private Sanctuary <br />
            <span className="italic font-normal text-[#C9A667]">in Motion.</span>
          </h1>

          <p className="font-sans text-sm sm:text-base md:text-lg text-[#e6e2db]/80 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Reserve a custom Mercedes-Benz lounge tailored with candlelit romantic ambiance, celebration revelry, or serene acoustic stillness as you glide across the city.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button
              onClick={() => navigate('/booking/destination')}
              className="w-full sm:w-auto gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase py-4 px-9 rounded-full shadow-gold-glow hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <span>Begin Your Journey</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <Link
              to="/explore"
              className="w-full sm:w-auto text-xs tracking-widest uppercase py-4 px-8 rounded-full border border-[#C9A667]/40 text-[#C9A667] hover:bg-[#C9A667]/10 transition-colors backdrop-blur-sm"
            >
              Explore All Themes
            </Link>
          </div>
        </div>
      </section>

      {/* AI Contextual Recommendation Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <RecommendationBanner variant="banner" />
      </div>

      {/* Section Divider */}
      <div className="flex items-center justify-center py-4">
        <div className="w-20 h-[1px] bg-[#C9A667]/30"></div>
        <div className="w-2 h-2 rotate-45 border border-[#C9A667] mx-4"></div>
        <div className="w-20 h-[1px] bg-[#C9A667]/30"></div>
      </div>

      {/* Curated Experiences / Themes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A667] font-semibold">
            Bespoke Atmosphere
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#F7F3EC] font-bold mt-2">
            Curated Experiences
          </h2>
          <p className="text-sm text-[#e6e2db]/70 max-w-xl mx-auto mt-2">
            Each mobile theme transforms the van's lighting, acoustic soundstage, aroma diffusion, and gourmet refreshments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {themes.map((theme) => {
            const heroImg = theme.hero_images?.[0] || '/assets/renders/cinematic_3d_render_of_the_romantic_date_theme_inside_a_luxury_van._intimate_2.png';
            return (
              <article
                key={theme.id || theme.slug}
                className="velvet-texture bg-[#1B1B1B] rounded-2xl p-6 border border-[#C9A667]/30 flex flex-col h-full group hover:border-[#C9A667] hover:shadow-gold-glow transition-all duration-500"
              >
                {/* Image Container */}
                <div className="relative w-full h-52 rounded-xl overflow-hidden mb-6 bg-[#141310]">
                  <img
                    src={heroImg}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 bg-[#141310]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#C9A667]/30">
                    <span className="text-[10px] tracking-widest uppercase text-[#C9A667] font-bold">
                      {theme.mood_tags?.[0] || 'Exclusive'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="font-serif text-2xl text-[#F7F3EC] font-semibold mb-2 group-hover:text-[#C9A667] transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-[#e6e2db]/70 line-clamp-3 leading-relaxed mb-6 font-sans">
                    {theme.description}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-[#C9A667]/20 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#e6e2db]/50 block">Complete Ride</span>
                    <span className="font-sans text-xl font-bold text-[#C9A667]">
                      {formatCurrencyINR(theme.base_price_inr)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBookTheme(theme.slug)}
                    className="flex items-center space-x-2 text-xs font-semibold text-[#F7F3EC] group-hover:text-[#C9A667] transition-colors"
                  >
                    <span>View Experience</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* The Van Cutaway & Engineering Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="velvet-texture bg-[#1c1c18] rounded-3xl border border-[#C9A667]/30 p-8 sm:p-12 overflow-hidden relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#C9A667] font-semibold">
                Bespoke Engineering
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#F7F3EC] font-bold mt-2 mb-4">
                The Van: Inside A Moving Lounge
              </h2>
              <p className="text-sm text-[#e6e2db]/80 leading-relaxed mb-6">
                Based on custom long-wheelbase Mercedes-Benz Sprinters, each vehicle is handcrafted with acoustic double-glazing, independent dual-zone climate systems, heated Italian velvet loungers, and integrated artisanal espresso bars.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-3 bg-[#141310] rounded-xl border border-[#C9A667]/20">
                  <div className="text-[#C9A667] font-serif text-lg font-bold">6-7 Guests</div>
                  <div className="text-[11px] text-[#e6e2db]/60">Captains Swivel Seating</div>
                </div>
                <div className="p-3 bg-[#141310] rounded-xl border border-[#C9A667]/20">
                  <div className="text-[#C9A667] font-serif text-lg font-bold">10 km Free</div>
                  <div className="text-[11px] text-[#e6e2db]/60">₹8/km transparent rate</div>
                </div>
                <div className="p-3 bg-[#141310] rounded-xl border border-[#C9A667]/20">
                  <div className="text-[#C9A667] font-serif text-lg font-bold">4K Cinema</div>
                  <div className="text-[11px] text-[#e6e2db]/60">Retractable 70" screen</div>
                </div>
                <div className="p-3 bg-[#141310] rounded-xl border border-[#C9A667]/20">
                  <div className="text-[#C9A667] font-serif text-lg font-bold">Live GPS</div>
                  <div className="text-[11px] text-[#e6e2db]/60">Real-time ride tracking</div>
                </div>
              </div>

              <Link
                to="/van"
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-bold text-[#C9A667] hover:text-[#E6D2AA] transition-colors underline underline-offset-8 decoration-[#C9A667]/50"
              >
                <span>Inspect 3D Floor Plan Cutaway</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {/* Floor Plan Render */}
            <div className="relative rounded-2xl overflow-hidden border border-[#C9A667]/30 bg-[#141310] shadow-xl">
              <img
                src="/assets/renders/a_clean_premium_3d_floor_plan_cutaway_of_a_luxury_van_interior._styled_in.png"
                alt="3D Floor Plan Cutaway"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 bg-[#141310]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#C9A667]/30 text-[10px] text-[#C9A667] uppercase tracking-wider font-semibold">
                3D Architectural Cutaway
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Transparency & Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C9A667] font-semibold">
            Honest Indulgence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#F7F3EC] font-bold mt-2">
            No Surge. Transparent Fares.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#1B1B1B] border border-[#C9A667]/20 text-center">
            <span className="material-symbols-outlined text-[#C9A667] text-3xl mb-3">verified</span>
            <h4 className="font-serif text-lg text-[#F7F3EC] font-semibold mb-2">Flat Base Rate</h4>
            <p className="text-xs text-[#e6e2db]/70 leading-relaxed">
              Every theme includes your private chauffeur, dedicated sanctuary styling, and the first 10 kilometers.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#1B1B1B] border border-[#C9A667]/20 text-center">
            <span className="material-symbols-outlined text-[#C9A667] text-3xl mb-3">speed</span>
            <h4 className="font-serif text-lg text-[#F7F3EC] font-semibold mb-2">₹8 Per Extra Km</h4>
            <p className="text-xs text-[#e6e2db]/70 leading-relaxed">
              Travel further along coastal roads or scenic highways with our fixed, ultra-fair per-kilometer rate.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#1B1B1B] border border-[#C9A667]/20 text-center">
            <span className="material-symbols-outlined text-[#C9A667] text-3xl mb-3">lock</span>
            <h4 className="font-serif text-lg text-[#F7F3EC] font-semibold mb-2">PayU Secured Checkout</h4>
            <p className="text-xs text-[#e6e2db]/70 leading-relaxed">
              Protected by 256-bit bank-grade encryption with instant booking verification and cancellation flexibility.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
