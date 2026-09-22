import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';

export default function DriverSimulatorPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentLat, setCurrentLat] = useState(19.0596);
  const [currentLng, setCurrentLng] = useState(72.8295);
  const [speed, setSpeed] = useState(35);
  const [logs, setLogs] = useState([]);
  const socketRef = useRef(null);

  // Load booking
  useEffect(() => {
    async function load() {
      try {
        const b = await api.getBooking(bookingId);
        setBooking(b);
        setCurrentLat(b.pickup_location.lat);
        setCurrentLng(b.pickup_location.lng);
        addLog(`Loaded booking #${bookingId.slice(-6)}. Route: ${b.pickup_location.address} -> ${b.destination.address}`);
      } catch (err) {
        addLog(`Failed to load booking: ${err.message}`);
      }
    }
    load();
  }, [bookingId]);

  // Connect Driver WebSocket
  useEffect(() => {
    if (!bookingId) return;

    const wsUrl = `ws://localhost:8000/api/rides/ws/${bookingId}?client_type=driver`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      addLog('WebSocket connected as DRIVER. Ready to broadcast pings.');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'DRIVER_ACK') {
          addLog(`Server ACK: ${data.message}`);
        }
      } catch {}
    };

    socket.onclose = () => {
      setIsConnected(false);
      addLog('Driver WebSocket closed.');
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [bookingId]);

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 30)]);
  };

  const sendGpsUpdate = (lat, lng, spd = 35) => {
    const payload = {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      heading: 180,
      speed_kmh: spd,
      timestamp: new Date().toISOString(),
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      addLog(`📡 Broadcasted GPS: (${payload.lat}, ${payload.lng}) at ${spd} km/h`);
    } else {
      // Fallback to REST
      api.pushDriverLocation(bookingId, payload).then(() => {
        addLog(`REST Ping: (${payload.lat}, ${payload.lng}) at ${spd} km/h`);
      });
    }
  };

  // Interpolate along route based on progress percentage
  const calculateCoordinatesForProgress = (pct) => {
    if (!booking) return { lat: currentLat, lng: currentLng };
    const pLat = booking.pickup_location.lat;
    const pLng = booking.pickup_location.lng;
    const dLat = booking.destination.lat;
    const dLng = booking.destination.lng;

    const lat = pLat + (dLat - pLat) * (pct / 100);
    const lng = pLng + (dLng - pLng) * (pct / 100);
    return { lat, lng };
  };

  // Auto drive timer
  useEffect(() => {
    if (!isDriving || !booking) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + 5);
        const { lat, lng } = calculateCoordinatesForProgress(next);
        setCurrentLat(lat);
        setCurrentLng(lng);
        sendGpsUpdate(lat, lng, Math.floor(30 + Math.random() * 15));

        if (next >= 100) {
          setIsDriving(false);
          addLog('🏁 Arrived at Destination!');
          api.updateBookingStatus(bookingId, { status: 'completed' });
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isDriving, booking]);

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    const { lat, lng } = calculateCoordinatesForProgress(val);
    setCurrentLat(lat);
    setCurrentLng(lng);
    sendGpsUpdate(lat, lng, speed);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="velvet-texture bg-[#1c1c18] rounded-2xl border border-[#C9A667]/40 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <span className="material-symbols-outlined text-[#C9A667] text-3xl">swap_driving_apps_wheel</span>
            <div>
              <h1 className="font-serif text-xl font-bold text-[#F7F3EC]">
                Chauffeur Driver Cockpit Simulator
              </h1>
              <p className="text-xs text-[#e6e2db]/60">
                Pushes periodic GPS coordinates over WebSocket to live customer tracking screens.
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
              isConnected
                ? 'bg-[#0E3B2E] text-[#9df1d6] border border-[#9df1d6]/30'
                : 'bg-[#6E1F2B] text-[#ffdadb] border border-[#ffb2b7]/30'
            }`}
          >
            {isConnected ? 'WebSocket Online' : 'Connecting...'}
          </span>
        </div>

        {/* Route Details */}
        {booking && (
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#141310] p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] text-[#e6e2db]/50 uppercase block">Pickup Point:</span>
              <span className="text-[#F7F3EC] font-semibold">{booking.pickup_location.address}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#e6e2db]/50 uppercase block">Destination:</span>
              <span className="text-[#9df1d6] font-semibold">{booking.destination.address}</span>
            </div>
          </div>
        )}

        {/* Simulator Controls */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setIsDriving(!isDriving)}
              className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 ${
                isDriving
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30'
                  : 'gold-gradient text-[#1B1B1B] shadow-gold-glow hover:opacity-90'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isDriving ? 'pause' : 'play_arrow'}
              </span>
              <span>{isDriving ? 'Pause Auto Drive' : 'Start Auto Drive (2s Pings)'}</span>
            </button>

            <button
              onClick={() => {
                setProgress(100);
                const { lat, lng } = calculateCoordinatesForProgress(100);
                setCurrentLat(lat);
                setCurrentLng(lng);
                sendGpsUpdate(lat, lng, 0);
                api.updateBookingStatus(bookingId, { status: 'completed' });
                addLog('Marked Arrived & Completed.');
              }}
              className="px-5 py-3 rounded-full text-xs font-semibold bg-[#0E3B2E] text-[#9df1d6] border border-[#9df1d6]/30 hover:bg-[#0E3B2E]/80 transition-colors"
            >
              Arrive at Destination
            </button>

            <button
              onClick={() => {
                setProgress(0);
                const { lat, lng } = calculateCoordinatesForProgress(0);
                setCurrentLat(lat);
                setCurrentLng(lng);
                sendGpsUpdate(lat, lng, 0);
                addLog('Reset back to Pickup.');
              }}
              className="px-4 py-3 rounded-full text-xs text-[#e6e2db]/70 border border-white/10 hover:border-white/30"
            >
              Reset to Start
            </button>
          </div>

          {/* Scrubbing Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-[#e6e2db]/70">
              <span>Manual Route Scrubbing:</span>
              <span className="text-[#C9A667] font-bold">{progress}% Complete</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSliderChange}
              className="w-full accent-[#C9A667] cursor-pointer"
            />
          </div>

          <div className="p-3 bg-[#141310] rounded-xl text-xs font-mono text-[#e6e2db]/80 flex justify-between">
            <span>Lat: {currentLat.toFixed(5)}</span>
            <span>Lng: {currentLng.toFixed(5)}</span>
            <span>Speed: {speed} km/h</span>
          </div>
        </div>

        {/* Activity Log Terminal */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] uppercase tracking-widest text-[#C9A667] font-semibold block">
            Transmission Broadcast Log
          </span>
          <div className="bg-[#141310] rounded-xl p-3 h-40 overflow-y-auto font-mono text-[11px] text-[#e6e2db]/70 space-y-1 border border-white/5">
            {logs.map((log, i) => (
              <div key={i} className="leading-snug">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
