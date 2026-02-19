// src/pages/Admin/VehicleList.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Eye, Edit, Trash2, Battery, Fuel, 
  PlusCircle, AlertCircle, ArrowLeft, Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import AdminLayout from '../../components/admin/AdminLayout'
import DataTable from '../../components/admin/DataTable'
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal'
import BulkUploadModal from '../../components/admin/BulkUploadModal'

export default function VehicleList() {
  const { type } = useParams()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Bulk upload modal state
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    loadVehicles()
    setCurrentPage(1)
  }, [type, searchTerm])

  const loadVehicles = async () => {
    setLoading(true)
    setError(null)
    try {
      const allVehicles = await adminService.getAllVehicles()
      
      const filteredByType = allVehicles.filter(v => v.type === type)
      
      const searched = filteredByType.filter(v => {
        const searchLower = searchTerm.toLowerCase()
        return (
          v.make?.toLowerCase().includes(searchLower) ||
          v.model?.toLowerCase().includes(searchLower) ||
          v.category?.toLowerCase().includes(searchLower)
        )
      })
      
      setTotalCount(searched.length)
      
      const start = (currentPage - 1) * itemsPerPage
      const paginated = searched.slice(start, start + itemsPerPage)
      
      setVehicles(paginated)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load vehicles: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (vehicle) => {
    setVehicleToDelete(vehicle)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setVehicleToDelete(null)
    setIsDeleting(false)
  }

  const handleDelete = async () => {
    if (!vehicleToDelete) return
    
    setIsDeleting(true)
    
    try {
      if (vehicleToDelete.type === 'ev') {
        await adminService.deleteEVVehicle(vehicleToDelete.displayId)
      } else {
        await adminService.deleteICEVehicle(vehicleToDelete.displayId)
      }
      
      toast.success(`${vehicleToDelete.make} ${vehicleToDelete.model} deleted successfully!`)
      
      setVehicles(prev => prev.filter(v => 
        !(v.type === vehicleToDelete.type && v.displayId === vehicleToDelete.displayId)
      ))
      
      setTotalCount(prev => prev - 1)
      
      closeDeleteModal()
      
      if (vehicles.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      }
      
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`)
      setIsDeleting(false)
    }
  }

  const handleBulkUploadSuccess = () => {
    loadVehicles()
    setShowBulkUpload(false)
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
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link
            to={`/admin/vehicles/${row.type}/${row.displayId}`}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye size={18} />
          </Link>
          <Link
            to={`/admin/vehicles/${row.type}/${row.displayId}/edit`}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Edit Vehicle"
          >
            <Edit size={18} />
          </Link>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete Vehicle"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {type === 'ev' ? (
                  <>
                    <Battery className="text-green-600" size={24} />
                    Electric Vehicles
                  </>
                ) : (
                  <>
                    <Fuel className="text-orange-600" size={24} />
                    ICE Vehicles
                  </>
                )}
              </h1>
              <p className="text-sm text-gray-500">
                Manage {type === 'ev' ? 'electric' : 'ICE'} vehicles
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Bulk Upload</span>
              <span className="sm:hidden">Bulk</span>
            </button>
            <Link
              to={`/admin/vehicles/${type}/new`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Add New</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={`Search ${type === 'ev' ? 'EV' : 'ICE'} vehicles...`}
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          vehicleName={vehicleToDelete ? `${vehicleToDelete.make} ${vehicleToDelete.model}` : ''}
          isDeleting={isDeleting}
        />

        {/* Bulk Upload Modal */}
        <BulkUploadModal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          onSuccess={handleBulkUploadSuccess}
          vehicleType={type}
        />
      </div>
    </AdminLayout>
  )
}