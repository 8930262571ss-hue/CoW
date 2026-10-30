import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getWsUrl } from '../../api/client';
import LiveMap from '../../components/tracking/LiveMap';

export default function LiveTrackingPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Load initial booking and tracking
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const [bData, tData] = await Promise.all([
          api.getBooking(bookingId),
          api.getRideTracking(bookingId),
        ]);
        setBooking(bData);
        setTrackingData(tData);
      } catch (err) {
        console.error('Failed to load tracking data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [bookingId]);

  // Connect customer WebSocket
  useEffect(() => {
    if (!bookingId) return;

    const wsUrl = getWsUrl(`/rides/ws/${bookingId}?client_type=customer`);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
      console.log('Customer WebSocket live tracking connected.');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'LOCATION_UPDATE' || message.type === 'SNAPSHOT') {
          setTrackingData(message.data);
        }
      } catch (err) {
        console.warn('WS message parse error:', err);
      }
    };

    socket.onclose = () => {
      setWsConnected(false);
      console.log('Customer WebSocket closed. Polling fallback active.');
    };

    // Fallback polling if WS disconnected
    const interval = setInterval(async () => {
      if (!wsConnected) {
        try {
          const latest = await api.getRideTracking(bookingId);
          setTrackingData(latest);
        } catch {}
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.close();
    };
  }, [bookingId, wsConnected]);

  if (loading || !booking) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#C9A667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const driverLoc = trackingData?.driver_location || booking.pickup_location;
  const progressPercent = trackingData?.progress_percent || 15;
  const etaMinutes = trackingData?.eta_minutes || booking.estimated_duration_min || 30;
  const remainingKm = trackingData?.remaining_distance_km || booking.estimated_distance_km || 10;
  const rideStatus = trackingData?.status || booking.status || 'in_progress';

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden pb-16">
      {/* Full-bleed Luxury Live Map */}
      <div className="w-full h-[520px] sm:h-[620px] relative">
        <LiveMap
          vanLocation={{
            lat: driverLoc.lat,
            lng: driverLoc.lng,
            heading: driverLoc.heading || 0,
            speed_kmh: driverLoc.speed_kmh || 32,
          }}
          pickupLocation={booking.pickup_location}
          destinationLocation={booking.destination}
          optionalStop={booking.optional_stop}
          vanName="Mercedes Sprinter • Velvet Lounge"
        />

        {/* Floating Top Nav / Overlays matching Stitch live tracking */}
        <div className="absolute top-6 left-4 right-4 z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-none">
          {/* Trip Info Overlay */}
          <div className="pointer-events-auto velvet-texture bg-[#1B1B1B]/90 backdrop-blur-md border border-[#C9A667]/40 rounded-2xl p-5 shadow-2xl max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-bold">
                {wsConnected ? '● Live GPS Tracking' : '○ GPS Reconnecting...'}
              </span>
              <span className="text-[10px] text-[#e6e2db]/60">Booking #{bookingId.slice(-6).toUpperCase()}</span>
            </div>

            <h2 className="font-serif text-xl text-[#F7F3EC] font-bold">
              En Route to {booking.destination?.address?.split(',')[0]}
            </h2>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[10px] uppercase text-[#e6e2db]/50 tracking-wider block">Estimated Arrival</span>
                <span className="font-sans text-xl font-bold text-[#C9A667]">{etaMinutes} mins</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#e6e2db]/50 tracking-wider block">Distance Remaining</span>
                <span className="font-sans text-xl font-bold text-[#F7F3EC]">{remainingKm} km</span>
              </div>
            </div>

            {/* Glowing Gold Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-[#e6e2db]/60">
                <span>Journey Progress</span>
                <span className="text-[#C9A667] font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#141310] rounded-full overflow-hidden">
                <div
                  className="h-full gold-gradient transition-all duration-700 rounded-full shadow-[0_0_10px_#C9A667]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chauffeur Card */}
          <div className="pointer-events-auto velvet-texture bg-[#1B1B1B]/90 backdrop-blur-md border border-[#C9A667]/40 rounded-full py-2 px-5 shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#C9A667]/50 bg-[#141310]">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                alt="Chauffeur"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#e6e2db]/50 block">Your Chauffeur</span>
              <h4 className="font-serif text-sm font-bold text-[#F7F3EC]">Rajesh K.</h4>
              <span className="text-[10px] text-[#9df1d6] font-medium">★ 4.98 Master Host</span>
            </div>
            <div className="flex space-x-2 pl-2 border-l border-white/10">
              <a
                href="tel:+919876543210"
                className="w-9 h-9 rounded-full bg-[#141310] border border-[#C9A667]/40 flex items-center justify-center text-[#C9A667] hover:bg-[#C9A667] hover:text-[#1B1B1B] transition-colors"
                title="Call Chauffeur"
              >
                <span className="material-symbols-outlined text-sm">call</span>
              </a>
              <Link
                to={`/driver/ride/${bookingId}`}
                target="_blank"
                className="w-9 h-9 rounded-full bg-[#6E1F2B] border border-[#ffb2b7]/40 flex items-center justify-center text-[#ffdadb] hover:bg-[#7f2c37] transition-colors"
                title="Open Driver GPS Simulator"
              >
                <span className="material-symbols-outlined text-sm">swap_driving_apps_wheel</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Dashboard Controls: Onboard Experience & Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Onboard Amenities Status */}
        <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
          <h3 className="font-serif text-lg text-[#F7F3EC] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C9A667]">tune</span>
            <span>Cabin Environment</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-[#141310] rounded-xl border border-white/5">
              <span>Cabin Temperature:</span>
              <span className="text-[#C9A667] font-bold">22°C (Optimal)</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-[#141310] rounded-xl border border-white/5">
              <span>Acoustic Mode:</span>
              <span className="text-[#F7F3EC] font-medium">{booking.theme_name} Soundstage</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-[#141310] rounded-xl border border-white/5">
              <span>Wi-Fi Network:</span>
              <span className="text-[#9df1d6] font-mono">Vantasy_5G_VIP</span>
            </div>
          </div>
        </div>

        {/* Selected Refreshments Onboard */}
        <div className="velvet-texture bg-[#1B1B1B] rounded-2xl border border-[#C9A667]/30 p-6 shadow-xl space-y-4">
          <h3 className="font-serif text-lg text-[#F7F3EC] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C9A667]">local_cafe</span>
            <span>Onboard Refreshments</span>
          </h3>
          <div className="space-y-2 text-xs max-h-36 overflow-y-auto pr-1">
            {booking.menu_items?.length === 0 ? (
              <p className="text-[#e6e2db]/50 italic">Complimentary espresso bar active</p>
            ) : (
              booking.menu_items?.map((item) => (
                <div key={item.item_id} className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-[#F7F3EC]">{item.quantity}x {item.name}</span>
                  <span className="text-[#9df1d6]">Plated & Ready</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Driver GPS Testing Shortcut Card */}
        <div className="velvet-texture bg-[#1c1c18] rounded-2xl border border-[#C9A667]/40 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-[#C9A667] mb-2">
              <span className="material-symbols-outlined">sensors</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Live Simulation Tool</span>
            </div>
            <h4 className="font-serif text-base font-bold text-[#F7F3EC] mb-1">
              Driver GPS Broadcaster
            </h4>
            <p className="text-xs text-[#e6e2db]/70 leading-relaxed mb-4">
              Open the driver transmitter in a second tab to broadcast simulated live GPS pings along the route and watch this screen animate in real-time.
            </p>
          </div>

          <Link
            to={`/driver/ride/${bookingId}`}
            target="_blank"
            className="w-full text-center gold-gradient text-[#1B1B1B] font-bold text-xs uppercase tracking-wider py-3 rounded-full soft-glow hover:opacity-90 transition-all block"
          >
            Launch Driver Simulator Tab ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
