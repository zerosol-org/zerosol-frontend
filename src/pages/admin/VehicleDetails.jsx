// src/pages/Admin/VehicleDetails.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Edit, Trash2, Battery, Fuel, DollarSign, 
  Gauge, Calendar, Wind, Wrench, Car,  
  Ruler, Cpu
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal'
import AdminLayout from '../../components/admin/AdminLayout'

export default function VehicleDetails() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null' || id === 'new') {
      setError('Invalid vehicle ID')
      setLoading(false)
      return
    }
    
    loadVehicle()
  }, [id, type])

  const loadVehicle = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let data
      if (type === 'ev') {
        data = await adminService.getEVVehicle(id)
      } else {
        data = await adminService.getICEVehicle(id)
      }
      setVehicle(data)
    } catch (err) {
      console.error('Error loading vehicle:', err)
      setError(err.message || 'Failed to load vehicle')
      toast.error(err.message || 'Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = () => {
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeleteModalOpen(false)
    setIsDeleting(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      if (type === 'ev') {
        await adminService.deleteEVVehicle(id)
      } else {
        await adminService.deleteICEVehicle(id)
      }
      
      toast.success(`${vehicle.make} ${vehicle.model} deleted successfully!`)
      navigate('/admin')
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`)
      setIsDeleting(false)
      closeDeleteModal()
    }
  }

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return value.toString()
      return value.toFixed(2)
    }
    return value
  }

  const formatCurrency = (value, currency = 'GHS') => {
    if (!value) return '-'
    const symbol = currency === 'USD' ? '$' : '₵'
    return `${symbol}${Number(value).toLocaleString()}`
  }

  const InfoSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )

  const InfoRow = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900">{formatValue(value)}</p>
    </div>
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !vehicle) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Vehicle not found'}
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-sm text-gray-500">
                {type === 'ev' ? 'Electric Vehicle' : 'ICE Vehicle'} · ID: {vehicle.id}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <Link
              to={`/admin/vehicles/${type}/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit size={18} />
              <span className="hidden sm:inline">Edit</span>
            </Link>
            <button
              onClick={openDeleteModal}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Vehicle Image */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-center">
            <img
              src={vehicle.image_url || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-32 sm:h-48 object-contain"
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InfoSection title="Basic Information" icon={Car}>
            <InfoRow label="Make" value={vehicle.make} />
            <InfoRow label="Model" value={vehicle.model} />
            <InfoRow label="Category" value={vehicle.category} />
            <InfoRow label="Seating Capacity" value={vehicle.seating_capacity} />
            <InfoRow label="Horsepower" value={vehicle.horsepower} />
            <InfoRow label="Created At" value={vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : '-'} />
          </InfoSection>

          <InfoSection title="Pricing" icon={DollarSign}>
            <InfoRow label="Price (USD)" value={formatCurrency(vehicle.price_usd, 'USD')} />
            <InfoRow label="Price (GHS)" value={formatCurrency(vehicle.price_ghs, 'GHS')} />
            <InfoRow label="Exchange Rate" value={vehicle.exchange_rate} />
          </InfoSection>
        </div>

        {/* Fuel Economy */}
        <div className="mb-6">
          <InfoSection title="Fuel Economy" icon={Fuel}>
            <InfoRow label="Per km" value={vehicle.fuel_economy_per_km} />
            <InfoRow label="Per 100km" value={vehicle.fuel_economy_per_100km} />
            <InfoRow label="Annual" value={vehicle.annual_fuel_economy} />
          </InfoSection>
        </div>

        {/* Emissions */}
        <div className="mb-6">
          <InfoSection title="Tailpipe Emissions" icon={Wind}>
            <InfoRow label="Per km (gCO₂e)" value={vehicle.tailpipe_emissions_per_km} />
            <InfoRow label="Per 100km (gCO₂e)" value={vehicle.tailpipe_emissions_per_100km} />
            <InfoRow label="Annual (kgCO₂e)" value={vehicle.annual_tailpipe_emissions} />
          </InfoSection>
        </div>

        {/* Yearly Emissions */}
        <div className="mb-6">
          <InfoSection title="Yearly Emissions (kgCO₂e)" icon={Calendar}>
            <InfoRow label="Year 1" value={vehicle.tailpipe_emissions_yr1} />
            <InfoRow label="Year 2" value={vehicle.tailpipe_emissions_yr2} />
            <InfoRow label="Year 3" value={vehicle.tailpipe_emissions_yr3} />
            <InfoRow label="Year 4" value={vehicle.tailpipe_emissions_yr4} />
            <InfoRow label="Year 5" value={vehicle.tailpipe_emissions_yr5} />
          </InfoSection>
        </div>

        {/* Maintenance */}
        <div className="mb-6">
          <InfoSection title="Maintenance Costs (GHS)" icon={Wrench}>
            <InfoRow label="Per km" value={vehicle.avg_maintenance_cost_per_km} />
            <InfoRow label="Per 100km" value={vehicle.avg_maintenance_cost_per_100km} />
            <InfoRow label="Annual" value={formatCurrency(vehicle.annual_maintenance_cost)} />
          </InfoSection>
        </div>

        {/* Total Cost of Ownership */}
        <div className="mb-6">
          <InfoSection title="Total Cost of Ownership (GHS)" icon={DollarSign}>
            <InfoRow label="Year 1" value={formatCurrency(vehicle.tco_yr1)} />
            <InfoRow label="Year 2" value={formatCurrency(vehicle.tco_yr2)} />
            <InfoRow label="Year 3" value={formatCurrency(vehicle.tco_yr3)} />
            <InfoRow label="Year 4" value={formatCurrency(vehicle.tco_yr4)} />
            <InfoRow label="Year 5" value={formatCurrency(vehicle.tco_yr5)} />
          </InfoSection>
        </div>

        {/* Performance */}
        <div className="mb-6">
          <InfoSection title="Performance" icon={Gauge}>
            <InfoRow label="0-60 mph (seconds)" value={vehicle.acceleration_0_60_mph} />
            <InfoRow label="Top Speed (km/h)" value={vehicle.top_speed_kmh} />
          </InfoSection>
        </div>

        {/* Dimensions */}
        <div className="mb-6">
          <InfoSection title="Dimensions" icon={Ruler}>
            <InfoRow label="Ground Clearance (mm)" value={vehicle.ground_clearance_mm} />
            <InfoRow label="Cargo Capacity (L)" value={vehicle.cargo_capacity_l} />
          </InfoSection>
        </div>

        {/* Features */}
        {vehicle.tech_features && (
          <div className="mb-6">
            <InfoSection title="Tech Features" icon={Cpu}>
              <div className="col-span-3">
                <p className="text-gray-900 whitespace-pre-wrap">{vehicle.tech_features}</p>
              </div>
            </InfoSection>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          vehicleName={vehicle ? `${vehicle.make} ${vehicle.model}` : ''}
          isDeleting={isDeleting}
        />
      </div>
    </AdminLayout>
  )
}