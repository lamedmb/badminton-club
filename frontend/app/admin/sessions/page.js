'use client'
import { useEffect, useState } from 'react'
import Navbar from '../../../components/Navbar'
import AdminGuard from '../../../components/AdminGuard'
import { adminService } from '../../../services/api'

const statusColours = {
  confirmed: 'bg-green-100 text-green-700',
  tbc: 'bg-yellow-100 text-yellow-700',
  waitlisted: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [locations, setLocations] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessionBookings, setSessionBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [message, setMessage] = useState('')

  const emptyForm = {
    location_id: '',
    date: '',
    start_time: '',
    end_time: '',
    courts_booked: 2,
    capacity_per_court: 4,
    cost: 0,
    notes: ''
  }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    Promise.all([
      adminService.getSessions(),
      adminService.getLocations()
    ]).then(([sRes, lRes]) => {
      setSessions(sRes.data)
      setLocations(lRes.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelectSession = (session) => {
    setSelectedSession(session)
    setBookingsLoading(true)
    adminService.getSessionBookings(session.id)
      .then(res => setSessionBookings(res.data))
      .catch(console.error)
      .finally(() => setBookingsLoading(false))
  }

  const handleCreate = async () => {
    setCreating(true)
    setMessage('')
    try {
      const res = await adminService.createSession(form)
      setSessions(prev => [...prev, res.data])
      setForm(emptyForm)
      setShowCreateForm(false)
      setMessage('Session created successfully')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (sessionId) => {
    if (!confirm('Delete this session? This cannot be undone.')) return
    setDeleting(sessionId)
    try {
      await adminService.deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (selectedSession?.id === sessionId) setSelectedSession(null)
      setMessage('Session deleted')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to delete session')
    } finally {
      setDeleting(null)
    }
  }

  const handleStatusChange = async (bookingId, status) => {
    try {
      await adminService.updateBookingStatus(bookingId, status)
      setSessionBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status } : b
      ))
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Sessions</h1>
              <p className="text-gray-500 text-sm mt-1">Create and manage badminton sessions</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-700"
            >
              {showCreateForm ? 'Cancel' : '+ New session'}
            </button>
          </div>

          {message && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
              {message}
            </div>
          )}

          {showCreateForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h2 className="font-semibold text-gray-900 mb-4">Create new session</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
                  <select
                    value={form.location_id}
                    onChange={e => setForm({ ...form, location_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select location</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Start time</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">End time</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Courts booked</label>
                  <input
                    type="number"
                    value={form.courts_booked}
                    onChange={e => setForm({ ...form, courts_booked: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Players per court</label>
                  <input
                    type="number"
                    value={form.capacity_per_court}
                    onChange={e => setForm({ ...form, capacity_per_court: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Cost per person (£)</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    min="0"
                    step="0.50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. Bring your own racket"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="bg-green-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create session'}
                </button>
                <p className="text-xs text-gray-400">
                  Max capacity: {form.courts_booked * form.capacity_per_court} players
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">All upcoming sessions</h2>
              {loading ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : sessions.length === 0 ? (
                <p className="text-gray-400 text-sm">No sessions yet.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                        selectedSession?.id === session.id
                          ? 'border-green-400 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectSession(session)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(session.date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
                            {' · '}{session.locations?.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {session.courts_booked} courts · max {session.max_capacity} · £{session.cost}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(session.id)
                          }}
                          disabled={deleting === session.id}
                          className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">
                {selectedSession
                  ? `Bookings for ${formatDate(selectedSession.date)}`
                  : 'Select a session to view bookings'}
              </h2>
              {!selectedSession ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-400 text-sm">Click a session on the left</p>
                </div>
              ) : bookingsLoading ? (
                <p className="text-gray-400 text-sm">Loading bookings...</p>
              ) : sessionBookings.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <p className="text-gray-400 text-sm">No bookings yet for this session</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionBookings.map(booking => (
                    <div key={booking.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.members?.name}</p>
                        <p className="text-xs text-gray-400">{booking.members?.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColours[booking.status]}`}>
                          {booking.status.toUpperCase()}
                        </span>
                        <select
                          value={booking.status}
                          onChange={e => handleStatusChange(booking.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                        >
                          <option value="tbc">TBC</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="waitlisted">Waitlisted</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}