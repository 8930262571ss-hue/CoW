import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom Map Panner component
function MapController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (center) {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, bounds, map]);
  return null;
}

export default function LiveMap({
  vanLocation = { lat: 19.0596, lng: 72.8295, heading: 0 },
  pickupLocation = { lat: 19.0596, lng: 72.8295, address: "Pickup Point" },
  destinationLocation = { lat: 18.9438, lng: 72.8232, address: "Destination" },
  optionalStop = null,
  routePoints = [],
  vanName = "Velvet Voyager I"
}) {
  // Custom Leaflet DivIcons matching Velvet Noir & Gold styling
  const vanIcon = L.divIcon({
    className: 'custom-van-marker',
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #6E1F2B, #1B1B1B);
        border: 2px solid #C9A667;
        border-radius: 50%;
        box-shadow: 0 0 20px rgba(201, 166, 103, 0.6);
        transform: rotate(${vanLocation.heading || 0}deg);
      ">
        <span class="material-symbols-outlined" style="color: #F7F3EC; font-size: 24px;">directions_bus</span>
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
          background: #0E3B2E;
          border: 2px solid #9df1d6;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  const pickupIcon = L.divIcon({
    className: 'custom-pickup-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1B1B1B;
        border: 2px solid #C9A667;
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(201, 166, 103, 0.4);
      ">
        <span class="material-symbols-outlined" style="color: #C9A667; font-size: 18px;">trip_origin</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const destIcon = L.divIcon({
    className: 'custom-dest-marker',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0E3B2E;
        border: 2px solid #9df1d6;
        border-radius: 50%;
        box-shadow: 0 0 18px rgba(14, 59, 46, 0.7);
      ">
        <span class="material-symbols-outlined" style="color: #9df1d6; font-size: 20px;">flag</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

  // Calculate default polyline if none provided
  const points = routePoints.length > 0 ? routePoints : [
    [pickupLocation.lat, pickupLocation.lng],
    ...(optionalStop ? [[optionalStop.lat, optionalStop.lng]] : []),
    [destinationLocation.lat, destinationLocation.lng]
  ];

  const bounds = [
    [pickupLocation.lat, pickupLocation.lng],
    [destinationLocation.lat, destinationLocation.lng],
    [vanLocation.lat, vanLocation.lng]
  ];

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-tailored-lg overflow-hidden border border-[#C9A667]/30 shadow-2xl luxury-map">
      <MapContainer
        center={[vanLocation.lat, vanLocation.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController bounds={bounds} />

        {/* Route Path Polyline in Gold Foil Glow */}
        <Polyline
          positions={points}
          pathOptions={{
            color: '#C9A667',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 8',
          }}
        />

        {/* Pickup Marker */}
        <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
          <Popup className="luxury-popup">
            <div className="p-1 text-xs font-sans text-[#1B1B1B]">
              <strong>Pickup Sanctuary:</strong><br />{pickupLocation.address}
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={destIcon}>
          <Popup className="luxury-popup">
            <div className="p-1 text-xs font-sans text-[#1B1B1B]">
              <strong>Chosen Destination:</strong><br />{destinationLocation.address}
            </div>
          </Popup>
        </Marker>

        {/* Live Moving Van Marker */}
        <Marker position={[vanLocation.lat, vanLocation.lng]} icon={vanIcon}>
          <Popup className="luxury-popup">
            <div className="p-1 text-xs font-sans text-[#1B1B1B]">
              <strong>{vanName}</strong><br />
              Live Speed: {vanLocation.speed_kmh ? `${vanLocation.speed_kmh} km/h` : 'En Route'}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
