import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import { formatCurrencyINR } from '../../utils/currency';

export default function ExploreThemesPage() {
  const navigate = useNavigate();
  const { setThemeId } = useBooking();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredThemes = themes.filter((theme) => {
    const matchesMood =
      selectedMood === 'all' ||
      theme.mood_tags?.some((m) => m.toLowerCase().includes(selectedMood.toLowerCase()));
    const matchesSearch =
      !searchQuery ||
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMood && matchesSearch;
  });

  const handleSelectTheme = (slug) => {
    setThemeId(slug);
    navigate(`/theme/${slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12 pb-24">
      {/* Header / Filter Banner */}
      <section className="velvet-texture bg-[#1c1c18] rounded-2xl p-8 sm:p-12 border border-[#C9A667]/20 shadow-xl text-center">
        <div className="max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A667] font-semibold">
            Atmospheric Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#F7F3EC] font-bold mt-2 mb-4">
            Curate Your Journey
          </h1>
          <p className="text-sm text-[#e6e2db]/75 leading-relaxed font-sans mb-8">
            Select an ambiance to transform your mobile lounge. Every theme is meticulously prepared with tailored lighting, acoustics, and gourmet selections.
          </p>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            <div className="bg-[#141310] border border-[#C9A667]/30 rounded-xl p-2.5 focus-within:border-[#C9A667]">
              <label className="block text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold mb-1 px-1">
                Atmosphere Mood
              </label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full bg-transparent text-sm text-[#F7F3EC] focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#1B1B1B]">All Atmospheres</option>
                <option value="romantic" className="bg-[#1B1B1B]">Romantic & Intimate</option>
                <option value="celebration" className="bg-[#1B1B1B]">Birthday & Celebration</option>
                <option value="comfort" className="bg-[#1B1B1B]">Comfort & Acoustic Relaxation</option>
              </select>
            </div>

            <div className="bg-[#141310] border border-[#C9A667]/30 rounded-xl p-2.5 focus-within:border-[#C9A667]">
              <label className="block text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold mb-1 px-1">
                Search Curations
              </label>
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#e6e2db]/40 text-base">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Candlelight, Projector, Truffle"
                  className="w-full bg-transparent text-sm text-[#F7F3EC] placeholder-[#e6e2db]/30 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Themes Grid */}
      <section>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredThemes.length === 0 ? (
          <div className="text-center py-16 bg-[#1B1B1B] rounded-2xl border border-white/10">
            <span className="material-symbols-outlined text-[#C9A667] text-4xl mb-2">sentiment_dissatisfied</span>
            <p className="text-sm text-[#e6e2db]/70">No themes found matching your filter criteria.</p>
            <button
              onClick={() => { setSelectedMood('all'); setSearchQuery(''); }}
              className="mt-4 text-xs text-[#C9A667] underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredThemes.map((theme) => {
              const heroImg = theme.hero_images?.[0] || '/assets/renders/cinematic_3d_render_of_the_romantic_date_theme_inside_a_luxury_van._intimate_2.png';
              return (
                <div
                  key={theme.id || theme.slug}
                  className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 overflow-hidden flex flex-col group hover:border-[#C9A667] hover:shadow-gold-glow transition-all duration-500"
                >
                  {/* Image Container */}
                  <div className="relative h-60 w-full overflow-hidden bg-[#141310]">
                    <img
                      src={heroImg}
                      alt={theme.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-transparent to-black/30" />
                    
                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {theme.mood_tags?.map((t) => (
                        <span
                          key={t}
                          className="bg-[#141310]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#C9A667]/30 text-[10px] tracking-wider uppercase text-[#C9A667] font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* 360 Tour Available Badge */}
                    <div className="absolute bottom-3 right-3 bg-[#0E3B2E]/90 border border-[#9df1d6]/30 px-2.5 py-1 rounded-full flex items-center space-x-1.5 text-[10px] text-[#9df1d6]">
                      <span className="material-symbols-outlined text-xs">360</span>
                      <span>360° Interactive</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-2xl text-[#F7F3EC] font-bold mb-2 group-hover:text-[#C9A667] transition-colors">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-[#e6e2db]/70 leading-relaxed font-sans mb-4">
                        {theme.tagline || theme.description}
                      </p>

                      {/* Add-ons Preview */}
                      <div className="mb-6">
                        <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold block mb-2">
                          Featured Add-Ons:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {theme.add_ons?.slice(0, 2).map((a) => (
                            <span
                              key={a.name}
                              className="text-[11px] px-2.5 py-1 rounded-md bg-[#242424] text-[#e6e2db]/80 border border-white/5"
                            >
                              + {a.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-4 border-t border-[#C9A667]/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#e6e2db]/50 block">From (10 km included)</span>
                        <span className="font-sans text-xl font-bold text-[#C9A667]">
                          {formatCurrencyINR(theme.base_price_inr)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleSelectTheme(theme.slug)}
                        className="gold-gradient text-[#1B1B1B] text-xs font-bold px-5 py-2.5 rounded-full soft-glow hover:opacity-90 transition-all flex items-center space-x-1.5"
                      >
                        <span>Explore</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
