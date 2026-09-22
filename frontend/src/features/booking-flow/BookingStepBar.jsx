import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const STEPS = [
  { num: 1, label: 'Destination', path: '/booking/destination' },
  { num: 2, label: 'Theme', path: '/booking/theme' },
  { num: 3, label: 'Customize', path: '/booking/customize' },
  { num: 4, label: 'Vehicle & Slot', path: '/booking/vehicle-time' },
  { num: 5, label: 'Review', path: '/booking/review' },
];

export default function BookingStepBar({ currentStep = 1 }) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-10 px-4">
      {/* Steps Row */}
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[1px] bg-white/10 z-0" />
        
        {STEPS.map((step) => {
          const isPassed = step.num < currentStep;
          const isCurrent = step.num === currentStep;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center">
              <Link
                to={step.num <= currentStep ? step.path : '#'}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCurrent
                    ? 'gold-gradient text-[#1B1B1B] shadow-gold-glow scale-110'
                    : isPassed
                    ? 'bg-[#0E3B2E] border border-[#9df1d6]/50 text-[#9df1d6]'
                    : 'bg-[#1c1c18] border border-white/20 text-[#e6e2db]/40 cursor-not-allowed'
                }`}
              >
                {isPassed ? (
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                ) : (
                  step.num
                )}
              </Link>
              <span
                className={`text-[10px] sm:text-xs mt-2 uppercase tracking-wider font-semibold ${
                  isCurrent
                    ? 'text-[#C9A667]'
                    : isPassed
                    ? 'text-[#e6e2db]/80'
                    : 'text-[#e6e2db]/30'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
