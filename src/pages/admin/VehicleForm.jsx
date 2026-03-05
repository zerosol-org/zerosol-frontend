// src/pages/Admin/VehicleForm.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import ImageUploader from '../../components/admin/ImageUploader'
import AdminLayout from '../../components/admin/AdminLayout'

// Text Input Component
const TextInput = ({ label, name, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      name={name}
      value={value ?? ''}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)

// Number Input Component
const NumberInput = ({ label, name, value, onChange, step = "0.01", required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="number"
      name={name}
      value={value ?? ''}
      onChange={onChange}
      step={step}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)

// Enhanced Select Input with Add New Category functionality
const SelectInput = ({ label, name, value, onChange, options, required = false, onAddNew }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    
    <div className="relative">
      {/* Main Select Dropdown */}
      <select
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 1rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '4.5rem'
        }}
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Add New Category Button - Floating Badge */}
      {onAddNew && (
        <button
          type="button"
          onClick={onAddNew}
          className="absolute right-12 top-1/2 -translate-y-1/2 px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-md hover:from-green-600 hover:to-green-700 transition-all shadow-sm flex items-center gap-1 group"
          title="Add a new category"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" />
          <span className="hidden sm:inline">New</span>
        </button>
      )}
    </div>

    {/* Help Text */}
    {onAddNew && (
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">✨</span>
        </div>
        <p>
          <span className="font-medium text-gray-700">Don't see your category?</span>{' '}
          Click the <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium"><Plus size={10} /> New</span> button to add it instantly
        </p>
      </div>
    )}
  </div>
)

// Add Category Modal Component
const AddCategoryModal = ({ isOpen, onClose, onAdd }) => {
  const [newCategory, setNewCategory] = useState('')
  const [adding, setAdding] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) {
      toast.error('Please enter a category name')
      return
    }

    setAdding(true)
    try {
      await onAdd(newCategory.trim())
      setNewCategory('')
      onClose()
    } catch (error) {
      console.error('Error adding category:', error)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adding}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// TextArea Input Component
const TextAreaInput = ({ label, name, value, onChange, rows = 3 }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      name={name}
      value={value ?? ''}
      onChange={onChange}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)

// Section Component
const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={20} className="text-blue-600" />}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
)

