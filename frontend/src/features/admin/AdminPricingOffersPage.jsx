import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/currency';

export default function AdminPricingOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    value: 10,
    min_order_value_inr: 2500,
    max_discount_inr: 1000,
    description: '',
  });

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await api.getOffers();
      setOffers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      await api.createOffer({
        ...formData,
        code: formData.code.toUpperCase().trim(),
        value: Number(formData.value),
        min_order_value_inr: Number(formData.min_order_value_inr),
        max_discount_inr: Number(formData.max_discount_inr),
      });
      setShowAddModal(false);
      loadOffers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-[#C9A667]/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-bold">
            Revenue & Promotions
          </span>
          <h1 className="font-serif text-3xl text-[#F7F3EC] font-bold">
            Pricing Engine & Promo Codes
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="gold-gradient text-[#1B1B1B] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-gold-glow flex items-center space-x-1.5"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          <span>New Promo Code</span>
        </button>
      </div>

      {/* Global Fare Parameters Card */}
      <div className="velvet-texture bg-[#1c1c18] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#F7F3EC] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#C9A667]">tune</span>
          <span>Global Tariff Configuration</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div className="p-4 bg-[#141310] rounded-xl border border-white/5 space-y-1">
            <span className="text-[#C9A667] uppercase font-semibold text-[10px]">Complimentary Distance</span>
            <div className="font-sans text-xl font-bold text-[#F7F3EC]">10.0 km</div>
            <p className="text-[11px] text-[#e6e2db]/60">Included free in all base theme reservations</p>
          </div>
          <div className="p-4 bg-[#141310] rounded-xl border border-white/5 space-y-1">
            <span className="text-[#C9A667] uppercase font-semibold text-[10px]">Beyond 10 km Mileage</span>
            <div className="font-sans text-xl font-bold text-[#9df1d6]">₹8.00 / km</div>
            <p className="text-[11px] text-[#e6e2db]/60">Standard linear excess road distance tariff</p>
          </div>
          <div className="p-4 bg-[#141310] rounded-xl border border-white/5 space-y-1">
            <span className="text-[#C9A667] uppercase font-semibold text-[10px]">Hospitality GST</span>
            <div className="font-sans text-xl font-bold text-[#F7F3EC]">5.0%</div>
            <p className="text-[11px] text-[#e6e2db]/60">Applied to taxable amount after deductions</p>
          </div>
        </div>
      </div>

      {/* Active Promo Codes Table */}
      <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#F7F3EC]">
          Promotional Codes ({offers.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#e6e2db]/50 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Min Order</th>
                <th className="py-3 px-3">Max Cap</th>
                <th className="py-3 px-3">Redeemed</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {offers.map((offer) => (
                <tr key={offer.id || offer._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#C9A667] text-sm">
                    {offer.code}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#F7F3EC]">
                    {offer.discount_type === 'percentage' ? `${offer.value}%` : formatCurrencyINR(offer.value)}
                  </td>
                  <td className="py-3 px-3 text-[#e6e2db]/80">
                    {formatCurrencyINR(offer.min_order_value_inr)}
                  </td>
                  <td className="py-3 px-3 text-[#e6e2db]/80">
                    {offer.max_discount_inr ? formatCurrencyINR(offer.max_discount_inr) : 'None'}
                  </td>
                  <td className="py-3 px-3 text-[#9df1d6] font-medium">
                    {offer.times_used || 0} times
                  </td>
                  <td className="py-3 px-3 text-[#e6e2db]/60 max-w-xs truncate">
                    {offer.description}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete coupon ${offer.code}?`)) {
                          await api.deleteOffer(offer.id || offer._id);
                          loadOffers();
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
      </div>

      {/* Add Offer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1B1B1B] border border-[#C9A667]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-serif text-lg text-[#F7F3EC] font-bold">Create Promo Code</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#e6e2db]/40">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LUXURY25"
                  className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC] font-mono tracking-widest uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.min_order_value_inr}
                    onChange={(e) => setFormData({ ...formData, min_order_value_inr: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.max_discount_inr}
                    onChange={(e) => setFormData({ ...formData, max_discount_inr: e.target.value })}
                    className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#C9A667] mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 10% off on all weekend bookings"
                  className="w-full bg-[#141310] border border-white/10 rounded-lg p-2.5 text-[#F7F3EC]"
                />
              </div>

              <button
                type="submit"
                className="w-full gold-gradient text-[#1B1B1B] font-bold text-xs uppercase tracking-wider py-3 rounded-full mt-4"
              >
                Create Promo Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
