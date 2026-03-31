import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('member')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  signup: (name, email, password, phone) =>
    api.post('/auth/signup', { name, email, password, phone }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('member')
  }
}

export const sessionService = {
  getAll: () => api.get('/sessions'),
  getOne: (id) => api.get(`/sessions/${id}`)
}

export const bookingService = {
  create: (sessionId) =>
    api.post('/bookings', { session_id: sessionId }),
  getMyBookings: () => api.get('/bookings/my'),
  updateStatus: (bookingId, status) =>
    api.patch(`/bookings/${bookingId}/status`, { status }),
  getAttendees: (sessionId) =>
    api.get(`/bookings/session/${sessionId}/attendees`),
  getWaitlistPosition: (sessionId) =>
    api.get(`/bookings/session/${sessionId}/waitlist-position`)
}

export const adminService = {
  getSessions: () => api.get('/sessions'),
  createSession: (data) => api.post('/sessions', data),
  deleteSession: (id) => api.delete(`/sessions/${id}`),
  getSessionBookings: (sessionId) =>
    api.get(`/bookings/session/${sessionId}`),
  updateBookingStatus: (bookingId, status) =>
    api.patch(`/bookings/${bookingId}/admin-status`, { status }),
  getMembers: () => api.get('/members'),
  getMemberBookings: (memberId) =>
    api.get(`/members/${memberId}/bookings`),
  deleteMember: (memberId) =>
    api.delete(`/members/${memberId}`),
  getLocations: () => api.get('/locations')
}