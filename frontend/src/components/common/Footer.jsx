import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0f0e0b] border-t border-[#C9A667]/20 pt-16 pb-12 text-[#e6e2db]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[#C9A667] text-2xl">directions_bus</span>
              <span className="font-serif text-2xl tracking-widest uppercase text-[#C9A667] font-bold">Vantasy</span>
            </div>
            <p className="text-xs text-[#e6e2db]/60 leading-relaxed">
              A private moving sanctuary designed for intimate indulgence, romantic evenings, and bespoke luxury across India.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <span className="text-xs tracking-widest uppercase px-2.5 py-1 rounded bg-[#0E3B2E] text-[#9df1d6] font-semibold">
                Mumbai • Delhi • Goa
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-[#C9A667] font-semibold">Curated Experiences</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/theme/romantic-date" className="hover:text-[#C9A667] transition-colors">Romantic Date & Candlelight</Link></li>
              <li><Link to="/theme/birthday-celebration" className="hover:text-[#C9A667] transition-colors">Birthday Celebration Lounge</Link></li>
              <li><Link to="/theme/comfort-drive" className="hover:text-[#C9A667] transition-colors">Comfort Drive & Acoustic Relax</Link></li>
              <li><Link to="/van" className="hover:text-[#C9A667] transition-colors">The Mercedes Sprinter Fleet</Link></li>
            </ul>
          </div>

          {/* Policy & Rates */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-[#C9A667] font-semibold">Transparent Pricing</h4>
            <p className="text-xs text-[#e6e2db]/60 leading-relaxed">
              All sanctuary experiences include first 10 km complimentary. Excess mileage charged transparently at ₹8/km. 5% GST applicable.
            </p>
            <div className="text-xs text-[#C9A667] font-medium">
              PayU Secure 256-bit Encrypted Checkout
            </div>
          </div>

          {/* Concierge Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif uppercase tracking-widest text-[#C9A667] font-semibold">Private Concierge</h4>
            <p className="text-xs text-[#e6e2db]/60">
              Need custom arrangements or private city charter?
            </p>
            <p className="text-sm font-semibold text-[#F7F3EC]">+91 98200 11223</p>
            <p className="text-xs text-[#C9A667]">concierge@cafeonwheels.com</p>
          </div>
        </div>

        {/* Divider with central diamond */}
        <div className="relative flex items-center justify-center py-6">
          <div className="h-[1px] w-full bg-[#C9A667]/20"></div>
          <div className="absolute px-4 bg-[#0f0e0b] text-[#C9A667]/50 text-xs">◆</div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#e6e2db]/40 space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} Cafe on Wheels (Vantasy). All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-[#C9A667] cursor-pointer">Privacy Charter</span>
            <span className="hover:text-[#C9A667] cursor-pointer">Terms of Carriage</span>
            <span className="hover:text-[#C9A667] cursor-pointer">Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
