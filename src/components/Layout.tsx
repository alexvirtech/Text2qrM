import { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/text2qr', label: 'Text→QR', icon: '' },
  { to: '/qr2text', label: 'QR→Text', icon: '' },
  { to: '/enctext', label: 'Encrypt', icon: '' },
  { to: '/dectext', label: 'Decrypt', icon: '' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white h-12 flex items-center px-4 shadow-md">
        <NavLink to="/" className="text-base font-bold hover:text-blue-100">
          Text2QR
        </NavLink>
        <span className="ml-auto text-xs text-blue-200">Offline</span>
      </header>
      <main className="flex-1 pb-16">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-14 pb-[env(safe-area-inset-bottom)] z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={() => {
              const isActive = item.to === '/' ? location.pathname === '/' : location.pathname === item.to
              return `flex flex-col items-center justify-center flex-1 py-1 text-[10px] ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-500'
              }`
            }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
