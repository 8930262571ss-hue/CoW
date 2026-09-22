import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import { formatCurrencyINR } from '../../utils/currency';
import Viewer360 from '../../components/viewer/Viewer360';

export default function ThemeDetailPage() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const {
    setThemeId: setBookingThemeId,
    selectedAddOns,
    toggleAddOn,
    pricingBreakdown,
  } = useBooking();

  const [theme, setTheme] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('360'); // '360' | 'gallery'

  useEffect(() => {
    async function loadThemeAndMenu() {
      try {
        setLoading(true);
        const data = await api.getTheme(themeId);
        setTheme(data);
        setBookingThemeId(data.slug);

        const menuData = await api.getMenuItems();
        setMenuItems(menuData);
      } catch (err) {
        console.error('Failed to load theme details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadThemeAndMenu();
  }, [themeId, setBookingThemeId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="text-center py-24">
        <h2 className="font-serif text-2xl text-[#ffdadb]">Theme not found</h2>
        <button
          onClick={() => navigate('/explore')}
          className="mt-4 text-xs text-[#C9A667] underline"
        >
          Return to themes
        </button>
      </div>
    );
  }

  const isAddOnSelected = (addonName) => selectedAddOns.some((a) => a.name === addonName);

  const heroImage =
    theme.hero_images?.[0] ||
    '/assets/renders/cinematic_3d_render_of_the_romantic_date_theme_inside_a_luxury_van._intimate_2.png';

  const handleProceedToBooking = () => {
    navigate('/booking/destination');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12 pb-28">
      {/* Theme Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#C9A667]/20 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span
              className="text-[10px] tracking-widest uppercase px-3 py-1 rounded-full font-bold text-[#141310]"
              style={{ backgroundColor: theme.accent_color || '#C9A667' }}
            >
              {theme.mood_tags?.[0] || 'Theme Collection'}
            </span>
            <span className="text-xs text-[#e6e2db]/60">
              Ideal for: {theme.ideal_for || 'Private Indulgence'}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#F7F3EC] font-bold">
            {theme.name}
          </h1>
          <p className="text-sm text-[#e6e2db]/80 mt-2 max-w-2xl font-sans">
            {theme.description}
          </p>
        </div>

        {/* Starting Price & Book Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#e6e2db]/50 block sm:text-right">
              Complete Ride (Includes 10 km)
            </span>
            <span className="font-sans text-2xl sm:text-3xl font-bold text-[#C9A667]">
              {formatCurrencyINR(theme.base_price_inr)}
            </span>
          </div>
          <button
            onClick={handleProceedToBooking}
            className="gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase px-8 py-3 rounded-full soft-glow hover:opacity-90 transition-all mt-2 active:scale-95"
          >
            Reserve Sanctuary
          </button>
        </div>
      </div>

      {/* Main Grid: Left Interactive Stage, Right Sticky Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Col (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Interactive Viewer / Gallery Switcher */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() => setActiveTab('360')}
                className={`flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-all ${
                  activeTab === '360'
                    ? 'bg-[#C9A667] text-[#1B1B1B] border-[#C9A667]'
                    : 'bg-[#1B1B1B] text-[#e6e2db]/70 border-white/10 hover:border-[#C9A667]/40'
                }`}
              >
                <span className="material-symbols-outlined text-base">360</span>
                <span>Interactive 360° Tour</span>
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-[#C9A667] text-[#1B1B1B] border-[#C9A667]'
                    : 'bg-[#1B1B1B] text-[#e6e2db]/70 border-white/10 hover:border-[#C9A667]/40'
                }`}
              >
                <span className="material-symbols-outlined text-base">photo_library</span>
                <span>Cinematic Renders</span>
              </button>
            </div>

            {activeTab === '360' ? (
              <Viewer360
                imageUrl={theme.tour_360_url}
                hotspots={theme.tour_360_hotspots || []}
                title={`${theme.name} • 360° Living Room`}
                accentColor={theme.accent_color || '#C9A667'}
              />
            ) : (
              <div className="relative rounded-tailored-lg overflow-hidden border border-[#C9A667]/30 h-[440px] sm:h-[500px]">
                <img
                  src={heroImage}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Van Atmosphere & Sensory Details */}
          <section className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/20 p-6 sm:p-8">
            <h3 className="font-serif text-2xl text-[#F7F3EC] font-semibold mb-6">
              The Sensory Environment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#C9A667]">
                  <span className="material-symbols-outlined text-lg">music_note</span>
                  <h4 className="text-xs uppercase tracking-widest font-semibold">Soundstage</h4>
                </div>
                <p className="text-xs text-[#e6e2db]/80">{theme.suggested_music || 'Bowers & Wilkins Hi-Res Acoustic Tuning'}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#C9A667]">
                  <span className="material-symbols-outlined text-lg">wb_incandescent</span>
                  <h4 className="text-xs uppercase tracking-widest font-semibold">Illumination</h4>
                </div>
                <p className="text-xs text-[#e6e2db]/80">Fibre-optic starlight ceiling & warm amber dimmable sconces</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[#C9A667]">
                  <span className="material-symbols-outlined text-lg">air</span>
                  <h4 className="text-xs uppercase tracking-widest font-semibold">Aromatics</h4>
                </div>
                <p className="text-xs text-[#e6e2db]/80">Single-estate botanical diffusion with dual HEPA filtration</p>
              </div>
            </div>
          </section>

          {/* Add-ons Configuration Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold">
                  Personalize
                </span>
                <h3 className="font-serif text-2xl text-[#F7F3EC] font-semibold">
                  Enhance Your Evening
                </h3>
              </div>
              <span className="text-xs text-[#e6e2db]/50">Select add-ons to customize</span>
            </div>

            <div className="space-y-4">
              {theme.add_ons?.map((addon) => {
                const isSelected = isAddOnSelected(addon.name);
                return (
                  <div
                    key={addon.name}
                    onClick={() => toggleAddOn(addon)}
                    className={`cursor-pointer rounded-xl border p-5 transition-all duration-300 flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#20201c] border-[#C9A667] shadow-gold-glow'
                        : 'bg-[#1B1B1B] border-white/10 hover:border-[#C9A667]/40'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 border transition-colors ${
                          isSelected
                            ? 'bg-[#C9A667] border-[#C9A667] text-[#1B1B1B]'
                            : 'border-white/30 text-transparent'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">check</span>
                      </div>
                      <div>
                        <h4 className="font-serif text-base text-[#F7F3EC] font-semibold">
                          {addon.name}
                        </h4>
                        <p className="text-xs text-[#e6e2db]/70 mt-1 max-w-lg leading-relaxed font-sans">
                          {addon.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="font-sans text-base font-bold text-[#C9A667]">
                        +{formatCurrencyINR(addon.price_inr)}
                      </span>
                      <span className="block text-[10px] text-[#e6e2db]/50 uppercase tracking-wider">
                        {isSelected ? 'Included' : 'Tap to Add'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Menu Preview Carousel */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold">
                  Artisanal Fare
                </span>
                <h3 className="font-serif text-2xl text-[#F7F3EC] font-semibold">
                  Gourmet Menu Selections
                </h3>
              </div>
              <button
                onClick={() => navigate('/booking/customize')}
                className="text-xs text-[#C9A667] hover:underline"
              >
                Browse Full Menu
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {menuItems.slice(0, 3).map((item) => (
                <div
                  key={item.id || item._id}
                  className="bg-[#1B1B1B] rounded-xl border border-white/10 overflow-hidden group hover:border-[#C9A667]/40 transition-colors"
                >
                  <div className="h-36 w-full overflow-hidden bg-[#141310]">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h5 className="font-serif text-sm text-[#F7F3EC] font-semibold truncate">
                      {item.name}
                    </h5>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="text-xs font-bold text-[#C9A667]">
                        {formatCurrencyINR(item.price_inr)}
                      </span>
                      <span className="text-[10px] text-[#e6e2db]/50 uppercase">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col: Sticky Booking Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/40 p-6 shadow-2xl space-y-6">
            <h3 className="font-serif text-xl text-[#F7F3EC] font-bold border-b border-[#C9A667]/20 pb-4">
              Your Sanctuary Summary
            </h3>

            {/* Selected Theme Card */}
            <div className="flex items-center space-x-3 p-3 bg-[#141310] rounded-xl border border-white/5">
              <img
                src={heroImage}
                alt={theme.name}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-serif text-sm text-[#F7F3EC] font-semibold">{theme.name}</h4>
                <p className="text-[11px] text-[#e6e2db]/60">10 km Complimentary</p>
                <span className="text-xs font-bold text-[#C9A667]">
                  {formatCurrencyINR(theme.base_price_inr)}
                </span>
              </div>
            </div>

            {/* Active Add-ons list */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold block mb-2">
                Selected Add-Ons ({selectedAddOns.length})
              </span>
              {selectedAddOns.length === 0 ? (
                <p className="text-xs text-[#e6e2db]/40 italic">No add-ons selected yet</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedAddOns.map((a) => (
                    <div key={a.name} className="flex justify-between text-xs text-[#e6e2db]/80">
                      <span>• {a.name}</span>
                      <span className="font-medium text-[#C9A667]">
                        +{formatCurrencyINR(a.price_inr)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rate Structure Pill */}
            <div className="p-3 bg-[#20201c] rounded-xl border border-[#C9A667]/20 text-[11px] space-y-1 text-[#e6e2db]/70">
              <div className="flex justify-between">
                <span>Included Travel:</span>
                <span className="font-medium text-[#F7F3EC]">10.0 km</span>
              </div>
              <div className="flex justify-between">
                <span>Beyond 10 km:</span>
                <span className="font-medium text-[#F7F3EC]">₹8.00 / km</span>
              </div>
              <div className="flex justify-between">
                <span>Driver & Hospitality:</span>
                <span className="font-medium text-[#0E3B2E] text-[#9df1d6]">Included</span>
              </div>
            </div>

            {/* Price Total */}
            <div className="pt-4 border-t border-[#C9A667]/20">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-[#e6e2db]/70">
                  Estimated Total
                </span>
                <span className="font-sans text-2xl font-bold text-[#C9A667]">
                  {formatCurrencyINR(
                    pricingBreakdown?.total_inr ||
                      theme.base_price_inr +
                        selectedAddOns.reduce((acc, cur) => acc + (cur.price_inr || 0), 0)
                  )}
                </span>
              </div>

              <button
                onClick={handleProceedToBooking}
                className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase py-3.5 rounded-full soft-glow hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Proceed to Destination</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
