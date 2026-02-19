import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Battery, Fuel, DollarSign, Gauge, Calendar, Wind, Wrench, Car, Settings, AlertCircle } from 'lucide-react'
import { adminService } from '../../services/adminService'

export default function VehicleDetails() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // Validate ID before loading
    if (!id || id === 'undefined' || id === 'null') {
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
      } else if (type === 'ice') {
        data = await adminService.getICEVehicle(id)
      } else {
        throw new Error('Invalid vehicle type')
      }
      
      setVehicle(data)
    } catch (err) {
      console.error('Error loading vehicle:', err)
      setError(err.message || 'Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return
    
    setDeleting(true)
    try {
      if (type === 'ev') {
        await adminService.deleteEVVehicle(id)
      } else {
        await adminService.deleteICEVehicle(id)
      }
      navigate('/admin')
    } catch (err) {
      alert('Error deleting vehicle: ' + err.message)
    } finally {
      setDeleting(false)
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Vehicle not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg"
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
        <div className="flex gap-2">
          <Link
            to={`/admin/vehicles/${type}/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={18} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            <Trash2 size={18} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Vehicle Image */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-center">
          <img
            src={vehicle.image_url || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-48 object-contain"
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
        </InfoSection>

        <InfoSection title="Pricing" icon={DollarSign}>
          <InfoRow label="Price (USD)" value={formatCurrency(vehicle.price_usd, 'USD')} />
          <InfoRow label="Price (GHS)" value={formatCurrency(vehicle.price_ghs, 'GHS')} />
          <InfoRow label="Exchange Rate" value={vehicle.exchange_rate} />
        </InfoSection>
      </div>

      {/* Fuel Economy */}
      <InfoSection title="Fuel Economy" icon={Fuel}>
        <InfoRow label="Per km" value={vehicle.fuel_economy_per_km} />
        <InfoRow label="Per 100km" value={vehicle.fuel_economy_per_100km} />
        <InfoRow label="Annual" value={vehicle.annual_fuel_economy} />
        {type === 'ice' && (
          <InfoRow label="Cost per km (GHS)" value={vehicle.fuel_economy_ghs_per_km} />
        )}
      </InfoSection>

      {/* Emissions */}
      <InfoSection title="Tailpipe Emissions" icon={Wind}>
        <InfoRow label="Per km (gCO₂e)" value={vehicle.tailpipe_emissions_per_km} />
        <InfoRow label="Per 100km (gCO₂e)" value={vehicle.tailpipe_emissions_per_100km} />
        <InfoRow label="Annual (kgCO₂e)" value={vehicle.annual_tailpipe_emissions} />
      </InfoSection>

      {/* Yearly Emissions */}
      <InfoSection title="Yearly Emissions (kgCO₂e)" icon={Calendar}>
        <InfoRow label="Year 1" value={vehicle.tailpipe_emissions_yr1} />
        <InfoRow label="Year 2" value={vehicle.tailpipe_emissions_yr2} />
        <InfoRow label="Year 3" value={vehicle.tailpipe_emissions_yr3} />
        <InfoRow label="Year 4" value={vehicle.tailpipe_emissions_yr4} />
        <InfoRow label="Year 5" value={vehicle.tailpipe_emissions_yr5} />
      </InfoSection>

      {/* Maintenance */}
      <InfoSection title="Maintenance Costs" icon={Wrench}>
        <InfoRow label="Per km (GHS)" value={vehicle.avg_maintenance_cost_per_km} />
        <InfoRow label="Per 100km (GHS)" value={vehicle.avg_maintenance_cost_per_100km} />
        <InfoRow label="Annual (GHS)" value={formatCurrency(vehicle.annual_maintenance_cost)} />
      </InfoSection>

      {/* Total Cost of Ownership */}
      <InfoSection title="Total Cost of Ownership (GHS)" icon={DollarSign}>
        <InfoRow label="Year 1" value={formatCurrency(vehicle.tco_yr1)} />
        <InfoRow label="Year 2" value={formatCurrency(vehicle.tco_yr2)} />
        <InfoRow label="Year 3" value={formatCurrency(vehicle.tco_yr3)} />
        <InfoRow label="Year 4" value={formatCurrency(vehicle.tco_yr4)} />
        <InfoRow label="Year 5" value={formatCurrency(vehicle.tco_yr5)} />
      </InfoSection>

      {/* EV Specific Fields */}
      {type === 'ev' && (
        <InfoSection title="EV Specifications" icon={Battery}>
          <InfoRow label="Ground Clearance (mm)" value={vehicle.ground_clearance_mm} />
          <InfoRow label="Cargo Capacity (L)" value={vehicle.cargo_capacity_l} />
          <InfoRow label="0-60 mph (seconds)" value={vehicle.acceleration_0_60_mph} />
          <InfoRow label="Top Speed (km/h)" value={vehicle.top_speed_kmh} />
          <div className="md:col-span-3">
            <InfoRow label="Tech Features" value={vehicle.tech_features} />
          </div>
        </InfoSection>
      )}

      {/* ICE Specific Fields */}
      {type === 'ice' && (
        <InfoSection title="ICE Specifications" icon={Settings}>
          <InfoRow label="Ground Clearance" value={vehicle.ground_clearance} />
          <InfoRow label="Cargo Capacity" value={vehicle.cargo_capacity} />
          <InfoRow label="0-60 mph" value={vehicle.acceleration_0_60_mph} />
          <InfoRow label="Top Speed" value={vehicle.top_speed} />
          <InfoRow label="Body Type" value={vehicle.body_type} />
          <InfoRow label="Drive Type" value={vehicle.drive_type} />
          <InfoRow label="Engine Type" value={vehicle.engine_type} />
          <InfoRow label="Apple CarPlay" value={vehicle.apple_car_play} />
          <InfoRow label="Android Auto" value={vehicle.android_auto} />
        </InfoSection>
      )}
    </div>
  )
}