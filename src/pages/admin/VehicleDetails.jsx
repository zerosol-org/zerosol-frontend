// src/pages/Admin/VehicleDetails.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Battery, Fuel, DollarSign, 
  Gauge, Calendar, Wind, Wrench, Car,  
  Ruler, Cpu, Clock, Tag, Hash, Layers,
  CloudUpload, Trash2, Image as ImageIcon, CheckCircle, AlertCircle, Loader,
  Edit, Save, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { googleSheetsService as adminService } from '../../services/googleSheetService'
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal'
import AdminLayout from '../../components/admin/AdminLayout'

// ─── Image Upload States ────────────────────────────────────────────────────
const UPLOAD_STATE = {
  IDLE: 'idle',
  DRAGGING: 'dragging',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
}

export default function AdminVehicleDetails() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadState, setUploadState] = useState(UPLOAD_STATE.IDLE)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  // Edit modal state
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [saving, setSaving] = useState(false)
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dvklgaysq'
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'vehicle_uploads'

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
      const data = type === 'ev'
        ? await adminService.getEVVehicle(id)
        : await adminService.getICEVehicle(id)
      console.log(data)
      setVehicle(data)
      setEditFormData(data)
    } catch (err) {
      setError(err.message || 'Failed to load vehicle')
      toast.error(err.message || 'Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  // ─── Edit Handlers ──────────────────────────────────────────────────────────
  const handleEditClick = () => {
    setEditFormData(vehicle)
    setIsEditing(true)
  }

  // Use useCallback to prevent unnecessary re-renders
  const handleEditChange = useCallback((field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      // Prepare data for update - only send fields that have changed
      const updateData = {
        make: editFormData.make,
        model: editFormData.model,
        category: editFormData.category,
        price_usd: editFormData.price_usd,
        price_ghs: editFormData.price_ghs,
        exchange_rate: editFormData.exchange_rate,
        fuel_economy_per_km: editFormData.fuel_economy_per_km,
        fuel_economy_per_100km: editFormData.fuel_economy_per_100km,
        annual_fuel_economy: editFormData.annual_fuel_economy,
        tailpipe_emissions_per_km: editFormData.tailpipe_emissions_per_km,
        tailpipe_emissions_per_100km: editFormData.tailpipe_emissions_per_100km,
        annual_tailpipe_emissions: editFormData.annual_tailpipe_emissions,
        avg_maintenance_cost_per_km: editFormData.avg_maintenance_cost_per_km,
        avg_maintenance_cost_per_100km: editFormData.avg_maintenance_cost_per_100km,
        annual_maintenance_cost: editFormData.annual_maintenance_cost,
        tco_yr1: editFormData.tco_yr1,
        tco_yr2: editFormData.tco_yr2,
        tco_yr3: editFormData.tco_yr3,
        tco_yr4: editFormData.tco_yr4,
        tco_yr5: editFormData.tco_yr5,
        tailpipe_emissions_yr1: editFormData.tailpipe_emissions_yr1,
        tailpipe_emissions_yr2: editFormData.tailpipe_emissions_yr2,
        tailpipe_emissions_yr3: editFormData.tailpipe_emissions_yr3,
        tailpipe_emissions_yr4: editFormData.tailpipe_emissions_yr4,
        tailpipe_emissions_yr5: editFormData.tailpipe_emissions_yr5,
        seating_capacity: editFormData.seating_capacity,
        ground_clearance_mm: editFormData.ground_clearance_mm,
        cargo_capacity_l: editFormData.cargo_capacity_l,
        tech_features: editFormData.tech_features,
        acceleration_0_60_mph: editFormData.acceleration_0_60_mph,
        top_speed_kmh: editFormData.top_speed_kmh || editFormData.top_speed,
        horsepower: editFormData.horsepower,
      }

      // Add ICE-specific fields if applicable
      if (type === 'ice') {
        updateData.fuel_economy_ghs_per_km = editFormData.fuel_economy_ghs_per_km
        updateData.ground_clearance = editFormData.ground_clearance
        updateData.apple_car_play = editFormData.apple_car_play
        updateData.body_type = editFormData.body_type
        updateData.drive_type = editFormData.drive_type
        updateData.cargo_capacity = editFormData.cargo_capacity
        updateData.engine_type = editFormData.engine_type
        updateData.android_auto = editFormData.android_auto
      }

      if (type === 'ev') {
        await adminService.updateEVVehicle(id, updateData)
      } else {
        await adminService.updateICEVehicle(id, updateData)
      }

      toast.success('Vehicle updated successfully!')
      setIsEditing(false)
      await loadVehicle() // Reload to get fresh data
    } catch (err) {
      console.error('Error saving vehicle:', err)
      toast.error('Failed to save changes: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData(vehicle)
  }

  // ─── Upload Logic ──────────────────────────────────────────────────────────

  const uploadImageToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 90))
        }
      }

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText)
        if (data.secure_url) resolve(data.secure_url)
        else reject(new Error(data.error?.message || 'Upload failed'))
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.send(formData)
    })
  }

  const processFile = async (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setUploadState(UPLOAD_STATE.UPLOADING)
    setUploadProgress(0)

    try {
      const imageUrl = await uploadImageToCloudinary(file)
      setUploadProgress(95)

      if (type === 'ev') {
        await adminService.updateEVImageUrl(id, imageUrl)
      } else {
        await adminService.updateICEImageUrl(id, imageUrl)
      }

      setUploadProgress(100)
      setVehicle(prev => ({ ...prev, image_url: imageUrl }))
      setUploadState(UPLOAD_STATE.SUCCESS)
      
      toast.success('Image uploaded successfully!')

      setTimeout(() => {
        URL.revokeObjectURL(localUrl)
        setPreviewUrl(null)
        setUploadState(UPLOAD_STATE.IDLE)
      }, 1500)
      
    } catch (err) {
      console.error('Upload error:', err)
      setUploadState(UPLOAD_STATE.ERROR)
      setPreviewUrl(null)
      URL.revokeObjectURL(localUrl)
      toast.error(err.message || 'Upload failed')
    }
  }

  const handleFileInput = (e) => processFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setUploadState(UPLOAD_STATE.IDLE)
    processFile(e.dataTransfer.files?.[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setUploadState(UPLOAD_STATE.DRAGGING)
  }

  const handleDragLeave = () => {
    if (uploadState === UPLOAD_STATE.DRAGGING) setUploadState(UPLOAD_STATE.IDLE)
  }

  const handleRemoveImage = async () => {
    if (!confirm('Remove this image?')) return
    try {
      if (type === 'ev') {
        await adminService.updateEVImageUrl(id, '')
      } else {
        await adminService.updateICEImageUrl(id, '')
      }
      setVehicle(prev => ({ ...prev, image_url: '' }))
      setUploadState(UPLOAD_STATE.IDLE)
      toast.success('Image removed successfully')
    } catch (err) {
      toast.error('Failed to remove image')
    }
  }

  const resetUploadState = () => setUploadState(UPLOAD_STATE.IDLE)

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return value.toString()
      return value.toFixed(2)
    }
    return value
  }

  const formatCurrency = (value, currency = 'GHS') => {
    if (!value) return '—'
    const symbol = currency === 'USD' ? '$' : '₵'
    return `${symbol}${Number(value).toLocaleString()}`
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

  // Memoize the InfoRow component to prevent unnecessary re-renders
  const InfoRow = useMemo(() => {
    return ({ label, value, editable = false, field = null, inputType = 'text' }) => {
      if (editable && isEditing && field) {
        return (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Tag size={12} className="text-gray-400" />
              {label}
            </p>
            <input
              type={inputType}
              value={editFormData[field] || ''}
              onChange={(e) => handleEditChange(field, e.target.value)}
              className="w-full text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
          </div>
        )
      }
      return (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Tag size={12} className="text-gray-400" />
            {label}
          </p>
          <p className="text-sm font-semibold text-gray-900 break-words">{formatValue(value)}</p>
        </div>
      )
    }
  }, [isEditing, editFormData, handleEditChange])

  // ─── Render States ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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

  const isUploading = uploadState === UPLOAD_STATE.UPLOADING
  const isDragging = uploadState === UPLOAD_STATE.DRAGGING
  const currentImage = previewUrl || vehicle.image_url

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* ── Header with Edit Button ── */}
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
          
          {/* <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Edit size={18} />
                Edit Vehicle
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            )}
          </div> */}
        </div>

        {/* ── Image Panel ── */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-800">Vehicle Image</h2>
            </div>
            {currentImage && !isUploading && (
              <button
                onClick={handleRemoveImage}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Current / Preview image */}
              <div className="flex-shrink-0">
                {currentImage ? (
                  <div className="relative group">
                    <img
                      src={currentImage}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className={`h-52 w-72 object-contain rounded-xl border border-gray-200 bg-gray-50 transition-opacity ${isUploading ? 'opacity-60' : 'opacity-100'}`}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
                        <Loader size={28} className="text-blue-500 animate-spin mb-2" />
                        <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
                      </div>
                    )}
                    {uploadState === UPLOAD_STATE.SUCCESS && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-green-50/80 animate-pulse">
                        <CheckCircle size={40} className="text-green-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-52 w-72 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                    <ImageIcon size={40} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No image yet</p>
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <div className="flex-1 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  disabled={isUploading}
                  className="hidden"
                />

                {uploadState === UPLOAD_STATE.ERROR ? (
                  <div className="border-2 border-dashed border-red-300 rounded-xl p-8 bg-red-50 text-center">
                    <AlertCircle size={36} className="mx-auto mb-2 text-red-400" />
                    <p className="text-sm font-medium text-red-600 mb-1">Upload failed</p>
                    <p className="text-xs text-red-400 mb-4">Something went wrong. Please try again.</p>
                    <button
                      onClick={resetUploadState}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`
                      relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer select-none
                      ${isDragging
                        ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                        : isUploading
                          ? 'border-blue-200 bg-blue-50 cursor-not-allowed'
                          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                      }
                    `}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-full bg-blue-100 rounded-full h-2 mb-4 overflow-hidden">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <Loader size={28} className="mx-auto mb-2 text-blue-500 animate-spin" />
                        <p className="text-sm font-medium text-blue-600">Uploading… {uploadProgress}%</p>
                        <p className="text-xs text-blue-400 mt-1">Saving to Google Sheet</p>
                      </>
                    ) : (
                      <>
                        <CloudUpload
                          size={36}
                          className={`mx-auto mb-3 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                        />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          {isDragging ? 'Drop to upload' : vehicle.image_url ? 'Replace image' : 'Upload image'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Drag & drop or <span className="text-blue-500 underline">browse</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5 MB</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Info Sections with Edit Support ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InfoSection title="Basic Information" icon={Car}>
            <InfoRow label="Make" value={vehicle.make} editable={true} field="make" />
            <InfoRow label="Model" value={vehicle.model} editable={true} field="model" />
            <InfoRow label="Category" value={vehicle.category} editable={true} field="category" />
            <InfoRow label="Seating Capacity" value={vehicle.seating_capacity} editable={true} field="seating_capacity" inputType="number" />
            <InfoRow label="Horsepower" value={vehicle.horsepower} editable={true} field="horsepower" inputType="number" />
          </InfoSection>

          <InfoSection title="Pricing" icon={DollarSign}>
            <InfoRow label="Price (USD)" value={formatCurrency(vehicle.price_usd, 'USD')} editable={true} field="price_usd" inputType="number" />
            <InfoRow label="Price (GHS)" value={formatCurrency(vehicle.price_ghs, 'GHS')} editable={true} field="price_ghs" inputType="number" />
            <InfoRow label="Exchange Rate" value={vehicle.exchange_rate} editable={true} field="exchange_rate" inputType="number" />
          </InfoSection>
        </div>

        <div className="mb-6">
          <InfoSection title="Fuel Economy" icon={Fuel}>
            <InfoRow label="Per km" value={vehicle.fuel_economy_per_km} editable={true} field="fuel_economy_per_km" />
            <InfoRow label="Per 100km" value={vehicle.fuel_economy_per_100km} editable={true} field="fuel_economy_per_100km" />
            <InfoRow label="Annual" value={vehicle.annual_fuel_economy} editable={true} field="annual_fuel_economy" />
          </InfoSection>
        </div>

        <div className="mb-6">
          <InfoSection title="Tailpipe Emissions" icon={Wind}>
            <InfoRow label="Per km (gCO₂e)" value={vehicle.tailpipe_emissions_per_km} editable={true} field="tailpipe_emissions_per_km" />
            <InfoRow label="Per 100km (gCO₂e)" value={vehicle.tailpipe_emissions_per_100km} editable={true} field="tailpipe_emissions_per_100km" />
            <InfoRow label="Annual (kgCO₂e)" value={vehicle.annual_tailpipe_emissions} editable={true} field="annual_tailpipe_emissions" />
          </InfoSection>
        </div>

        <div className="mb-6">
          <InfoSection title="Yearly Emissions (kgCO₂e)" icon={Calendar}>
            <InfoRow label="Year 1" value={vehicle.tailpipe_emissions_yr1} editable={true} field="tailpipe_emissions_yr1" />
            <InfoRow label="Year 2" value={vehicle.tailpipe_emissions_yr2} editable={true} field="tailpipe_emissions_yr2" />
            <InfoRow label="Year 3" value={vehicle.tailpipe_emissions_yr3} editable={true} field="tailpipe_emissions_yr3" />
            <InfoRow label="Year 4" value={vehicle.tailpipe_emissions_yr4} editable={true} field="tailpipe_emissions_yr4" />
            <InfoRow label="Year 5" value={vehicle.tailpipe_emissions_yr5} editable={true} field="tailpipe_emissions_yr5" />
          </InfoSection>
        </div>

        <div className="mb-6">
          <InfoSection title="Maintenance Costs (GHS)" icon={Wrench}>
            <InfoRow label="Per km" value={vehicle.avg_maintenance_cost_per_km} editable={true} field="avg_maintenance_cost_per_km" />
            <InfoRow label="Per 100km" value={vehicle.avg_maintenance_cost_per_100km} editable={true} field="avg_maintenance_cost_per_100km" />
            <InfoRow label="Annual" value={vehicle.annual_maintenance_cost} editable={true} field="annual_maintenance_cost" />
          </InfoSection>
        </div>

        <div className="mb-6">
          <InfoSection title="Total Cost of Ownership (GHS)" icon={DollarSign}>
            <InfoRow label="Year 1" value={vehicle.tco_yr1} editable={true} field="tco_yr1" />
            <InfoRow label="Year 2" value={vehicle.tco_yr2} editable={true} field="tco_yr2" />
            <InfoRow label="Year 3" value={vehicle.tco_yr3} editable={true} field="tco_yr3" />
            <InfoRow label="Year 4" value={vehicle.tco_yr4} editable={true} field="tco_yr4" />
            <InfoRow label="Year 5" value={vehicle.tco_yr5} editable={true} field="tco_yr5" />
          </InfoSection>
        </div>

        <div className="mb-6">
          <InfoSection title="Performance" icon={Gauge}>
            <InfoRow label="0-60 mph (seconds)" value={vehicle.acceleration_0_60_mph} editable={true} field="acceleration_0_60_mph" />
            <InfoRow label="Top Speed (km/h)" value={vehicle.top_speed_kmh || vehicle.top_speed} editable={true} field="top_speed_kmh" />
          </InfoSection>
        </div>

        <div className="mb-6">
          <InfoSection title="Dimensions" icon={Ruler}>
            <InfoRow label="Ground Clearance (mm)" value={vehicle.ground_clearance_mm} editable={true} field="ground_clearance_mm" />
            <InfoRow label="Cargo Capacity (L)" value={vehicle.cargo_capacity_l} editable={true} field="cargo_capacity_l" />
          </InfoSection>
        </div>

        {vehicle.tech_features && (
          <div className="mb-6">
            <InfoSection title="Tech Features" icon={Cpu}>
              <div className="col-span-3">
                {isEditing ? (
                  <textarea
                    value={editFormData.tech_features || ''}
                    onChange={(e) => handleEditChange('tech_features', e.target.value)}
                    className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {vehicle.tech_features}
                    </p>
                  </div>
                )}
              </div>
            </InfoSection>
          </div>
        )}

        {type === 'ice' && (
          <div className="mb-6">
            <InfoSection title="ICE Specific Details" icon={Fuel}>
              <InfoRow label="Fuel Economy (GHS/km)" value={vehicle.fuel_economy_ghs_per_km} editable={true} field="fuel_economy_ghs_per_km" />
              <InfoRow label="Ground Clearance" value={vehicle.ground_clearance} editable={true} field="ground_clearance" />
              <InfoRow label="Cargo Capacity" value={vehicle.cargo_capacity} editable={true} field="cargo_capacity" />
              <InfoRow label="Body Type" value={vehicle.body_type} editable={true} field="body_type" />
              <InfoRow label="Drive Type" value={vehicle.drive_type} editable={true} field="drive_type" />
              <InfoRow label="Engine Type" value={vehicle.engine_type} editable={true} field="engine_type" />
              <InfoRow label="Apple CarPlay" value={vehicle.apple_car_play} editable={true} field="apple_car_play" />
              <InfoRow label="Android Auto" value={vehicle.android_auto} editable={true} field="android_auto" />
            </InfoSection>
          </div>
        )}

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setIsDeleting(false) }}
          onConfirm={async () => {
            setIsDeleting(true)
            try {
              if (type === 'ev') await adminService.deleteEVVehicle(id)
              else await adminService.deleteICEVehicle(id)
              toast.success(`${vehicle.make} ${vehicle.model} deleted`)
              navigate('/admin')
            } catch (err) {
              toast.error(`Failed to delete: ${err.message}`)
              setIsDeleting(false)
              setDeleteModalOpen(false)
            }
          }}
          vehicleName={vehicle ? `${vehicle.make} ${vehicle.model}` : ''}
          isDeleting={isDeleting}
        />
      </div>
    </AdminLayout>
  )
}