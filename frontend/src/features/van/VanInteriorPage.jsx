import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VanInteriorPage() {
  const navigate = useNavigate();

  const specifications = [
    { label: "Base Platform", value: "Mercedes-Benz Sprinter 319 CDI Long Wheelbase" },
    { label: "Guest Seating", value: "6-7 Captains Chairs with 180° Swivel and Leg Rests" },
    { label: "Acoustic Envelope", value: "Double-Glazed Soundproof Glass + Sound Dampening Wool" },
    { label: "Climate Control", value: "Independent Dual-Compressor Rear HVAC with HEPA Filtration" },
    { label: "Culinary Bar", value: "La Marzocco Espresso Station + Wine Chiller + Mini Oven" },
    { label: "Audio & Media", value: "Bowers & Wilkins 14-Speaker Dolby Atmos + 4K Retractable Projector" },
    { label: "Connectivity", value: "Starlink 5G Ultra-Low-Latency Wi-Fi Gateway" },
    { label: "Power Delivery", value: "Silent 4kWh Lithium Inverter (Zero Engine Idling Noise)" }
  ];

  const zones = [
    {
      title: "1. Privacy Cockpit Partition",
      desc: "An electrochromic smart glass bulkhead separates the chauffeur compartment from your private lounge, granting complete audiovisual isolation."
    },
    {
      title: "2. The Velvet Lounge Salon",
      desc: "Handcrafted Italian velvet and aniline leather captain chairs with motorized footrests, heating, shiatsu massage, and fold-out dark walnut tables."
    },
    {
      title: "3. The Barista & Sommelier Station",
      desc: "Craft hot espresso beverages, pour chilled champagne into crystal flutes, or enjoy artisan charcuterie boards prepared fresh onboard."
    },
    {
      title: "4. The Starlight Constellation Ceiling",
      desc: "Over 800 individual fibre-optic strands woven into the alcantara headliner, simulating the night sky with subtle shooting stars."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-16 pb-28">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C9A667] font-semibold">
          Architectural Tour
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#F7F3EC] font-bold mt-2 mb-4">
          The Van: Engineering Sanctuary
        </h1>
        <p className="text-sm text-[#e6e2db]/75 leading-relaxed font-sans">
          Discover how automotive engineering and luxury lounge architecture merge to create an uncompromised mobile retreat.
        </p>
      </section>

      {/* Hero 3D Floor Plan Cutaway */}
      <section className="velvet-texture bg-[#1c1c18] rounded-3xl border border-[#C9A667]/30 p-6 sm:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#C9A667]/30 bg-[#141310]">
            <img
              src="/assets/renders/a_clean_premium_3d_floor_plan_cutaway_of_a_luxury_van_interior._styled_in.png"
              alt="3D Floor Plan Cutaway"
              className="w-full h-auto object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#141310]/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#C9A667]/30 text-[10px] text-[#C9A667] uppercase tracking-wider font-semibold">
              Scale 1:1 Interior Layout
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#F7F3EC] font-bold">
              Zoned for Pure Comfort
            </h3>
            <div className="space-y-4">
              {zones.map((zone, idx) => (
                <div key={idx} className="p-4 bg-[#141310] rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-serif text-sm text-[#C9A667] font-semibold">
                    {zone.title}
                  </h4>
                  <p className="text-xs text-[#e6e2db]/70 leading-relaxed">
                    {zone.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Technical Specifications Table */}
      <section className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/20 p-8 sm:p-10">
        <h3 className="font-serif text-2xl text-[#F7F3EC] font-bold mb-6 text-center">
          Technical & Hospitality Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {specifications.map((spec, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#141310] rounded-xl border border-white/5 text-xs"
            >
              <span className="text-[#C9A667] font-semibold uppercase tracking-wider text-[11px] mb-1 sm:mb-0">
                {spec.label}
              </span>
              <span className="text-[#e6e2db]/90 font-medium sm:text-right">
                {spec.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/booking/destination')}
            className="gold-gradient text-[#1B1B1B] font-bold text-xs tracking-widest uppercase px-10 py-4 rounded-full soft-glow hover:scale-105 transition-all active:scale-95"
          >
            Experience This Van In Person
          </button>
        </div>
      </section>
    </div>
  );
}
