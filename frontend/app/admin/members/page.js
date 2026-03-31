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

export default function AdminMembersPage() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberBookings, setMemberBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminService.getMembers()
      .then(res => setMembers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelectMember = (member) => {
    setSelectedMember(member)
    setBookingsLoading(true)
    adminService.getMemberBookings(member.id)
      .then(res => setMemberBookings(res.data))
      .catch(console.error)
      .finally(() => setBookingsLoading(false))
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Members</h1>
          <p className="text-gray-500 text-sm mb-8">
            {members.length} member{members.length !== 1 ? 's' : ''} in your club
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-3"
              />
              {loading ? (
                <p className="text-gray-400 text-sm">Loading members...</p>
              ) : filtered.length === 0 ? (
                <p className="text-gray-400 text-sm">No members found.</p>
              ) : (
                <div className="space-y-2">
                  {filtered.map(member => (
                    <div
                      key={member.id}
                      onClick={() => handleSelectMember(member)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                        selectedMember?.id === member.id
                          ? 'border-green-400 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 text-sm font-medium flex items-center justify-center">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-3">
                {selectedMember ? `${selectedMember.name}'s bookings` : 'Select a member'}
              </h2>
              {!selectedMember ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-gray-400 text-sm">Click a member to view their booking history</p>
                </div>
              ) : bookingsLoading ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : memberBookings.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                  <p className="text-gray-400 text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-2">
                    <p className="text-xs text-gray-500">
                      {memberBookings.filter(b => b.status === 'confirmed').length} confirmed ·{' '}
                      {memberBookings.filter(b => b.status === 'tbc').length} TBC ·{' '}
                      {memberBookings.filter(b => b.status === 'cancelled').length} cancelled
                    </p>
                    {selectedMember.phone && (
                      <p className="text-xs text-gray-500 mt-1">Phone: {selectedMember.phone}</p>
                    )}
                  </div>
                  {memberBookings.map(booking => (
                    <div key={booking.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDate(booking.sessions?.date)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.sessions?.start_time?.slice(0, 5)} · {booking.sessions?.locations?.name}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColours[booking.status]}`}>
                        {booking.status.toUpperCase()}
                      </span>
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