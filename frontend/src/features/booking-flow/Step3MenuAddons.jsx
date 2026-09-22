import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';
import BookingStepBar from './BookingStepBar';

export default function Step3MenuAddons() {
  const navigate = useNavigate();
  const {
    themeId,
    selectedAddOns,
    toggleAddOn,
    selectedMenuItems,
    updateMenuItemQuantity,
    pricingBreakdown,
  } = useBooking();

  const [theme, setTheme] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [themeData, menuData, cats] = await Promise.all([
          api.getTheme(themeId || 'romantic-date'),
          api.getMenuItems(),
          api.getMenuCategories(),
        ]);
        setTheme(themeData);
        setMenuItems(menuData);
        setCategories(['All', ...cats]);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [themeId]);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.is_veg;
    return matchesCat && matchesVeg;
  });

  const getItemQuantity = (itemId) => {
    const found = selectedMenuItems.find((m) => (m.id || m._id || m.item_id) === itemId);
    return found ? found.quantity : 0;
  };

  const isAddOnSelected = (addonName) => selectedAddOns.some((a) => a.name === addonName);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10 pb-28">
      <BookingStepBar currentStep={3} />

      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-[#C9A667] font-semibold">
          Step 3 of 5
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#F7F3EC] font-bold mt-1">
          Customize Add-ons & Menu
        </h1>
        <p className="text-xs sm:text-sm text-[#e6e2db]/70 mt-1">
          Select experiential additions for your {theme?.name || 'Sanctuary'} and artisanal refreshments served during transit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Selection Area (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Section 1: Theme Add-ons */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#C9A667]/20 pb-3">
              <h2 className="font-serif text-2xl text-[#F7F3EC] font-semibold">
                Atmosphere Add-Ons
              </h2>
              <span className="text-xs text-[#C9A667] font-sans">
                Tailored for {theme?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {theme?.add_ons?.map((addon) => {
                const isSelected = isAddOnSelected(addon.name);
                return (
                  <div
                    key={addon.name}
                    onClick={() => toggleAddOn(addon)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#20201c] border-[#C9A667] shadow-gold-glow'
                        : 'bg-[#1B1B1B] border-white/10 hover:border-[#C9A667]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#0E3B2E] text-[#9df1d6] font-semibold">
                          Add-on
                        </span>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-[#C9A667] border-[#C9A667] text-[#1B1B1B]'
                              : 'border-white/30 text-transparent'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                        </div>
                      </div>
                      <h4 className="font-serif text-base text-[#F7F3EC] font-semibold">
                        {addon.name}
                      </h4>
                      <p className="text-xs text-[#e6e2db]/70 mt-1 leading-relaxed">
                        {addon.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#C9A667]">
                        +{formatCurrencyINR(addon.price_inr)}
                      </span>
                      <span className="text-[10px] text-[#e6e2db]/50 uppercase">
                        {isSelected ? 'Added to ride' : 'Tap to select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Artisanal Menu */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C9A667]/20 pb-3">
              <div>
                <h2 className="font-serif text-2xl text-[#F7F3EC] font-semibold">
                  Artisanal Onboard Fare
                </h2>
                <p className="text-xs text-[#e6e2db]/60">Freshly prepared and plated inside your private mobile lounge.</p>
              </div>

              {/* Veg Toggle */}
              <button
                type="button"
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  vegOnly
                    ? 'bg-[#0E3B2E] text-[#9df1d6] border-[#0E3B2E]'
                    : 'bg-[#141310] text-[#e6e2db]/70 border-white/20'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Vegetarian Only</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-4 py-2 rounded-full whitespace-nowrap border transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#C9A667] text-[#1B1B1B] border-[#C9A667] font-semibold shadow-md'
                      : 'bg-[#1B1B1B] text-[#e6e2db]/70 border-white/10 hover:border-[#C9A667]/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenuItems.map((item) => {
                const itemId = item.id || item._id;
                const qty = getItemQuantity(itemId);

                return (
                  <div
                    key={itemId}
                    className="bg-[#1B1B1B] rounded-xl border border-white/10 p-3.5 flex gap-4 hover:border-[#C9A667]/40 transition-colors"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0 bg-[#141310]"
                    />

                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.is_veg ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="text-[10px] uppercase text-[#e6e2db]/50 tracking-wider">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-semibold text-[#F7F3EC] leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#e6e2db]/60 line-clamp-2 mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-xs font-bold text-[#C9A667]">
                          {formatCurrencyINR(item.price_inr)}
                        </span>

                        {qty === 0 ? (
                          <button
                            onClick={() => updateMenuItemQuantity(item, 1)}
                            className="text-xs bg-[#242424] text-[#C9A667] border border-[#C9A667]/30 px-3 py-1 rounded-full font-semibold hover:bg-[#C9A667] hover:text-[#1B1B1B] transition-colors"
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 bg-[#141310] border border-[#C9A667]/40 rounded-full px-2 py-0.5">
                            <button
                              onClick={() => updateMenuItemQuantity(item, -1)}
                              className="text-sm font-bold text-[#C9A667] px-1 hover:text-white"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-[#F7F3EC] w-4 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateMenuItemQuantity(item, 1)}
                              className="text-sm font-bold text-[#C9A667] px-1 hover:text-white"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Sticky Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/40 p-6 shadow-2xl space-y-6">
            <h3 className="font-serif text-xl text-[#F7F3EC] font-bold border-b border-[#C9A667]/20 pb-3">
              Running Order Total
            </h3>

            {/* Selected Add-ons */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold block mb-2">
                Atmosphere Add-ons ({selectedAddOns.length})
              </span>
              {selectedAddOns.length === 0 ? (
                <p className="text-xs text-[#e6e2db]/40 italic">None selected</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedAddOns.map((a) => (
                    <div key={a.name} className="flex justify-between text-xs text-[#e6e2db]/80">
                      <span className="truncate max-w-[170px]">✓ {a.name}</span>
                      <span className="font-semibold text-[#C9A667]">
                        +{formatCurrencyINR(a.price_inr)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Menu Items */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold block mb-2">
                Artisanal Refreshments ({selectedMenuItems.reduce((a, c) => a + c.quantity, 0)})
              </span>
              {selectedMenuItems.length === 0 ? (
                <p className="text-xs text-[#e6e2db]/40 italic">No menu items selected</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedMenuItems.map((m) => (
                    <div
                      key={m.id || m._id || m.item_id}
                      className="flex justify-between text-xs text-[#e6e2db]/80"
                    >
                      <span className="truncate max-w-[160px]">
                        {m.quantity}x {m.name}
                      </span>
                      <span className="font-semibold text-[#C9A667]">
                        +{formatCurrencyINR(m.price_inr * m.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Breakdown Breakdown */}
            <div className="p-3.5 bg-[#141310] rounded-xl border border-white/5 space-y-1.5 text-xs text-[#e6e2db]/70">
              <div className="flex justify-between">
                <span>Theme Base (10 km):</span>
                <span>{formatCurrencyINR(pricingBreakdown?.base_price_inr || 3499)}</span>
              </div>
              <div className="flex justify-between">
                <span>Extra Mileage ({pricingBreakdown?.extra_km || 0} km):</span>
                <span>{formatCurrencyINR(pricingBreakdown?.extra_km_charge_inr || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Add-ons & Refreshments:</span>
                <span>
                  {formatCurrencyINR(
                    (pricingBreakdown?.add_ons_total_inr || 0) +
                      (pricingBreakdown?.menu_total_inr || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#9df1d6]">
                <span>5% GST:</span>
                <span>{formatCurrencyINR(pricingBreakdown?.tax_inr || 0)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-[#C9A667]/20">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-[#e6e2db]/60">Total</span>
                <span className="font-sans text-2xl font-bold text-[#C9A667]">
                  {formatCurrencyINR(pricingBreakdown?.total_inr || 3499)}
                </span>
              </div>

              <button
                onClick={() => navigate('/booking/vehicle-time')}
                className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase py-3.5 rounded-full soft-glow hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Step 4: Vehicle & Slot</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
