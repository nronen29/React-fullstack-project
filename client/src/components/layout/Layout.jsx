import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function Layout() {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