export default function VehicleForm() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  
  const validTypes = ['ev', 'ice']
  const isValidType = validTypes.includes(type)
  const isEditing = id && id !== 'new' && id !== 'undefined' && id !== 'null'
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  
  // Form data state - note: 'id' and 'created_at' are NOT included
  const [formData, setFormData] = useState({
    image_url: '',
    make: '',
    model: '',
    category: '',
    seating_capacity: '',
    horsepower: '',
    price_usd: '',
    exchange_rate: '12.01',
    price_ghs: '',
    fuel_economy_per_km: '',
    fuel_economy_per_100km: '',
    annual_fuel_economy: '',
    tailpipe_emissions_per_km: '',
    tailpipe_emissions_per_100km: '',
    annual_tailpipe_emissions: '',
    tailpipe_emissions_yr1: '',
    tailpipe_emissions_yr2: '',
    tailpipe_emissions_yr3: '',
    tailpipe_emissions_yr4: '',
    tailpipe_emissions_yr5: '',
    avg_maintenance_cost_per_km: '',
    avg_maintenance_cost_per_100km: '',
    annual_maintenance_cost: '',
    tco_yr1: '',
    tco_yr2: '',
    tco_yr3: '',
    tco_yr4: '',
    tco_yr5: '',
    acceleration_0_60_mph: '',
    top_speed_kmh: '',
    ground_clearance_mm: '',
    cargo_capacity_l: '',
    tech_features: '',
  })

  // Load all existing categories
  const loadCategories = useCallback(async () => {
    setLoadingCategories(true)
    try {
      const vehicles = await adminService.getAllVehicles()
      const uniqueCategories = [...new Set(vehicles.map(v => v.category).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
      
      // Format for select input
      const categoryOptions = uniqueCategories.map(cat => ({
        value: cat,
        label: cat
      }))
      
      setCategories(categoryOptions)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }, [])

  useEffect(() => {
    if (!isValidType) {
      setError(`Invalid vehicle type: ${type}. Must be 'ev' or 'ice'`)
      return
    }

    loadCategories()

    if (isEditing) {
      loadVehicle()
    }
  }, [id, type, isEditing, isValidType, loadCategories])

  const loadVehicle = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let vehicle
      if (type === 'ev') {
        vehicle = await adminService.getEVVehicle(id)
      } else {
        vehicle = await adminService.getICEVehicle(id)
      }
      
      // Remove id and created_at from vehicle data before setting form state
      const { id: _, created_at, ...vehicleWithoutId } = vehicle
      
      // Convert null values to empty strings
      const cleanedVehicle = Object.fromEntries(
        Object.entries(vehicleWithoutId).map(([key, value]) => [
          key,
          value === null ? '' : value
        ])
      )
      
      setFormData(prev => ({
        ...prev,
        ...cleanedVehicle
      }))
      
      if (vehicle.image_url) {
        setImagePreview(vehicle.image_url)
      }
    } catch (err) {
      setError(err.message || 'Failed to load vehicle')
      toast.error(err.message || 'Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => {
      if (prev[name] === value) return prev
      return { ...prev, [name]: value }
    })
  }, [])

  const handleNumberChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => {
      if (prev[name] === value) return prev
      return { ...prev, [name]: value }
    })
  }, [])

  const handleImageChange = useCallback((file) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  const handleAddCategory = async (newCategory) => {
    // Check if category already exists
    const exists = categories.some(c => c.value.toLowerCase() === newCategory.toLowerCase())
    
    if (exists) {
      toast.error('This category already exists')
      return
    }

    // Add to categories list
    const newCategoryOption = {
      value: newCategory,
      label: newCategory
    }
    
    setCategories(prev => [...prev, newCategoryOption].sort((a, b) => a.label.localeCompare(b.label)))
    
    // Auto-select the new category
    setFormData(prev => ({ ...prev, category: newCategory }))
    
    toast.success(`Category "${newCategory}" added successfully!`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.make || !formData.model || !formData.category) {
      toast.error('Please fill in all required fields (Make, Model, Category)')
      return
    }
    
    const action = isEditing ? 'updating' : 'creating'
    
    await toast.promise(
      new Promise(async (resolve, reject) => {
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
          
          // Convert empty strings to null for database
          const vehicleData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [
              key,
              value === '' ? null : 
              key === 'exchange_rate' ? parseFloat(value) :
              typeof value === 'string' && !isNaN(parseFloat(value)) ? parseFloat(value) : value
            ])
          )
          
          vehicleData.image_url = imageUrl
          
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
          
          resolve()
        } catch (err) {
          reject(err)
        } finally {
          setSaving(false)
        }
      }),
      {
        loading: `${isEditing ? 'Updating' : 'Creating'} vehicle...`,
        success: `Vehicle ${isEditing ? 'updated' : 'created'} successfully!`,
        error: (err) => `Failed to ${action} vehicle: ${err.message}`,
      }
    )
    
    if (!error) {
      navigate('/admin')
    }
  }

  if (!isValidType) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
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
          {/* Image Upload Section */}
          <Section title="Vehicle Image">
            <div className="col-span-3">
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
          </Section>

          {/* Basic Information Section */}
          <Section title="Basic Information">
            <TextInput 
              label="Make" 
              name="make" 
              value={formData.make}
              onChange={handleChange}
              required 
            />
            <TextInput 
              label="Model" 
              name="model" 
              value={formData.model}
              onChange={handleChange}
              required 
            />
            <SelectInput 
              label="Category" 
              name="category" 
              value={formData.category}
              onChange={handleChange}
              options={categories}
              onAddNew={() => setShowCategoryModal(true)}
              required
            />
            <NumberInput 
              label="Seating Capacity" 
              name="seating_capacity" 
              value={formData.seating_capacity}
              onChange={handleNumberChange}
              step="1" 
            />
            <NumberInput 
              label="Horsepower" 
              name="horsepower" 
              value={formData.horsepower}
              onChange={handleNumberChange}
              step="1" 
            />
          </Section>

          {/* Pricing Section */}
          <Section title="Pricing">
            <NumberInput 
              label="Price (USD)" 
              name="price_usd" 
              value={formData.price_usd}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Exchange Rate" 
              name="exchange_rate" 
              value={formData.exchange_rate}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Price (GHS)" 
              name="price_ghs" 
              value={formData.price_ghs}
              onChange={handleNumberChange}
            />
          </Section>

          {/* Fuel Economy Section */}
          <Section title="Fuel Economy">
            <NumberInput 
              label="Per km" 
              name="fuel_economy_per_km" 
              value={formData.fuel_economy_per_km}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Per 100km" 
              name="fuel_economy_per_100km" 
              value={formData.fuel_economy_per_100km}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Annual" 
              name="annual_fuel_economy" 
              value={formData.annual_fuel_economy}
              onChange={handleNumberChange}
            />
          </Section>

          {/* Emissions Section */}
          <Section title="Tailpipe Emissions">
            <NumberInput 
              label="Per km (kgCO₂e)" 
              name="tailpipe_emissions_per_km" 
              value={formData.tailpipe_emissions_per_km}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Per 100km (kgCO₂e)" 
              name="tailpipe_emissions_per_100km" 
              value={formData.tailpipe_emissions_per_100km}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Annual (kgCO₂e)" 
              name="annual_tailpipe_emissions" 
              value={formData.annual_tailpipe_emissions}
              onChange={handleNumberChange}
            />
          </Section>

          {/* Yearly Emissions Section */}
          <Section title="Yearly Emissions (kgCO₂e)">
            <NumberInput 
              label="Year 1" 
              name="tailpipe_emissions_yr1" 
              value={formData.tailpipe_emissions_yr1}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Year 2" 
              name="tailpipe_emissions_yr2" 
              value={formData.tailpipe_emissions_yr2}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Year 3" 
              name="tailpipe_emissions_yr3" 
              value={formData.tailpipe_emissions_yr3}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Year 4" 
              name="tailpipe_emissions_yr4" 
              value={formData.tailpipe_emissions_yr4}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Year 5" 
              name="tailpipe_emissions_yr5" 
              value={formData.tailpipe_emissions_yr5}
              onChange={handleNumberChange}
            />
          </Section>

          {/* Maintenance Costs Section */}
          <Section title="Maintenance Costs (GHS)">
            <NumberInput 
              label="Per km" 
              name="avg_maintenance_cost_per_km" 
              value={formData.avg_maintenance_cost_per_km}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Per 100km" 
              name="avg_maintenance_cost_per_100km" 
              value={formData.avg_maintenance_cost_per_100km}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Annual" 
              name="annual_maintenance_cost" 
              value={formData.annual_maintenance_cost}
              onChange={handleNumberChange}
            />
          </Section>

          {/* Total Cost of Ownership Section */}
          <Section title="Total Cost of Ownership (GHS)">
            <NumberInput 
              label="Year 1" 
              name="tco_yr1" 
              value={formData.tco_yr1}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Year 2" 
              name="tco_yr2" 
              value={formData.tco_yr2}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Year 3" 
              name="tco_yr3" 
              value={formData.tco_yr3}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Year 4" 
              name="tco_yr4" 
              value={formData.tco_yr4}
              onChange={handleNumberChange}
            />
            <NumberInput 
              label="Year 5" 
              name="tco_yr5" 
              value={formData.tco_yr5}
              onChange={handleNumberChange}
            />
          </Section>

          {/* Performance Section */}
          <Section title="Performance">
            <NumberInput 
              label="0-60 mph (seconds)" 
              name="acceleration_0_60_mph" 
              value={formData.acceleration_0_60_mph}
              onChange={handleNumberChange}
              step="0.1" 
            />
            <NumberInput 
              label="Top Speed (km/h)" 
              name="top_speed_kmh" 
              value={formData.top_speed_kmh}
              onChange={handleNumberChange}
              step="1" 
            />
          </Section>

          {/* Dimensions Section */}
          <Section title="Dimensions">
            <NumberInput 
              label="Ground Clearance (mm)" 
              name="ground_clearance_mm" 
              value={formData.ground_clearance_mm}
              onChange={handleNumberChange}
              step="1" 
            />
            <NumberInput 
              label="Cargo Capacity (L)" 
              name="cargo_capacity_l" 
              value={formData.cargo_capacity_l}
              onChange={handleNumberChange}
            />
          </Section>

          {/* Features Section */}
          <Section title="Tech Features">
            <div className="col-span-3">
              <TextAreaInput 
                label="Tech & Special Features" 
                name="tech_features" 
                value={formData.tech_features}
                onChange={handleChange}
                rows={4} 
              />
            </div>
          </Section>

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

        {/* Add Category Modal */}
        <AddCategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onAdd={handleAddCategory}
        />
      </div>
    </AdminLayout>
  )
}