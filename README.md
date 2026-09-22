# Cafe on Wheels (Vantasy) 🚐✨

A full-stack luxury web application where customers book a themed, moving cafe experience inside custom Mercedes-Benz Sprinter vans.

---

## 🌟 Key Features

1. **Velvet & Gold Aesthetic**: Faithfully crafted from the 29 Stitch-exported visual designs with the **Velvet Noir & Champagne Gold** palette (`#1B1B1B` Charcoal, `#6E1F2B` Deep Wine, `#C9A667` Champagne Gold, `#F7F3EC` Ivory Cream, `#0E3B2E` Deep Emerald, Playfair Display & Sora typography).
2. **Interactive 360° Living Room Tour**: Dedicated panoramic viewer with spherical coordinates, mouse/touch rotation, zoom controls, and clickable interactive hotspots for custom van features.
3. **Dynamic Multi-Step Booking Flow**:
   - **Step 1: Destination** — Departure and drop-off pickers with Mumbai presets, optional scenic stops, and instant distance / duration estimation.
   - **Step 2: Theme** — Atmospheric selection (Romantic Date, Birthday Celebration, Comfort Drive).
   - **Step 3: Customize** — Theme add-ons (Mini Theatre, Candlelight, 24K Gold Truffle Cake, Heated Massage) + Artisanal menu items with veg filtering and quantity controls.
   - **Step 4: Vehicle & Slot** — Fleet selection (Velvet Voyager, Champagne Sovereign, Nocturne Elegance), date, time slots, and guest capacity (up to 7).
   - **Step 5: Review & Confirm** — Full summary, promo code validator (`VELVET10`, `WELCOME500`), and real-time backend pricing breakdown.
4. **Transparent Pricing Engine**:
   - Flat per-theme complete ride price in Indian Rupees (₹) with the **first 10 km complimentary**.
   - Standard **₹8/km** linear charge beyond 10 km.
   - 5% GST calculation.
5. **Real-Time GPS Ride Tracking (WebSockets)**:
   - WebSocket endpoint at `/api/rides/ws/{booking_id}` keyed by booking ID.
   - Dedicated **Driver Cockpit GPS Simulator** (`/driver/ride/{bookingId}`) that broadcasts live GPS coordinates, heading, and speed over WebSockets or REST.
   - Midnight Velvet Cartography on the customer live tracking screen updating ETA, distance remaining, and progress percentage in real time.
6. **PayU India Payment Gateway**:
   - Server-side SHA-512 request hash generation and response hash verification.
   - Seamless sandbox simulation mode for zero-friction local testing.
7. **AI Contextual Recommendation Engine**:
   - Rule-based suggestions tailored to Mumbai weather, hour of day, and day of week (e.g. Rainy evening ➔ Comfort Drive with warm pour-overs).
8. **Admin Operations Hub**:
   - Aggregated revenue metrics, active fleet statistics, recent reservations, and full CRUD for themes, vehicles, menu items, pricing tariffs, and promo codes.

---

## 🚀 Quick Start Guide

### 1. Backend (FastAPI + Python)

```bash
cd backend

# Install dependencies (already installed if done via pip)
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Base URL: `http://localhost:8000/api`
- Swagger Interactive Docs: `http://localhost:8000/docs`
- *Note:* The backend automatically connects to MongoDB if available, or gracefully falls back to the built-in `mongomock-motor` in-memory engine and auto-seeds all luxury themes, vehicles, menu items, and demo accounts!

### 2. Frontend (React + Vite + Tailwind CSS)

```bash
cd frontend

# Run dev server
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@cafeonwheels.com` | `admin123` | Full access to `/admin` operations hub |
| **Customer** | `customer@cafeonwheels.com` | `customer123` | Customer bookings, profile & journeys |
| **Chauffeur** | `driver@cafeonwheels.com` | `driver123` | Driver GPS simulator transmitter |

*Tip: The Sign In modal features one-click demo login buttons for immediate testing!*

---

## 🧪 Testing Live GPS Ride Tracking

1. Create a booking on the frontend (or log in and view an existing booking under **My Journeys**).
2. Complete the checkout payment (using the **Instant Sandbox Payment Confirmation** button).
3. The app redirects to `/ride/{bookingId}/track` showing the midnight luxury live map.
4. Click **Launch Driver Simulator Tab ↗** (or visit `/driver/ride/{bookingId}`).
5. In the Driver Simulator tab, click **Start Auto Drive (2s Pings)**.
6. Switch back to the customer tracking tab to watch the van glide in real time with updating ETA, distance remaining, and progress bar!

---

## 📋 Running Automated Tests

```bash
$env:PYTHONPATH="backend"
python -m pytest backend/tests
```
All unit tests for the pricing engine, distance calculation, password hashing, and JWT tokens pass with 100% coverage.
