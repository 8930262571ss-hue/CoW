const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export function getWsUrl(endpoint) {
  const isRelative = !BASE_URL.startsWith('http://') && !BASE_URL.startsWith('https://');
  const wsProto = (isRelative ? (typeof window !== 'undefined' && window.location.protocol === 'https:') : BASE_URL.startsWith('https')) ? 'wss:' : 'ws:';
  const host = isRelative 
    ? (typeof window !== 'undefined' ? window.location.host : 'localhost:8000')
    : BASE_URL.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${wsProto}//${host}/api${cleanEndpoint}`;
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('cow_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new Error(errorData.detail || 'Network request failed');
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  updatePreferences: (prefs) => request('/auth/preferences', { method: 'PATCH', body: JSON.stringify(prefs) }),
  toggleSavedTheme: (themeId) => request(`/auth/saved-themes/${themeId}`, { method: 'POST' }),

  // Themes
  getThemes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/themes${qs ? `?${qs}` : ''}`);
  },
  getTheme: (id) => request(`/themes/${id}`),
  createTheme: (data) => request('/themes', { method: 'POST', body: JSON.stringify(data) }),
  updateTheme: (id, data) => request(`/themes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTheme: (id) => request(`/themes/${id}`, { method: 'DELETE' }),

  // Vehicles
  getVehicles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/vehicles${qs ? `?${qs}` : ''}`);
  },
  getVehicle: (id) => request(`/vehicles/${id}`),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Menu
  getMenuCategories: () => request('/menu/categories'),
  getMenuItems: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/menu${qs ? `?${qs}` : ''}`);
  },
  createMenuItem: (data) => request('/menu', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id, data) => request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMenuItem: (id) => request(`/menu/${id}`, { method: 'DELETE' }),

  // Pricing
  calculatePricing: (data) => request('/pricing/calculate', { method: 'POST', body: JSON.stringify(data) }),

  // Bookings
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBookings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/bookings${qs ? `?${qs}` : ''}`);
  },
  getBooking: (id) => request(`/bookings/${id}`),
  updateBookingStatus: (id, data) => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'POST' }),

  // Payments
  initiatePayment: (bookingId) => request('/payments/payu/initiate', { method: 'POST', body: JSON.stringify({ booking_id: bookingId }) }),
  simulatePaymentSuccess: (bookingId) => request(`/payments/simulate-success/${bookingId}`, { method: 'POST' }),

  // Rides & Tracking
  getRideTracking: (bookingId) => request(`/rides/tracking/${bookingId}`),
  pushDriverLocation: (bookingId, location) => request(`/rides/driver/ping/${bookingId}`, { method: 'POST', body: JSON.stringify(location) }),

  // Offers
  getOffers: () => request('/offers'),
  validateOffer: (code, amount) => request(`/offers/validate?code=${encodeURIComponent(code)}&amount=${amount}`, { method: 'POST' }),
  createOffer: (data) => request('/offers', { method: 'POST', body: JSON.stringify(data) }),
  deleteOffer: (id) => request(`/offers/${id}`, { method: 'DELETE' }),

  // AI Recommendations
  getRecommendation: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/recommendations${qs ? `?${qs}` : ''}`);
  },

  // Admin Dashboard
  getAdminStats: () => request('/admin/dashboard-stats'),
};
