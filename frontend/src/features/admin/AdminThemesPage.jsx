import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';

export default function AdminThemesPage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTheme, setEditingTheme] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    base_price_inr: 3499,
    included_km: 10,
    per_km_rate_inr: 8,
    mood_tags: 'romantic, intimate',
    accent_color: '#C9A667',
  });

  const loadThemes = async () => {
    try {
      setLoading(true);
      const data = await api.getThemes({ active_only: false });
      setThemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        base_price_inr: Number(formData.base_price_inr),
        included_km: Number(formData.included_km),
        per_km_rate_inr: Number(formData.per_km_rate_inr),
        mood_tags: typeof formData.mood_tags === 'string' ? formData.mood_tags.split(',').map((s) => s.trim().toLowerCase()) : formData.mood_tags,
        hero_images: ['/assets/renders/cinematic_3d_render_of_the_romantic_date_theme_inside_a_luxury_van._intimate_2.png'],
        add_ons: [
          { name: 'Mini Theatre Setup', description: 'Fold-down cinema screen', price_inr: 1499, type: 'toggle' },
          { name: 'Champagne & Flutes', description: 'Chilled bottle with crystal glasses', price_inr: 999, type: 'toggle' }
        ]
      };

      if (editingTheme) {
        await api.updateTheme(editingTheme.id, payload);
      } else {
        await api.createTheme(payload);
      }

      setShowCreateModal(false);
      setEditingTheme(null);
      loadThemes();
    } catch (err) {
      alert(`Error saving theme: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you wish to delete this theme?')) return;
    try {
      await api.deleteTheme(id);
      loadThemes();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#C9A667]/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-bold">
            Catalog Customization
          </span>
          <h1 className="font-serif text-3xl text-[#F7F3EC] font-bold">
            Themes & Add-Ons Management
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingTheme(null);
            setFormData({
              name: '',
              slug: '',
              tagline: '',
              description: '',
              base_price_inr: 3499,
              included_km: 10,
              per_km_rate_inr: 8,
              mood_tags: 'romantic, celebration',
              accent_color: '#C9A667',
            });
            setShowCreateModal(true);
          }}
          className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-gold-glow flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          <span>Create New Theme</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((t) => (
            <div
              key={t.id || t.slug}
              className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold text-[#141310]"
                    style={{ backgroundColor: t.accent_color || '#C9A667' }}
                  >
                    {t.slug}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingTheme(t);
                        setFormData({
                          name: t.name,
                          slug: t.slug,
                          tagline: t.tagline || '',
                          description: t.description || '',
                          base_price_inr: t.base_price_inr,
                          included_km: t.included_km,
                          per_km_rate_inr: t.per_km_rate_inr,
                          mood_tags: t.mood_tags?.join(', ') || '',
                          accent_color: t.accent_color || '#C9A667',
                        });
                        setShowCreateModal(true);
                      }}
                      className="p-1 text-[#e6e2db]/50 hover:text-[#C9A667]"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 text-[#e6e2db]/50 hover:text-red-400"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#F7F3EC]">{t.name}</h3>
                <p className="text-xs text-[#e6e2db]/70 mt-1 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-xs text-[#e6e2db]/70">
                  <div className="flex justify-between">
                    <span>Base Ride Fare:</span>
                    <strong className="text-[#C9A667]">{formatCurrencyINR(t.base_price_inr)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Included Complimentary:</span>
                    <span>{t.included_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Extra Mileage Rate:</span>
                    <span>₹{t.per_km_rate_inr} / km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Configured Add-ons:</span>
                    <span>{t.add_ons?.length || 0} Options</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Theme Create/Edit */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1B1B1B] border border-[#C9A667]/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif text-xl text-[#F7F3EC] font-bold">
                {editingTheme ? 'Edit Theme' : 'Create New Luxury Theme'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#e6e2db]/40 hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Theme Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Midnight Soiree"
                  className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g. midnight-soiree"
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.base_price_inr}
                    onChange={(e) => setFormData({ ...formData, base_price_inr: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Included Km</label>
                  <input
                    type="number"
                    value={formData.included_km}
                    onChange={(e) => setFormData({ ...formData, included_km: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Per Km Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.per_km_rate_inr}
                    onChange={(e) => setFormData({ ...formData, per_km_rate_inr: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs uppercase tracking-wider py-3 rounded-full mt-4"
              >
                {editingTheme ? 'Update Theme' : 'Create Theme'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
