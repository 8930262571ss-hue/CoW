import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const BookingContext = createContext(null);

const DEFAULT_PICKUP = {
  lat: 19.0596,
  lng: 72.8295,
  address: 'Bandra Bandstand, Bandra West, Mumbai'
};

const DEFAULT_DESTINATION = {
  lat: 18.9438,
  lng: 72.8232,
  address: 'Marine Drive Promenade, South Mumbai'
};

export function BookingProvider({ children }) {
  // Booking Draft State
  const [pickup, setPickup] = useState(DEFAULT_PICKUP);
  const [destination, setDestination] = useState(DEFAULT_DESTINATION);
  const [optionalStop, setOptionalStop] = useState(null);
  const [themeId, setThemeId] = useState('romantic-date');
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('19:00 - 21:00');
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);

  // Live Pricing Breakdown
  const [pricingBreakdown, setPricingBreakdown] = useState(null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState(null);

  // Recalculate pricing on draft changes
  const refreshPricing = useCallback(async () => {
    if (!themeId || !pickup || !destination) return;
    setIsPricingLoading(true);
    setPricingError(null);
    try {
      const payload = {
        theme_id: themeId,
        pickup: { lat: pickup.lat, lng: pickup.lng, address: pickup.address },
        destination: { lat: destination.lat, lng: destination.lng, address: destination.address },
        optional_stop: optionalStop ? { lat: optionalStop.lat, lng: optionalStop.lng, address: optionalStop.address } : null,
        selected_add_ons: selectedAddOns.map(a => ({
          name: a.name,
          price_inr: a.price_inr,
          config: a.config || {}
        })),
        menu_items: selectedMenuItems.map(m => ({
          item_id: m.item_id || m.id,
          quantity: m.quantity || 1
        })),
        promo_code: promoCode ? promoCode.trim() : null
      };
      const breakdown = await api.calculatePricing(payload);
      setPricingBreakdown(breakdown);
    } catch (err) {
      console.warn('Failed to calculate pricing:', err);
      setPricingError(err.message || 'Pricing calculation failed');
    } finally {
      setIsPricingLoading(false);
    }
  }, [themeId, pickup, destination, optionalStop, selectedAddOns, selectedMenuItems, promoCode]);

  useEffect(() => {
    refreshPricing();
  }, [refreshPricing]);

  // Add-on helpers
  const toggleAddOn = (addon) => {
    setSelectedAddOns(prev => {
      const exists = prev.some(a => a.name === addon.name);
      if (exists) {
        return prev.filter(a => a.name !== addon.name);
      } else {
        return [...prev, addon];
      }
    });
  };

  // Menu items helpers
  const updateMenuItemQuantity = (item, delta) => {
    setSelectedMenuItems(prev => {
      const itemId = item.id || item._id || item.item_id;
      const existing = prev.find(m => (m.id || m._id || m.item_id) === itemId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(m => (m.id || m._id || m.item_id) !== itemId);
        }
        return prev.map(m => (m.id || m._id || m.item_id) === itemId ? { ...m, quantity: newQty } : m);
      } else if (delta > 0) {
        return [...prev, { ...item, item_id: itemId, quantity: 1 }];
      }
      return prev;
    });
  };

  const clearBooking = () => {
    setPickup(DEFAULT_PICKUP);
    setDestination(DEFAULT_DESTINATION);
    setOptionalStop(null);
    setSelectedAddOns([]);
    setSelectedMenuItems([]);
    setPromoCode('');
    setAppliedOffer(null);
  };

  const value = {
    pickup, setPickup,
    destination, setDestination,
    optionalStop, setOptionalStop,
    themeId, setThemeId,
    selectedTheme, setSelectedTheme,
    selectedAddOns, setSelectedAddOns, toggleAddOn,
    selectedMenuItems, setSelectedMenuItems, updateMenuItemQuantity,
    selectedVehicleId, setSelectedVehicleId,
    scheduledDate, setScheduledDate,
    scheduledTimeSlot, setScheduledTimeSlot,
    guestCount, setGuestCount,
    specialRequests, setSpecialRequests,
    promoCode, setPromoCode,
    appliedOffer, setAppliedOffer,
    pricingBreakdown,
    isPricingLoading,
    pricingError,
    refreshPricing,
    clearBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  return useContext(BookingContext);
}
