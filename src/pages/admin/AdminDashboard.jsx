// src/pages/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Battery, 
  Fuel, 
  AlertCircle,
  Eye,
  ExternalLink,
  Database,
  Shield,
  Loader
} from 'lucide-react'
import toast from 'react-hot-toast'
import { googleSheetsService as adminService } from '../../services/googleSheetService'
import StatsCards from '../../components/admin/StatsCards'
import DataTable from '../../components/admin/DataTable'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ev')
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [stats, setStats] = useState({
    totalEV: 0,
    totalICE: 0,
    totalVehicles: 0,
    uniqueMakes: 0,
    evByCategory: [],
    iceByCategory: [],
    fuelTypes: [],
    avgEVPrice: 0,
    avgICEPrice: 0,
    avgEVHP: 0,
    avgICEHP: 0,
    topEVBrands: [],
    topICEBrands: []
  })
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 10

  // Store all vehicles for filtering
  const [allVehicles, setAllVehicles] = useState([])

  // Google Sheet URL
  const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Si9DqqHS_wpbKCdA1U9_KQxmpUG_-6kxjt-1dR9nd00/edit?pli=1&gid=0#gid=0'

  // Check if user is trying to access admin features
  useEffect(() => {
    // Block any attempt to access admin creation/edit routes
    const blockedPaths = ['/admin/vehicles/ev/new', '/admin/vehicles/ice/new']
    const currentPath = window.location.pathname
    
    if (blockedPaths.includes(currentPath)) {
      toast.error('Admin operations are now managed directly in Google Sheets')
      navigate('/admin')
      return
    }
  }, [navigate])

  useEffect(() => {
    loadStats()
    loadAllVehicles()
  }, [])

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  // Apply filters and pagination whenever dependencies change
  useEffect(() => {
    if (allVehicles.length > 0) {
      filterAndPaginateVehicles()
    }
  }, [allVehicles, activeTab, searchTerm, currentPage])

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await adminService.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const loadAllVehicles = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getAllVehicles()
      setAllVehicles(data)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load vehicles: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterAndPaginateVehicles = () => {
    // Filter by type (EV/ICE)
    const filteredByType = allVehicles.filter(v => v.type === activeTab)
    
    // Apply search filter
    const searched = filteredByType.filter(v => {
      const searchLower = searchTerm.toLowerCase()
      return (
        v.make?.toLowerCase().includes(searchLower) ||
        v.model?.toLowerCase().includes(searchLower) ||
        v.category?.toLowerCase().includes(searchLower)
      )
    })
    
    setTotalCount(searched.length)
    
    // Calculate pagination
    const start = (currentPage - 1) * itemsPerPage
    const paginated = searched.slice(start, start + itemsPerPage)
    
    setVehicles(paginated)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const columns = [
    { 
      key: 'image', 
      label: 'Image',
      render: (row) => (
        <img 
          src={row.image_url || 'https://placehold.co/100x60/EEE/31343C?text=No+Image'} 
          alt={row.make}
          className="w-16 h-10 object-contain rounded"
        />
      )
    },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'category', label: 'Category' },
    { 
      key: 'price_usd', 
      label: 'Price (USD)',
      render: (row) => row.price_usd ? `$${Number(row.price_usd).toLocaleString()}` : '-'
    },
    { 
      key: 'price_ghs', 
      label: 'Price (GHS)',
      render: (row) => row.price_ghs ? `₵${Number(row.price_ghs).toLocaleString()}` : '-'
    },
    { 
      key: 'fuel_economy_per_100km', 
      label: 'Fuel/100km',
      render: (row) => row.fuel_economy_per_100km ? `${row.fuel_economy_per_100km}` : '-'
    },
    { 
      key: 'horsepower', 
      label: 'HP',
      render: (row) => row.horsepower || '-'
    },
    { 
      key: 'seating_capacity', 
      label: 'Seats',
      render: (row) => row.seating_capacity || '-'
    },
    { 
      key: 'acceleration_0_60_mph', 
      label: '0-60 mph',
      render: (row) => row.acceleration_0_60_mph ? `${row.acceleration_0_60_mph}s` : '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/vehicles/${row.type}/${row.displayId}`}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </Link>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Google Sheets Management Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Database size={24} className="text-blue-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  Google Sheets Management
                </h2>
                <p className="text-gray-600 text-sm mb-3">
                  All vehicle data is now managed directly in Google Sheets. Add, edit, or delete vehicles 
                  by opening the spreadsheet below. Changes will reflect automatically in the app.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <a
                    href={GOOGLE_SHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <ExternalLink size={16} />
                    Open Google Sheet
                    <span className="text-xs opacity-75 ml-1">↗</span>
                  </a>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live connection • Changes reflect instantly
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Read Only with Loading State */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Statistics (Read Only)
            </h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {statsLoading ? 'Loading...' : 'Auto-refreshing'}
            </span>
          </div>
          {statsLoading ? (
            <div className="flex justify-center items-center py-12 bg-white rounded-xl border border-gray-200">
              <Loader size={32} className="text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-500">Loading statistics...</span>
            </div>
          ) : (
            <StatsCards stats={stats} />
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('ev')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                activeTab === 'ev'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Battery size={18} />
                Electric Vehicles ({stats.totalEV})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('ice')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                activeTab === 'ice'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Fuel size={18} />
                ICE Vehicles ({stats.totalICE})
              </div>
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mb-4 mt-4">
          <input
            type="text"
            placeholder={`Search ${activeTab === 'ev' ? 'EV' : 'ICE'} vehicles...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Data Table - Read Only */}
        <div className="relative">
          <DataTable
            columns={columns}
            data={vehicles}
            loading={loading}
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / itemsPerPage)}
            onPageChange={handlePageChange}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
          />
          
          {/* Read Only Overlay Hint */}
          <div className="mt-3 text-right">
            <span className="text-xs text-gray-400 flex items-center justify-end gap-1">
              <Eye size={12} />
              View only - Manage data in Google Sheets
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}