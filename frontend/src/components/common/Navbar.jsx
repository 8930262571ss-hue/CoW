import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isDriver, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#141310]/90 backdrop-blur-md border-b border-[#C9A667]/20 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="flex justify-between items-center px-4 sm:px-8 h-20 max-w-7xl mx-auto w-full">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <span className="material-symbols-outlined text-[#C9A667] text-3xl group-hover:scale-110 transition-transform">
              directions_bus
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-widest uppercase text-[#C9A667] font-bold">
                Vantasy
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#e6e2db]/60 -mt-1 font-sans">
                Cafe on Wheels
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/van"
              className={`text-sm tracking-widest uppercase transition-all duration-300 pb-1 ${
                isActive('/van')
                  ? 'text-[#C9A667] border-b border-[#C9A667] font-semibold'
                  : 'text-[#e6e2db]/75 hover:text-[#C9A667]'
              }`}
            >
              The Van
            </Link>
            <Link
              to="/explore"
              className={`text-sm tracking-widest uppercase transition-all duration-300 pb-1 ${
                isActive('/explore')
                  ? 'text-[#C9A667] border-b border-[#C9A667] font-semibold'
                  : 'text-[#e6e2db]/75 hover:text-[#C9A667]'
              }`}
            >
              Themes
            </Link>
            <Link
              to="/journeys"
              className={`text-sm tracking-widest uppercase transition-all duration-300 pb-1 ${
                isActive('/journeys')
                  ? 'text-[#C9A667] border-b border-[#C9A667] font-semibold'
                  : 'text-[#e6e2db]/75 hover:text-[#C9A667]'
              }`}
            >
              My Journeys
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs bg-[#6E1F2B] text-[#ffdadb] px-3 py-1 rounded-full border border-[#ffb2b7]/30 tracking-wider uppercase font-medium hover:bg-[#7f2c37]"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-5">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm text-[#e6e2db]/80 hover:text-[#C9A667] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#C9A667]">account_circle</span>
                  <span className="font-medium max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-[#e6e2db]/50 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenAuth('login')}
                className="text-xs tracking-widest uppercase text-[#C9A667] hover:text-[#E6D2AA] font-semibold transition-colors"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => navigate('/booking/destination')}
              className="gold-gradient text-[#1B1B1B] font-semibold text-xs tracking-widest uppercase px-6 py-2.5 rounded-full soft-glow hover:opacity-90 transition-all active:scale-95 shadow-md"
            >
              Book Sanctuary
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => navigate('/booking/destination')}
              className="gold-gradient text-[#1B1B1B] text-xs font-bold px-4 py-1.5 rounded-full"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#C9A667] p-2"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1B1B1B] border-b border-[#C9A667]/30 px-6 py-5 space-y-4">
            <Link
              to="/van"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#e6e2db]/80 hover:text-[#C9A667]"
            >
              The Van
            </Link>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#e6e2db]/80 hover:text-[#C9A667]"
            >
              Themes
            </Link>
            <Link
              to="/journeys"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#e6e2db]/80 hover:text-[#C9A667]"
            >
              My Journeys
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-[#ffb2b7]"
              >
                Admin Panel
              </Link>
            )}
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              {isAuthenticated ? (
                <div className="flex items-center justify-between w-full">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm text-[#C9A667]"
                  >
                    Profile: {user.name}
                  </Link>
                  <button onClick={logout} className="text-xs text-red-400">
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenAuth('login');
                  }}
                  className="text-sm text-[#C9A667] font-semibold"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(newMode) => setAuthMode(newMode)}
        />
      )}
    </>
  );
}
