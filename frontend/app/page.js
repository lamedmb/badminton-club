'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import AttendeesModal from '../components/AttendeesModal'
import { sessionService, bookingService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState(null)
  const [message, setMessage] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const { member } = useAuth()
  const router = useRouter()

  useEffect(() => {
    sessionService.getAll()
      .then(res => setSessions(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleBook = async (sessionId) => {
    if (!member) {
      router.push('/login')
      return
    }
    try {
      setBookingId(sessionId)
      const res = await bookingService.create(sessionId)
      setMessage(res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Booking failed')
    } finally {
      setBookingId(null)
    }
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const formatTime = (timeStr) => timeStr?.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Upcoming sessions</h1>
        <p className="text-gray-500 text-sm mb-8">Book your spot for an upcoming badminton session</p>

        {message && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming sessions. Check back soon!</p>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(session.date)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(session.start_time)} – {formatTime(session.end_time)}
                    </p>
                    <p className="text-sm text-gray-500">{session.locations?.name}</p>
                    <p className="text-sm text-gray-500">
                      {session.courts_booked} court{session.courts_booked > 1 ? 's' : ''} · max {session.max_capacity} players
                    </p>
                    {session.notes && (
                      <p className="text-xs text-gray-400 mt-2">{session.notes}</p>
                    )}
                    {member && (
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="text-xs text-green-600 hover:underline mt-2 block"
                      >
                        See who's coming
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">£{session.cost}</p>
                    <button
                      onClick={() => handleBook(session.id)}
                      disabled={bookingId === session.id}
                      className="mt-3 bg-green-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {bookingId === session.id ? 'Booking...' : 'Book'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSession && (
        <AttendeesModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}