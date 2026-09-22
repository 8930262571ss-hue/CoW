import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Coffee & Beverages',
    description: '',
    price_inr: 399,
    is_veg: true,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    is_available: true,
  });

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await api.getMenuItems({ available_only: false });
      setMenuItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleToggleAvailability = async (item) => {
    try {
      const id = item.id || item._id;
      await api.updateMenuItem(id, { is_available: !item.is_available });
      loadMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await api.createMenuItem({
        ...formData,
        price_inr: Number(formData.price_inr),
      });
      setShowAddModal(false);
      loadMenu();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#C9A667]/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-bold">
            Hospitality Pantry
          </span>
          <h1 className="font-serif text-3xl text-[#F7F3EC] font-bold">
            Artisanal Menu Management
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-gold-glow flex items-center space-x-1.5"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          <span>Add Menu Item</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#e6e2db]/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Availability</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {menuItems.map((item) => (
                <tr key={item.id || item._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 flex items-center space-x-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-[#141310]"
                    />
                    <div>
                      <span className="font-bold text-[#F7F3EC] block">{item.name}</span>
                      <span className="text-[11px] text-[#e6e2db]/50 truncate max-w-xs block">
                        {item.description}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#C9A667] font-medium">{item.category}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                        item.is_veg ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {item.is_veg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#F7F3EC]">
                    {formatCurrencyINR(item.price_inr)}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border transition-colors ${
                        item.is_available
                          ? 'bg-[#0E3B2E] text-[#9df1d6] border-[#9df1d6]/30'
                          : 'bg-white/10 text-[#e6e2db]/40 border-white/20'
                      }`}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete ${item.name}?`)) {
                          await api.deleteMenuItem(item.id || item._id);
                          loadMenu();
                        }
                      }}
                      className="text-[#e6e2db]/40 hover:text-red-400 p-1"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1B1B1B] border border-[#C9A667]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif text-lg text-[#F7F3EC] font-bold">New Artisanal Dish</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#e6e2db]/40">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Saffron Brioche French Toast"
                  className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  >
                    <option value="Coffee & Beverages">Coffee & Beverages</option>
                    <option value="Bakery & Desserts">Bakery & Desserts</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Full Meals">Full Meals</option>
                    <option value="Regional Cuisine">Regional Cuisine</option>
                    <option value="Vegan/Vegetarian">Vegan/Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price_inr}
                    onChange={(e) => setFormData({ ...formData, price_inr: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="vegCheck"
                  checked={formData.is_veg}
                  onChange={(e) => setFormData({ ...formData, is_veg: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
                <label htmlFor="vegCheck" className="text-xs text-[#e6e2db]/90">
                  Vegetarian Preparation
                </label>
              </div>

              <button
                type="submit"
                className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs uppercase tracking-wider py-3 rounded-full mt-4"
              >
                Add Dish to Menu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
