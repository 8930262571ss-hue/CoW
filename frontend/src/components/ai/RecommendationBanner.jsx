import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useBooking } from '../../context/BookingContext';

export default function RecommendationBanner({ variant = "banner" }) {
  const navigate = useNavigate();
  const { setThemeId } = useBooking();
  const [recommendation, setRecommendation] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function fetchRec() {
      try {
        const data = await api.getRecommendation();
        setRecommendation(data);
      } catch (err) {
        console.warn('Could not fetch AI recommendation:', err);
      }
    }
    fetchRec();
  }, []);

  if (!recommendation || dismissed) return null;

  const handleApply = () => {
    setThemeId(recommendation.theme_slug);
    navigate(`/theme/${recommendation.theme_slug}`);
  };

  if (variant === "push") {
    return (
      <div className="bg-[#1B1B1B] rounded-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-[#2b2a26] relative overflow-hidden animate-fade-in max-w-sm">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A667]/40 to-transparent" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C9A667] text-base">local_cafe</span>
            <span className="font-sans text-[10px] tracking-widest text-[#e6e2db]/80 uppercase">Vantasy Sanctuary</span>
          </div>
          <button onClick={() => setDismissed(true)} className="text-[#e6e2db]/40 hover:text-white">
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>
        <h3 className="font-serif text-base text-[#e6e2db] font-bold mb-1">{recommendation.headline}</h3>
        <p className="text-xs text-[#e6e2db]/70 leading-relaxed mb-3">{recommendation.message}</p>
        <button
          onClick={handleApply}
          className="text-xs text-[#C9A667] hover:text-[#E6D2AA] font-semibold flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span>Explore {recommendation.theme_name}</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>
    );
  }

  // Default Home Banner variant
  return (
    <div className="w-full velvet-texture bg-[#20201c] rounded-xl border border-[#C9A667]/30 p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] animate-fade-in relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-grow">
          <div className="w-12 h-12 rounded-full bg-[#2b2a26] flex items-center justify-center border border-[#C9A667]/30 flex-shrink-0">
            <span className="material-symbols-outlined text-[#C9A667] text-2xl">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded bg-[#0E3B2E] text-[#9df1d6] font-semibold">
                {recommendation.badge_label}
              </span>
              <span className="text-xs text-[#e6e2db]/50">
                {recommendation.weather_condition} • {recommendation.temperature_c}°C
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#e6e2db] font-sans">
              {recommendation.message}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleApply}
            className="gold-gradient text-[#1B1B1B] font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-full soft-glow hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span>{recommendation.cta_label}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-[#e6e2db]/40 hover:text-white transition-colors"
            title="Dismiss suggestion"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
