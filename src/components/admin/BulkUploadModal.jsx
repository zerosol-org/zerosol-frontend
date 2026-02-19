// src/components/admin/BulkUploadModal.jsx
import { useState, useRef, useEffect } from 'react'
import { X, Upload, Download, AlertCircle, CheckCircle, FileText, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../../services/adminService'
import * as XLSX from 'xlsx'

export default function BulkUploadModal({ isOpen, onClose, onSuccess, vehicleType }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState([])
  const [duplicates, setDuplicates] = useState([])
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [pendingData, setPendingData] = useState([])
  const fileInputRef = useRef(null)
  const errorRef = useRef(null)
  const successRef = useRef(null)
  const duplicateRef = useRef(null)

  // Auto-scroll to errors when they appear
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [errors])

  // Auto-scroll to success when it appears
  useEffect(() => {
    if (success.length > 0 && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [success])

  // Auto-scroll to duplicate dialog when it appears
  useEffect(() => {
    if (showDuplicateDialog && duplicateRef.current) {
      duplicateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [showDuplicateDialog])

  if (!isOpen) return null

  const resetState = () => {
    setFile(null)
    setPreview([])
    setErrors([])
    setSuccess([])
    setProgress(0)
    setDuplicates([])
    setPendingData([])
    setShowDuplicateDialog(false)
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      previewFile(selectedFile)
      setErrors([])
      setSuccess([])
      setDuplicates([])
      setShowDuplicateDialog(false)
    }
  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      const headers = json[0] || []
      const rows = json.slice(1, 6) || []
      setPreview({ headers, rows })
    }
    reader.readAsBinaryString(file)
  }

  const downloadTemplate = () => {
    const evHeaders = [
      'Image URL', 'Make', 'Model', 'Category', 'Price (USD)', 'Exchange Rate', 'Price (GHS)',
      'Fuel Economy (/km)', 'Fuel Economy (/100 km)', 'Annual Fuel Economy',
      'Tailpipe emissions /km', 'Tailpipe emissions (/100 km)', 'Annual Tailpipe emissions',
      'Average maintenance cost (/km)', 'Average maintenance cost (/100km)', 'Average annual maintenance cost',
      'TCO Yr1', 'TCO Yr2', 'TCO Yr3', 'TCO Yr4', 'TCO Yr5',
      'Tailpipe Emissions Yr1', 'Tailpipe Emissions Yr2', 'Tailpipe Emissions Yr3',
      'Tailpipe Emissions Yr4', 'Tailpipe Emissions Yr5', 'Seating Capacity',
      'Ground Clearance(mm)', 'Tech & Special Features', 'Cargo Capacity(L)',
      '0-60 mph(s)', 'Top Speed(km/h)', 'Horsepower'
    ]
    
    const iceHeaders = [
      'Image URL', 'Make', 'Model', 'Category', 'Price (USD)', 'Exchange Rate', 'Price (GHS)',
      'Fuel Economy (/km)', 'Fuel Economy (/100 km)', 'Fuel Economy (annual)',
      'Tailpipe emissions /km', 'Tailpipe emissions /100 km', 'Annual Tailpipe emissions',
      'Average maintenance cost (/km)', 'Average maintenance cost (/100km)', 'Average annual maintenance cost',
      'TCO Yr1', 'TCO Yr2', 'TCO Yr3', 'TCO Yr4', 'TCO Yr5',
      'Tailpipe Emissions Yr1', 'Tailpipe Emissions Yr2', 'Tailpipe Emissions Yr3',
      'Tailpipe Emissions Yr4', 'Tailpipe Emissions Yr5', 'Seating Capacity',
      'Fuel Economy (GHS/km)', 'Ground Clearance', 'Apple Car Play',
      'Tech & Special Features', 'Body Type', 'Drive Type', 'Cargo Capacity',
      'Engine Type', '0-60 mph', 'Top Speed', 'Horsepower'
    ]

    const headers = vehicleType === 'ev' ? evHeaders : iceHeaders

    const exampleRow = vehicleType === 'ev' 
      ? [
          'https://example.com/tesla-model-3.jpg',
          'Tesla', 'Model 3', 'Sedan', '45000', '12.01', '540450',
          '0.18', '18', '5400', '0', '0', '0',
          '0.05', '5', '1500', '45000', '49500', '54000', '58500', '63000',
          '0', '0', '0', '0', '0', '5',
          '140', 'Autopilot, Glass Roof', '425', '4.2', '261', '450'
        ]
      : [
          'https://example.com/toyota-camry.jpg',
          'Toyota', 'Camry', 'Sedan', '28000', '12.01', '336280',
          '0.08', '8', '2400', '0.18', '18', '5400',
          '0.06', '6', '1800', '28000', '29800', '31600', '33400', '35200',
          '1800', '1900', '2000', '2100', '2200', '5',
          '0.96', '155', 'Yes', 'Touchscreen, Bluetooth', 'Sedan', 'FWD', '425',
          '2.5L 4-Cylinder', '7.2', '210', '203'
        ]

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow])
    const colWidths = headers.map(() => ({ wch: 15 }))
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')

    XLSX.writeFile(wb, `${vehicleType}_vehicles_template.xlsx`)
    toast.success('Template downloaded successfully!')
  }

  const normalizeHeaders = (obj) => {
    const normalized = {}
    Object.keys(obj).forEach(key => {
      const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, ' ')
      normalized[normalizedKey] = obj[key]
    })
    return normalized
  }

  const checkForDuplicates = async (data) => {
    const duplicates = []
    const uniqueData = []

    for (const row of data) {
      try {
        if (vehicleType === 'ev') {
          await adminService.getEVVehicleByMakeAndModel(row.make, row.model)
          duplicates.push(row)
        } else {
          await adminService.getICEVehicleByMakeAndModel(row.make, row.model)
          duplicates.push(row)
        }
      } catch (error) {
        uniqueData.push(row)
      }
    }

    return { duplicates, uniqueData }
  }

  const validateData = (data) => {
    const errors = []
    const validData = []

    data.forEach((row, index) => {
      const rowNum = index + 2
      
      const normalizedRow = normalizeHeaders(row)
      
      // Required fields
      const make = normalizedRow['make'] || normalizedRow['Make'] || normalizedRow['make ']
      const model = normalizedRow['model'] || normalizedRow['Model'] || normalizedRow['model ']
      const category = normalizedRow['category'] || normalizedRow['Category'] || normalizedRow['category ']
      
      if (!make || !model || !category) {
        errors.push(`Row ${rowNum}: Missing required fields (Make, Model, or Category)`)
        return
      }

      // Build the vehicle object
      const formattedRow = {
        image_url: normalizedRow['image url'] || normalizedRow['Image URL'] || normalizedRow['image'],
        make,
        model,
        category,
        price_usd: normalizedRow['price (usd)'] || normalizedRow['Price (USD)'] || normalizedRow['price usd'],
        exchange_rate: normalizedRow['exchange rate'] || normalizedRow['Exchange Rate'],
        price_ghs: normalizedRow['price (ghs)'] || normalizedRow['Price (GHS)'] || normalizedRow['price ghs'],
        fuel_economy_per_km: normalizedRow['fuel economy (/km)'] || normalizedRow['Fuel Economy (/km)'],
        fuel_economy_per_100km: normalizedRow['fuel economy (/100 km)'] || normalizedRow['Fuel Economy (/100 km)'],
        annual_fuel_economy: normalizedRow['annual fuel economy'] || normalizedRow['Annual Fuel Economy'],
        tailpipe_emissions_per_km: normalizedRow['tailpipe emissions /km'] || normalizedRow['Tailpipe emissions /km'],
        tailpipe_emissions_per_100km: normalizedRow['tailpipe emissions (/100 km)'] || normalizedRow['Tailpipe emissions (/100 km)'],
        annual_tailpipe_emissions: normalizedRow['annual tailpipe emissions'] || normalizedRow['Annual Tailpipe emissions'],
        avg_maintenance_cost_per_km: normalizedRow['average maintenance cost (/km)'] || normalizedRow['Average maintenance cost (/km)'],
        avg_maintenance_cost_per_100km: normalizedRow['average maintenance cost (/100km)'] || normalizedRow['Average maintenance cost (/100km)'],
        annual_maintenance_cost: normalizedRow['average annual maintenance cost'] || normalizedRow['Average annual maintenance cost'],
        tco_yr1: normalizedRow['tco yr1'] || normalizedRow['TCO Yr1'],
        tco_yr2: normalizedRow['tco yr2'] || normalizedRow['TCO Yr2'],
        tco_yr3: normalizedRow['tco yr3'] || normalizedRow['TCO Yr3'],
        tco_yr4: normalizedRow['tco yr4'] || normalizedRow['TCO Yr4'],
        tco_yr5: normalizedRow['tco yr5'] || normalizedRow['TCO Yr5'],
        tailpipe_emissions_yr1: normalizedRow['tailpipe emissions yr1'] || normalizedRow['Tailpipe Emissions Yr1'],
        tailpipe_emissions_yr2: normalizedRow['tailpipe emissions yr2'] || normalizedRow['Tailpipe Emissions Yr2'],
        tailpipe_emissions_yr3: normalizedRow['tailpipe emissions yr3'] || normalizedRow['Tailpipe Emissions Yr3'],
        tailpipe_emissions_yr4: normalizedRow['tailpipe emissions yr4'] || normalizedRow['Tailpipe Emissions Yr4'],
        tailpipe_emissions_yr5: normalizedRow['tailpipe emissions yr5'] || normalizedRow['Tailpipe Emissions Yr5'],
        seating_capacity: normalizedRow['seating capacity'] || normalizedRow['Seating Capacity'],
        horsepower: normalizedRow['horsepower'] || normalizedRow['Horsepower']
      }

      // Handle empty values (represented as '-')
      Object.keys(formattedRow).forEach(key => {
        if (formattedRow[key] === '-' || formattedRow[key] === '') {
          formattedRow[key] = null
        }
      })

      // EV specific fields
      if (vehicleType === 'ev') {
        formattedRow.ground_clearance_mm = normalizedRow['ground clearance(mm)'] || normalizedRow['Ground Clearance(mm)']
        formattedRow.cargo_capacity_l = normalizedRow['cargo capacity(l)'] || normalizedRow['Cargo Capacity(L)']
        formattedRow.acceleration_0_60_mph = normalizedRow['0-60 mph(s)'] || normalizedRow['0-60 mph(s)']
        formattedRow.top_speed_kmh = normalizedRow['top speed(km/h)'] || normalizedRow['Top Speed(km/h)']
        formattedRow.tech_features = normalizedRow['tech & special features'] || normalizedRow['Tech & Special Features']
      }

      // Validate numeric fields (optional - can be null)
      const numericFields = vehicleType === 'ev' 
        ? ['price_usd', 'exchange_rate', 'price_ghs', 'fuel_economy_per_km', 
           'fuel_economy_per_100km', 'annual_fuel_economy', 'tailpipe_emissions_per_km',
           'tailpipe_emissions_per_100km', 'annual_tailpipe_emissions',
           'avg_maintenance_cost_per_km', 'avg_maintenance_cost_per_100km',
           'annual_maintenance_cost', 'tco_yr1', 'tco_yr2', 'tco_yr3', 'tco_yr4', 'tco_yr5',
           'tailpipe_emissions_yr1', 'tailpipe_emissions_yr2', 'tailpipe_emissions_yr3',
           'tailpipe_emissions_yr4', 'tailpipe_emissions_yr5', 'seating_capacity',
           'ground_clearance_mm', 'cargo_capacity_l', 'acceleration_0_60_mph',
           'top_speed_kmh', 'horsepower']
        : ['price_usd', 'exchange_rate', 'price_ghs', 'fuel_economy_per_km',
           'fuel_economy_per_100km', 'annual_fuel_economy', 'tailpipe_emissions_per_km',
           'tailpipe_emissions_per_100km', 'annual_tailpipe_emissions',
           'avg_maintenance_cost_per_km', 'avg_maintenance_cost_per_100km',
           'annual_maintenance_cost', 'tco_yr1', 'tco_yr2', 'tco_yr3', 'tco_yr4', 'tco_yr5',
           'tailpipe_emissions_yr1', 'tailpipe_emissions_yr2', 'tailpipe_emissions_yr3',
           'tailpipe_emissions_yr4', 'tailpipe_emissions_yr5', 'seating_capacity',
           'fuel_economy_ghs_per_km', 'ground_clearance', 'cargo_capacity',
           'acceleration_0_60_mph', 'top_speed', 'horsepower']

      numericFields.forEach(field => {
        if (formattedRow[field] && isNaN(parseFloat(formattedRow[field]))) {
          errors.push(`Row ${rowNum}: ${field} must be a number`)
        }
      })

      validData.push(formattedRow)
    })

    return { validData, errors }
  }

  const processUpload = async (data) => {
    setUploading(true)
    setErrors([])
    setSuccess([])
    setProgress(0)

    try {
      const batchSize = 10
      const batches = []
      for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize))
      }

      const successList = []
      const errorList = []

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        
        try {
          const results = await Promise.allSettled(
            batch.map(async (vehicle) => {
              if (vehicleType === 'ev') {
                return await adminService.createEVVehicle(vehicle)
              } else {
                return await adminService.createICEVehicle(vehicle)
              }
            })
          )

          results.forEach((result, idx) => {
            const vehicleName = `${batch[idx].make} ${batch[idx].model}`
            if (result.status === 'fulfilled') {
              successList.push(vehicleName)
            } else {
              errorList.push(`${vehicleName}: ${result.reason?.message || 'Unknown error'}`)
            }
          })

          setProgress(Math.round(((i + 1) / batches.length) * 100))
        } catch (error) {
          console.error('Batch error:', error)
        }
      }

      setSuccess(successList)
      setErrors(errorList)

      if (errorList.length === 0) {
        toast.success(`Successfully uploaded ${successList.length} vehicles!`)
        onSuccess?.()
        setTimeout(() => {
          resetState()
          onClose()
        }, 2000)
      } else {
        toast.error(`Uploaded ${successList.length} vehicles with ${errorList.length} errors`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process file')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    setErrors([])
    setSuccess([])
    setProgress(0)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)

        console.log('Raw data:', json)

        // Validate data
        const { validData, errors: validationErrors } = validateData(json)
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors)
          toast.error(`Found ${validationErrors.length} validation errors`)
          setUploading(false)
          return
        }

        // Check for duplicates
        const { duplicates, uniqueData } = await checkForDuplicates(validData)

        if (duplicates.length > 0) {
          setDuplicates(duplicates)
          setPendingData(uniqueData)
          setShowDuplicateDialog(true)
          setUploading(false)
        } else {
          await processUpload(validData)
        }
      }
      reader.readAsBinaryString(file)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process file')
      setUploading(false)
    }
  }

  const handleDuplicateAction = async (action) => {
    setShowDuplicateDialog(false)
    
    if (action === 'skip') {
      await processUpload(pendingData)
    } else if (action === 'cancel') {
      setDuplicates([])
      setPendingData([])
    }
    
    setDuplicates([])
    setPendingData([])
  }

  const clearFile = () => {
    resetState()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Upload {vehicleType === 'ev' ? 'EV' : 'ICE'} Vehicles</h2>
              <p className="text-sm text-gray-500">Upload multiple vehicles via Excel/CSV</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Download Template</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Start with our template to ensure correct formatting
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Download size={16} />
                  Download {vehicleType === 'ev' ? 'EV' : 'ICE'} Template
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (Excel or CSV)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              {!file ? (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to select or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: .xlsx, .xls, .csv
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Select File
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button onClick={clearFile} className="p-1 text-gray-500 hover:text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {preview.headers && preview.headers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (First 5 rows)</h3>
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.headers.map((header, idx) => (
                        <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.rows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Duplicate Dialog */}
          {showDuplicateDialog && (
            <div ref={duplicateRef} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Duplicate Vehicles Found</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Found {duplicates.length} vehicles that already exist in the database:
                  </p>
                  <div className="max-h-32 overflow-y-auto mb-4 bg-white rounded-lg p-2">
                    {duplicates.map((dup, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        • {dup.make} {dup.model}
                      </p>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDuplicateAction('skip')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Skip Duplicates
                    </button>
                    <button
                      onClick={() => handleDuplicateAction('cancel')}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                    >
                      Cancel Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Success List */}
          {success.length > 0 && (
            <div ref={successRef} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle size={18} />
                <span className="font-medium">Successfully uploaded ({success.length})</span>
              </div>
              <div className="max-h-32 overflow-y-auto">
                {success.map((item, idx) => (
                  <p key={idx} className="text-sm text-green-600">✓ {item}</p>
                ))}
              </div>
            </div>
          )}

          {/* Error List */}
          {errors.length > 0 && (
            <div ref={errorRef} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle size={18} />
                <span className="font-medium">Errors ({errors.length})</span>
              </div>
              <div className="max-h-32 overflow-y-auto">
                {errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-red-600">⚠ {error}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={handleFileUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Upload Vehicles'}
          </button>
        </div>
      </div>
    </div>
  )
}