// src/pages/PublicVehicleDetails.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Battery, Fuel, Gauge, Calendar, Wind, 
  Wrench, Car, Ruler, Cpu, DollarSign
} from 'lucide-react'
import { vehicleService } from '../services/vehicleService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PublicVehicleDetails() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadVehicle()
    window.scrollTo(0, 0)
  }, [type, id])

  const loadVehicle = async () => {
    setLoading(true)
    try {
      const data = await vehicleService.getVehicleById(id, type)
      setVehicle(data)
    } catch (error) {
      console.error('Error loading vehicle:', error)
      setError('Failed to load vehicle details')
    } finally {
      setLoading(false)
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
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !vehicle) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">{error || 'Vehicle not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {vehicle.make} {vehicle.model}
            </h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              type === 'ev' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {type === 'ev' ? 'Electric' : 'ICE'}
            </span>
          </div>
          <p className="text-gray-500">
            {vehicle.category}
          </p>
        </div>

        {/* Vehicle Image */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex justify-center">
            <img
              src={vehicle.image_url || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-64 object-contain"
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
                <p className="text-gray-700 whitespace-pre-wrap">{vehicle.tech_features}</p>
              </div>
            </InfoSection>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}