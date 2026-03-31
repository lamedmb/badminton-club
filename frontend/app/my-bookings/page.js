'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import { bookingService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const statusColours = {
  confirmed: 'bg-green-100 text-green-700',
  tbc: 'bg-yellow-100 text-yellow-700',
  waitlisted: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const { member, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!member) {
      router.push('/login')
      return
    }
    bookingService.getMyBookings()
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [member, authLoading])

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdating(bookingId)
    try {
      await bookingService.updateStatus(bookingId, newStatus)
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  })

  const formatTime = (timeStr) => timeStr?.slice(0, 5)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isUpcoming = (booking) => {
    if (!booking.sessions?.date) return false
    return new Date(booking.sessions.date) >= today
  }

  const upcomingBookings = bookings.filter(b => isUpcoming(b) && b.status !== 'cancelled')
  const pastBookings = bookings.filter(b => !isUpcoming(b) || b.status === 'cancelled')

  const BookingCard = ({ booking, showActions }) => {
    const [waitlistInfo, setWaitlistInfo] = useState(null)

    useEffect(() => {
      if (booking.status === 'waitlisted') {
        bookingService.getWaitlistPosition(booking.sessions?.id || booking.session_id)
          .then(res => setWaitlistInfo(res.data))
          .catch(err => console.error(err))
      }
    }, [booking])

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {formatDate(booking.sessions?.date)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatTime(booking.sessions?.start_time)} – {formatTime(booking.sessions?.end_time)}
            </p>
            <p className="text-sm text-gray-500">
              {booking.sessions?.locations?.name}
            </p>
            <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-2 ${statusColours[booking.status]}`}>
              {booking.status.toUpperCase()}
            </span>
            {booking.status === 'waitlisted' && waitlistInfo && (
              <p className="text-xs text-blue-600 mt-1">
                You are #{waitlistInfo.position} on the waitlist
                {waitlistInfo.total_waitlisted > 1
                  ? ` (${waitlistInfo.total_waitlisted} people waiting)`
                  : ''}
              </p>
            )}
          </div>
          {showActions && (
            <div className="flex flex-col gap-2">
              {booking.status === 'tbc' && (
                <button
                  onClick={() => handleStatusChange(booking.id, 'confirmed')}
                  disabled={updating === booking.id}
                  className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Confirm
                </button>
              )}
              {booking.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusChange(booking.id, 'cancelled')}
                  disabled={updating === booking.id}
                  className="bg-white text-red-500 border border-red-200 text-xs px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">My bookings</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your upcoming sessions and view your history</p>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading your bookings...</p>
        ) : (
          <>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Upcoming</h2>
            {upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-10">
                <p className="text-gray-500 text-sm">No upcoming bookings.</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 bg-green-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-700"
                >
                  Browse sessions
                </button>
              </div>
            ) : (
              <div className="space-y-4 mb-10">
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} showActions={true} />
                ))}
              </div>
            )}

            {pastBookings.length > 0 && (
              <>
                <h2 className="text-sm font-medium text-gray-400 mb-3">Past &amp; cancelled</h2>
                <div className="space-y-3 opacity-60">
                  {pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} showActions={false} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}