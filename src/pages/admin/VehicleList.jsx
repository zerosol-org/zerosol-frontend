// src/pages/Admin/VehicleList.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Eye, Edit, Trash2, Battery, Fuel, 
  PlusCircle, AlertCircle, ArrowLeft, Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { googleSheetsService as adminService } from '../../services/googleSheetService'
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
  
  // Store all vehicles for filtering (client-side pagination)
  const [allVehicles, setAllVehicles] = useState([])

  useEffect(() => {
    loadAllVehicles()
  }, [type])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Apply filters and pagination whenever dependencies change
  useEffect(() => {
    if (allVehicles.length > 0) {
      filterAndPaginateVehicles()
    }
  }, [allVehicles, searchTerm, currentPage])

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
    const filteredByType = allVehicles.filter(v => v.type === type)
    
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
      
      // Update all vehicles
      const updatedVehicles = allVehicles.filter(v => 
        !(v.type === vehicleToDelete.type && v.displayId === vehicleToDelete.displayId)
      )
      setAllVehicles(updatedVehicles)
      
      closeDeleteModal()
      
      // Check if current page becomes empty
      const filteredByType = updatedVehicles.filter(v => v.type === type)
      const searched = filteredByType.filter(v => {
        const searchLower = searchTerm.toLowerCase()
        return (
          v.make?.toLowerCase().includes(searchLower) ||
          v.model?.toLowerCase().includes(searchLower) ||
          v.category?.toLowerCase().includes(searchLower)
        )
      })
      
      const newTotalPages = Math.ceil(searched.length / itemsPerPage)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      } else if (searched.length === 0) {
        setCurrentPage(1)
      }
      
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`)
      setIsDeleting(false)
    }
  }

  const handleBulkUploadSuccess = () => {
    loadAllVehicles()
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
            {/* Add/Upload buttons are commented out as per requirement */}
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