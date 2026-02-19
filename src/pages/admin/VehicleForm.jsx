// src/pages/Admin/VehicleForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft } from 'lucide-react'
import { adminService } from '../../services/adminService'
import ImageUploader from '../../components/admin/ImageUploader'

export default function VehicleForm() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  
  // Validate type
  const validTypes = ['ev', 'ice']
  const isValidType = validTypes.includes(type)
  
  // Check if we're in edit mode
  const isEditing = id && id !== 'new' && id !== 'undefined' && id !== 'null'
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  // Form data state
  const [formData, setFormData] = useState({
    image_url: '',
    make: '',
    model: '',
    category: '',
    price_usd: '',
    exchange_rate: 12.01,
    price_ghs: '',
    fuel_economy_per_km: '',
    fuel_economy_per_100km: '',
    annual_fuel_economy: '',
    tailpipe_emissions_per_km: '',
    tailpipe_emissions_per_100km: '',
    annual_tailpipe_emissions: '',
    avg_maintenance_cost_per_km: '',
    avg_maintenance_cost_per_100km: '',
    annual_maintenance_cost: '',
    tco_yr1: '',
    tco_yr2: '',
    tco_yr3: '',
    tco_yr4: '',
    tco_yr5: '',
    tailpipe_emissions_yr1: '',
    tailpipe_emissions_yr2: '',
    tailpipe_emissions_yr3: '',
    tailpipe_emissions_yr4: '',
    tailpipe_emissions_yr5: '',
    seating_capacity: '',
    horsepower: '',
    ground_clearance_mm: '',
    cargo_capacity_l: '',
    acceleration_0_60_mph: '',
    top_speed_kmh: '',
    tech_features: '',
    fuel_economy_ghs_per_km: '',
    ground_clearance: '',
    apple_car_play: false,
    body_type: '',
    drive_type: '',
    cargo_capacity: '',
    engine_type: '',
    top_speed: '',
    android_auto: false
  })

  useEffect(() => {
    if (!isValidType) {
      setError(`Invalid vehicle type: ${type}. Must be 'ev' or 'ice'`)
      return
    }

    if (isEditing) {
      loadVehicle()
    }
  }, [id, type, isEditing, isValidType])

  const loadVehicle = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`Loading ${type} vehicle with ID:`, id)
      
      let vehicle
      if (type === 'ev') {
        vehicle = await adminService.getEVVehicle(id)
      } else {
        vehicle = await adminService.getICEVehicle(id)
      }
      
      console.log('Vehicle loaded:', vehicle)
      
      setFormData(prev => ({
        ...prev,
        ...vehicle,
        apple_car_play: vehicle.apple_car_play || false,
        android_auto: vehicle.android_auto || false
      }))
      
      if (vehicle.image_url) {
        setImagePreview(vehicle.image_url)
      }
    } catch (err) {
      console.error('Error loading vehicle:', err)
      setError(err.message || 'Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }))
  }

  const handleImageChange = (file) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      let imageUrl = formData.image_url
      
      if (imageFile) {
        imageUrl = await adminService.uploadVehicleImage(
          imageFile,
          formData.make,
          formData.model,
          type
        )
      }
      
      const vehicleData = {
        ...formData,
        image_url: imageUrl,
        ...Object.fromEntries(
          Object.entries(formData).map(([key, value]) => [
            key,
            value === '' ? null : value
          ])
        )
      }
      
      // Remove type-specific fields
      if (type === 'ev') {
        delete vehicleData.fuel_economy_ghs_per_km
        delete vehicleData.ground_clearance
        delete vehicleData.body_type
        delete vehicleData.drive_type
        delete vehicleData.cargo_capacity
        delete vehicleData.engine_type
        delete vehicleData.top_speed
        delete vehicleData.android_auto
      } else {
        delete vehicleData.ground_clearance_mm
        delete vehicleData.cargo_capacity_l
        delete vehicleData.acceleration_0_60_mph
        delete vehicleData.top_speed_kmh
        delete vehicleData.tech_features
      }
      
      if (isEditing) {
        if (type === 'ev') {
          await adminService.updateEVVehicle(id, vehicleData)
        } else {
          await adminService.updateICEVehicle(id, vehicleData)
        }
      } else {
        if (type === 'ev') {
          await adminService.createEVVehicle(vehicleData)
        } else {
          await adminService.createICEVehicle(vehicleData)
        }
      }
      
      navigate('/admin')
    } catch (err) {
      console.error('Error saving vehicle:', err)
      setError(err.message || 'Failed to save vehicle')
    } finally {
      setSaving(false)
    }
  }

  if (!isValidType) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Invalid vehicle type: {type}. Must be 'ev' or 'ice'
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h1>
          <p className="text-sm text-gray-500">
            {type === 'ev' ? 'Electric Vehicle' : 'ICE Vehicle'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Image</h2>
          <ImageUploader
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onImageRemove={() => {
              setImageFile(null)
              setImagePreview(null)
              setFormData(prev => ({ ...prev, image_url: '' }))
            }}
          />
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make *
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="Compact Saloons & Hatchbacks">Compact Saloons & Hatchbacks</option>
                <option value="Sedans & Saloons">Sedans & Saloons</option>
                <option value="Compact SUVs & Crossovers">Compact SUVs & Crossovers</option>
                <option value="Mid-size SUVs">Mid-size SUVs</option>
                <option value="Family/3-row SUVs">Family/3-row SUVs</option>
                <option value="Trucks">Trucks</option>
                <option value="Pickups">Pickups</option>
                <option value="Cargo Vans">Cargo Vans</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                name="price_usd"
                value={formData.price_usd}
                onChange={handleNumberChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exchange Rate
              </label>
              <input
                type="number"
                name="exchange_rate"
                value={formData.exchange_rate}
                onChange={handleNumberChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (GHS)
              </label>
              <input
                type="number"
                name="price_ghs"
                value={formData.price_ghs}
                onChange={handleNumberChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Continue with the rest of your form fields... */}
        {/* ... */}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Vehicle'}
          </button>
        </div>
      </form>
    </div>
  )
}