import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await api.updateVehicle(vehicleId, { status: newStatus });
      loadVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#C9A667]/20 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-bold">
            Automotive Logistics
          </span>
          <h1 className="font-serif text-3xl text-[#F7F3EC] font-bold">
            Mercedes Fleet Management
          </h1>
        </div>
        <span className="text-xs text-[#9df1d6] bg-[#0E3B2E] px-3 py-1.5 rounded-full border border-[#9df1d6]/30 font-semibold">
          {vehicles.length} Custom Lounges Registered
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id || v._id}
              className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-[#141310]">
                  <img
                    src={v.render_image_url || '/assets/renders/a_cinematic_realistic_3d_render_of_a_luxury_panel_van_mercedes_sprinter.png'}
                    alt={v.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold shadow-md ${
                        v.status === 'available'
                          ? 'bg-[#0E3B2E] text-[#9df1d6]'
                          : v.status === 'on_ride'
                          ? 'bg-amber-500/30 text-amber-300'
                          : 'bg-red-500/30 text-red-300'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#F7F3EC]">{v.name}</h3>
                <p className="text-xs text-[#C9A667] font-medium">{v.model}</p>

                <div className="space-y-1 text-xs text-[#e6e2db]/70 mt-3 pt-3 border-t border-white/5">
                  <div>👥 Capacity: <strong>{v.seating_capacity} Swivel Captains</strong></div>
                  <div>📍 Base Hub: <strong>{v.current_location?.address}</strong></div>
                  <div className="text-[11px] text-[#e6e2db]/50 pt-1">
                    Features: {v.features?.slice(0, 2).join(' • ')}
                  </div>
                </div>
              </div>

              {/* Status Switcher Action */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#e6e2db]/50">Status:</span>
                <select
                  value={v.status}
                  onChange={(e) => handleStatusChange(v.id || v._id, e.target.value)}
                  className="bg-[#141310] border border-white/20 text-xs text-[#F7F3EC] rounded-lg px-2.5 py-1.5 focus:border-[#C9A667]"
                >
                  <option value="available">Available</option>
                  <option value="on_ride">On Ride</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
