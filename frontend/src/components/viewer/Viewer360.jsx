import React, { useState, useRef, useEffect } from 'react';

export default function Viewer360({
  imageUrl,
  hotspots = [],
  title = "Van Interior 360° Panoramic View",
  accentColor = "#C9A667"
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [yaw, setYaw] = useState(0);       // Horizontal rotation in degrees
  const [pitch, setPitch] = useState(0);   // Vertical rotation in degrees
  const [zoom, setZoom] = useState(1);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || isDragging) return;
    const interval = setInterval(() => {
      setYaw((prev) => (prev + 0.15) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoRotating, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    setYaw((prev) => (prev - deltaX * 0.25 + 360) % 360);
    setPitch((prev) => Math.max(-45, Math.min(45, prev + deltaY * 0.2)));
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.8, Math.min(2.0, prev - e.deltaY * 0.001)));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Convert hotspot spherical angles (pitch, yaw) to 2D screen percentage given current viewer angles
  const getHotspotScreenPosition = (hsPitch, hsYaw) => {
    // Relative yaw normalized to [-180, 180]
    let diffYaw = ((hsYaw - yaw + 540) % 360) - 180;
    let diffPitch = hsPitch - pitch;

    // Field of view ~ 100 degrees
    const fovX = 110 / zoom;
    const fovY = 70 / zoom;

    const isVisible = Math.abs(diffYaw) < fovX / 2 && Math.abs(diffPitch) < fovY / 2;

    const xPercent = 50 + (diffYaw / (fovX / 2)) * 45;
    const yPercent = 50 - (diffPitch / (fovY / 2)) * 40;

    return { isVisible, xPercent, yPercent };
  };

  // Default image fallback
  const displayImage = imageUrl || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80";

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-tailored-lg bg-[#0f0e0b] border border-[#C9A667]/30 shadow-2xl select-none cursor-grab active:cursor-grabbing ${
        isFullscreen ? 'h-screen' : 'h-[440px] sm:h-[500px]'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Panoramic 360 Background with CSS Projection */}
      <div
        className="absolute inset-0 w-[400%] h-full transition-transform duration-75 ease-out"
        style={{
          backgroundImage: `url(${displayImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateX(-${(yaw / 360) * 50}%) translateY(${pitch * 1.5}px) scale(${zoom})`,
          filter: 'brightness(0.9) contrast(1.05)',
        }}
      />

      {/* Ambient Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#141310]/80 via-transparent to-[#141310]/40" />

      {/* Interactive Hotspots */}
      {hotspots.map((hs) => {
        const { isVisible, xPercent, yPercent } = getHotspotScreenPosition(hs.pitch, hs.yaw);
        if (!isVisible) return null;

        const isHovered = activeHotspot?.id === hs.id;

        return (
          <div
            key={hs.id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-150"
            style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(isHovered ? null : hs);
            }}
          >
            {/* Pulsing Hotspot Icon */}
            <div className="relative group">
              <span className="absolute -inset-2 rounded-full animate-ping opacity-75 bg-[#C9A667]" />
              <div
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#1B1B1B] font-bold shadow-lg transition-transform hover:scale-125 border-2 border-white/80"
                style={{ backgroundColor: accentColor }}
              >
                <span className="material-symbols-outlined text-sm">info</span>
              </div>

              {/* Tooltip / Card */}
              {(isHovered || activeHotspot?.id === hs.id) && (
                <div
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 bg-[#1B1B1B]/95 backdrop-blur-md border border-[#C9A667]/50 rounded-lg p-3 text-left shadow-2xl z-30 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] tracking-wider uppercase text-[#C9A667] font-bold">
                      Interactive Feature
                    </span>
                    <button
                      onClick={() => setActiveHotspot(null)}
                      className="text-[#e6e2db]/50 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-[#F7F3EC] mb-1">
                    {hs.title}
                  </h4>
                  <p className="text-xs text-[#e6e2db]/80 leading-relaxed font-sans">
                    {hs.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Top Controls & Badge */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="pointer-events-auto bg-[#141310]/80 backdrop-blur-md border border-[#C9A667]/30 px-3.5 py-1.5 rounded-full flex items-center space-x-2">
          <span className="material-symbols-outlined text-[#C9A667] text-sm animate-spin-slow">
            360
          </span>
          <span className="text-xs text-[#F7F3EC] font-serif tracking-wider font-semibold">
            {title}
          </span>
        </div>

        {/* Hotspot Count Badge */}
        <div className="pointer-events-auto bg-[#0E3B2E]/90 border border-[#9df1d6]/30 px-3 py-1 rounded-full text-[11px] text-[#9df1d6] font-sans">
          {hotspots.length} Touchpoints Active
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 bg-[#1B1B1B]/90 backdrop-blur-md border border-[#C9A667]/40 px-4 py-2 rounded-full shadow-2xl">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
          className="p-1.5 text-[#e6e2db]/80 hover:text-[#C9A667] transition-colors"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-base">zoom_in</span>
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
          className="p-1.5 text-[#e6e2db]/80 hover:text-[#C9A667] transition-colors"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-base">zoom_out</span>
        </button>
        <div className="h-4 w-[1px] bg-white/20" />
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`p-1.5 transition-colors ${
            isAutoRotating ? 'text-[#C9A667]' : 'text-[#e6e2db]/50 hover:text-white'
          }`}
          title={isAutoRotating ? 'Pause Auto Tour' : 'Start Auto Tour'}
        >
          <span className="material-symbols-outlined text-base">
            {isAutoRotating ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <button
          onClick={() => {
            setYaw(0);
            setPitch(0);
            setZoom(1);
          }}
          className="p-1.5 text-[#e6e2db]/80 hover:text-[#C9A667] transition-colors"
          title="Reset View"
        >
          <span className="material-symbols-outlined text-base">restart_alt</span>
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-[#e6e2db]/80 hover:text-[#C9A667] transition-colors"
          title="Fullscreen"
        >
          <span className="material-symbols-outlined text-base">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
      </div>

      {/* Drag Instruction Cue */}
      <div className="absolute bottom-4 right-4 hidden sm:flex items-center space-x-1.5 text-[10px] text-[#e6e2db]/50 pointer-events-none bg-black/40 px-2.5 py-1 rounded-full">
        <span className="material-symbols-outlined text-xs">pan_tool</span>
        <span>Drag to rotate 360°</span>
      </div>
    </div>
  );
}
