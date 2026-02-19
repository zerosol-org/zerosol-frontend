// src/pages/Admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Battery, 
  Fuel, 
  AlertCircle,
  PlusCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { adminService } from '../../services/adminService'
import StatsCards from '../../components/admin/StatsCards'
import DataTable from '../../components/admin/DataTable'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ev')
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadVehicles()
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const loadVehicles = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get all vehicles
      const allVehicles = await adminService.getAllVehicles()
      
      // Filter by type
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
      
      // Update total count
      setTotalCount(searched.length)
      
      // Paginate
      const start = (currentPage - 1) * itemsPerPage
      const paginated = searched.slice(start, start + itemsPerPage)
      
      setVehicles(paginated)
    } catch (err) {
      setError(err.message)
      console.error('Error loading vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) return
    
    try {
      if (vehicle.type === 'ev') {
        await adminService.deleteEVVehicle(vehicle.displayId)
      } else {
        await adminService.deleteICEVehicle(vehicle.displayId)
      }
      
      // Refresh data
      loadVehicles()
      loadStats()
    } catch (err) {
      alert('Error deleting vehicle: ' + err.message)
    }
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
      key: 'fuel_economy_per_100km', 
      label: 'Fuel/100km',
      render: (row) => {
        if (!row.fuel_economy_per_100km) return '-'
        return row.type === 'ev' 
          ? `${row.fuel_economy_per_100km} kWh` 
          : `${row.fuel_economy_per_100km} L`
      }
    },
    { 
      key: 'horsepower', 
      label: 'HP',
      render: (row) => row.horsepower || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/vehicles/${row.type}/${row.displayId}`}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <Eye size={18} />
          </Link>
          <Link
            to={`/admin/vehicles/${row.type}/${row.displayId}/edit`}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            <Edit size={18} />
          </Link>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your vehicle database</p>
        </div>
        <Link
          to={`/admin/vehicles/${activeTab}/new`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} />
          Add New Vehicle
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
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
      <div className="mb-4">
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={vehicles}
        loading={loading}
        currentPage={currentPage}
        totalPages={Math.ceil(totalCount / itemsPerPage)}
        onPageChange={setCurrentPage}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}