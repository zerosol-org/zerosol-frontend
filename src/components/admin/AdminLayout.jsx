// src/components/admin/AdminLayout.jsx
import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { 
  LogOut, 
  User, 
  ChevronDown, 
  Menu, 
  X,
  LayoutDashboard,
  Car,
  Battery,
  Fuel,
  Home,
  Key,
  Lock,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import ChangePasswordModal from './ChangePasswordModal'
import ChangeEmailModal from './ChangeEmailModal'
import ForgotPasswordModal from './ForgotPasswordModal'
import Logo from "../../assets/logo.png"

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAdminAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showChangeEmail, setShowChangeEmail] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      navigate('/admin/login')
    } catch (err) {
      toast.error('Failed to logout')
    }
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/vehicles/ev', icon: Battery, label: 'EV Vehicles' },
    { path: '/admin/vehicles/ice', icon: Fuel, label: 'ICE Vehicles' },
    { path: '/', icon: Home, label: 'View Site' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Left side - Menu toggle and logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition lg:hidden"
              >
                <Menu size={20} className="text-gray-600" />
              </button>
              <Link to="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">EV Benchmark</h1>
              </Link>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={18} className="text-blue-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown size={18} className="text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Administrator</p>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        setShowChangeEmail(true)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Mail size={16} className="text-gray-500" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">Change Email</p>
                        <p className="text-xs text-gray-500">Update your email address</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        setShowChangePassword(true)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Key size={16} className="text-gray-500" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">Change Password</p>
                        <p className="text-xs text-gray-500">Update your password</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        setShowForgotPassword(true)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Lock size={16} className="text-gray-500" />
                      <div className="flex-1 text-left">
                        <p className="font-medium">Forgot Password?</p>
                        <p className="text-xs text-gray-500">Reset via email</p>
                      </div>
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} />
                      <div className="flex-1 text-left">
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-red-400">End your session</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="">
              <img src={Logo} alt="Logo" className="w-[5rem] h-auto" />
            </div>
            <span className="font-semibold text-gray-900">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition lg:hidden"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${
        sidebarOpen ? 'lg:pl-64' : ''
      }`}>
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>

      {/* Modals */}
      <ChangeEmailModal
        isOpen={showChangeEmail}
        onClose={() => setShowChangeEmail(false)}
        currentEmail={user?.email || ''}
      />
      
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  )
}