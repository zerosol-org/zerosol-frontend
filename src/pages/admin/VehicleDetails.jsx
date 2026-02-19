// src/pages/Admin/VehicleDetails.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Edit, Trash2, Battery, Fuel, DollarSign, 
  Gauge, Calendar, Wind, Wrench, Car,  
  Ruler, Cpu, Clock, Tag, Hash, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminVehicleDetails() {
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

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const InfoSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
        <Icon size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )

  const InfoRow = ({ label, value }) => (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
        <Tag size={12} className="text-gray-400" />
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 break-words">{formatValue(value)}</p>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Vehicle not found'}</p>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {vehicle.make} {vehicle.model}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  type === 'ev' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {type === 'ev' ? 'EV' : 'ICE'}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">{vehicle.category}</p>
                <span className="text-gray-300">•</span>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Hash size={14} className="text-gray-400" />
                  ID: {vehicle.id}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Link
              to={`/admin/vehicles/${type}/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Edit size={18} />
              <span className="hidden sm:inline">Edit Vehicle</span>
            </Link>
            <button
              onClick={openDeleteModal}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Vehicle Image */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="flex justify-center">
            <img
              src={vehicle.image_url || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-48 sm:h-64 object-contain"
            />
          </div>
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Clock size={16} />
              <span className="text-xs font-semibold uppercase">Created</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{formatDate(vehicle.created_at)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <Layers size={16} />
              <span className="text-xs font-semibold uppercase">Last Updated</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{formatDate(vehicle.updated_at || vehicle.created_at)}</p>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Tag size={16} />
              <span className="text-xs font-semibold uppercase">Status</span>
            </div>
            <p className="text-sm font-medium text-green-600">Active</p>
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {vehicle.tech_features}
                  </p>
                </div>
              </div>
            </InfoSection>
          </div>
        )}

        {/* ICE Specific Fields (if applicable) */}
        {type === 'ice' && (
          <div className="mb-6">
            <InfoSection title="ICE Specific Details" icon={Fuel}>
              <InfoRow label="Fuel Economy (GHS/km)" value={vehicle.fuel_economy_ghs_per_km} />
              <InfoRow label="Ground Clearance" value={vehicle.ground_clearance} />
              <InfoRow label="Cargo Capacity" value={vehicle.cargo_capacity} />
              <InfoRow label="Body Type" value={vehicle.body_type} />
              <InfoRow label="Drive Type" value={vehicle.drive_type} />
              <InfoRow label="Engine Type" value={vehicle.engine_type} />
              <InfoRow label="Apple CarPlay" value={vehicle.apple_car_play} />
              <InfoRow label="Android Auto" value={vehicle.android_auto} />
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