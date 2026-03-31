'use client'
import { useEffect, useState } from 'react'
import { bookingService } from '../services/api'

const statusColours = {
  confirmed: 'bg-green-100 text-green-700',
  tbc: 'bg-yellow-100 text-yellow-700',
  waitlisted: 'bg-blue-100 text-blue-700',
}

const statusLabel = {
  confirmed: 'Confirmed',
  tbc: 'TBC',
  waitlisted: 'Waitlisted',
}

export default function AttendeesModal({ session, onClose }) {
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    bookingService.getAttendees(session.id)
      .then(res => setAttendees(res.data))
      .catch(err => setError('Could not load attendees'))
      .finally(() => setLoading(false))
  }, [session.id])

  const confirmed = attendees.filter(a => a.status === 'confirmed')
  const tbc = attendees.filter(a => a.status === 'tbc')
  const waitlisted = attendees.filter(a => a.status === 'waitlisted')

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const formatTime = (timeStr) => timeStr?.slice(0, 5)

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Who's coming</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDate(session.date)} · {formatTime(session.start_time)} – {formatTime(session.end_time)}
            </p>
            <p className="text-sm text-gray-500">{session.locations?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="bg-green-50 rounded-xl px-4 py-3 text-center flex-1">
            <p className="text-2xl font-semibold text-green-700">{confirmed.length}</p>
            <p className="text-xs text-green-600 mt-0.5">Confirmed</p>
          </div>
          <div className="bg-yellow-50 rounded-xl px-4 py-3 text-center flex-1">
            <p className="text-2xl font-semibold text-yellow-700">{tbc.length}</p>
            <p className="text-xs text-yellow-600 mt-0.5">TBC</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-center flex-1">
            <p className="text-2xl font-semibold text-gray-700">{session.max_capacity}</p>
            <p className="text-xs text-gray-500 mt-0.5">Capacity</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-4">{error}</p>
        ) : attendees.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No bookings yet — be the first!</p>
        ) : (
          <div className="space-y-5">
            {[
              { label: 'Confirmed', list: confirmed },
              { label: 'TBC', list: tbc },
              { label: 'Waitlisted', list: waitlisted },
            ].map(({ label, list }) =>
              list.length > 0 && (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    {label}
                  </p>
                  <div className="space-y-2">
                    {list.map((attendee, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center justify-center">
                            {attendee.members?.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-800">
                            {attendee.members?.name}
                          </span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColours[attendee.status]}`}>
                          {statusLabel[attendee.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {waitlisted.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            {waitlisted.length} player{waitlisted.length > 1 ? 's' : ''} on the waitlist
          </p>
        )}
      </div>
    </div>
  )
}