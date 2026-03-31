'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import AdminGuard from '../../components/AdminGuard'
import { adminService } from '../../services/api'

function StatCard({ label, value, colour }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${colour}`}>{value}</p>
    </div>
  )
}

export default function AdminPage() {
  const [sessions, setSessions] = useState([])
  const [members, setMembers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getSessions(),
      adminService.getMembers(),
    ]).then(([sessionsRes, membersRes]) => {
      setSessions(sessionsRes.data)
      setMembers(membersRes.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const tbcCount = bookings.filter(b => b.status === 'tbc').length
  const waitlistedCount = bookings.filter(b => b.status === 'waitlisted').length

  const quickLinks = [
    { href: '/admin/sessions', label: 'Manage sessions', description: 'Create, view and delete sessions', colour: 'bg-coral-50 border-coral-200' },
    { href: '/admin/members', label: 'Manage members', description: 'View members and their booking history', colour: 'bg-blue-50 border-blue-200' },
  ]

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admin panel</h1>
          <p className="text-gray-500 text-sm mb-8">Manage your badminton club</p>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <StatCard
                  label="Upcoming sessions"
                  value={sessions.length}
                  colour="text-gray-900"
                />
                <StatCard
                  label="Total members"
                  value={members.length}
                  colour="text-blue-600"
                />
                <StatCard
                  label="Confirmed bookings"
                  value={sessions.reduce((acc, s) => acc, 0)}
                  colour="text-green-600"
                />
                <StatCard
                  label="Sessions this month"
                  value={sessions.filter(s => {
                    const d = new Date(s.date)
                    const now = new Date()
                    return d.getMonth() === now.getMonth() &&
                      d.getFullYear() === now.getFullYear()
                  }).length}
                  colour="text-orange-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <Link href="/admin/sessions">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer">
                    <h2 className="font-semibold text-gray-900 mb-1">Sessions</h2>
                    <p className="text-sm text-gray-500">Create sessions, view bookings, manage capacity</p>
                    <p className="text-xs text-green-600 mt-3 font-medium">Go to sessions →</p>
                  </div>
                </Link>
                <Link href="/admin/members">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer">
                    <h2 className="font-semibold text-gray-900 mb-1">Members</h2>
                    <p className="text-sm text-gray-500">View all members, check booking history</p>
                    <p className="text-xs text-green-600 mt-3 font-medium">Go to members →</p>
                  </div>
                </Link>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-4">Upcoming sessions overview</h2>
                {sessions.length === 0 ? (
                  <p className="text-gray-400 text-sm">No upcoming sessions.</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map(session => (
                      <div key={session.id} className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(session.date).toLocaleDateString('en-GB', {
                              weekday: 'short', day: 'numeric', month: 'short'
                            })}
                            {' · '}
                            {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{session.locations?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {session.courts_booked} court{session.courts_booked > 1 ? 's' : ''} · max {session.max_capacity}
                          </p>
                          <Link
                            href="/admin/sessions"
                            className="text-xs text-green-600 hover:underline"
                          >
                            View bookings
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}