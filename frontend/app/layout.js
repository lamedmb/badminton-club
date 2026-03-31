import { AuthProvider } from '../context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Badminton Club',
  description: 'Book your badminton sessions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}