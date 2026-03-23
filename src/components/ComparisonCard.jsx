// src/components/ComparisonCard.jsx
import { Wallet, LineChart, Fuel, Car } from "lucide-react"
import EmptyCar from "../assets/emptyCar.png"
import { useMemo } from 'react'

const ComparisonCard = ({
  car,
  placeholder,
  onAdd,
  variant = "primary",
  years = 3,
}) => {
  const isEmpty = !car
  const isPrimary = variant === "primary"
  const active = !isEmpty

  const borderColor = isPrimary
    ? active
      ? "border-blue-500"
      : "border-blue-200"
    : active
    ? "border-gray-500"
    : "border-gray-200"

  // Helper to format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'GHS 0'
    const cleanValue = typeof value === 'string' 
      ? value.replace(/[₵$,]/g, '').replace(/,/g, '')
      : value
    const num = typeof cleanValue === 'number' ? cleanValue : parseFloat(cleanValue)
    if (isNaN(num)) return 'GHS 0'
    return `GHS ${num.toLocaleString()}`
  }

  // Helper to format emissions
  const formatEmissions = (value) => {
    if (!value && value !== 0) return '0 kgCO₂e'
    const cleanValue = typeof value === 'string' 
      ? value.replace(/[^\d.-]/g, '')
      : value
    const num = typeof cleanValue === 'number' ? cleanValue : parseFloat(cleanValue)
    if (isNaN(num)) return '0 kgCO₂e'
    return `${num.toLocaleString()} kgCO₂e`
  }

  // Get TCO based on selected years
  const tcoValue = useMemo(() => {
    if (!car) return '-'
    
    // Year 0: Show dash
    if (years === 0) return '-'
    
    // YEARS 1-5: Get TCO data
    let tcoVal = null
    
    if (car.tco) {
      const yearKey = `year${years}`
      tcoVal = car.tco[yearKey]
    }
    if (!tcoVal) {
      const tcoField = `tco_yr${years}`
      tcoVal = car[tcoField]
    }
    if (!tcoVal) {
      const sheetField = `TCO Yr${years}`
      tcoVal = car[sheetField]
    }
    
    if (tcoVal) {
      return formatCurrency(tcoVal)
    }
    
    return 'GHS 0'
  }, [car, years])

  // Get emissions based on selected years
  const emissionsValue = useMemo(() => {
    if (!car) return '-'
    
    // Year 0: Show dash
    if (years === 0) return '-'
    
    let emissionsVal = null
    
    if (car.emissions) {
      const yearKey = `year${years}`
      emissionsVal = car.emissions[yearKey]
    }
    if (!emissionsVal) {
      const emissionsField = `tailpipe_emissions_yr${years}`
      emissionsVal = car[emissionsField]
    }
    if (!emissionsVal) {
      const sheetField = `Tailpipe Emissions Yr${years}`
      emissionsVal = car[sheetField]
    }
    
    if (emissionsVal) {
      return formatEmissions(emissionsVal)
    }
    
    return '0 kgCO₂e'
  }, [car, years])

  // Get fuel economy
  const fuelEconomy = useMemo(() => {
    if (!car) return '-'
    
    // Year 0: Show dash
    if (years === 0) return '-'
    
    let value = null
    
    if (car.fuel_economy_per_100km) {
      value = car.fuel_economy_per_100km
    } else if (car['Fuel Economy (/100 km)']) {
      value = car['Fuel Economy (/100 km)']
    } else if (car.fuel_economy_per_km) {
      value = parseFloat(car.fuel_economy_per_km) * 100
    }
    
    if (value) {
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        return `GHS ${numValue.toFixed(2)}/100km`
      }
      if (typeof value === 'string' && value.includes('GHS')) {
        return value
      }
      return `${value}/100km`
    }
    
    return 'GHS 0/100km'
  }, [car, years])

  const handleImageError = (e) => {
    e.target.src = EmptyCar
    e.target.onerror = null
  }

  return (
    <div
      className={`
        rounded-3xl border-2 p-6 sm:p-8 min-h-[420px]
        flex flex-col lg:flex-row gap-6 lg:gap-8
        transition relative bg-white
        ${borderColor}
        ${isEmpty ? "cursor-pointer hover:shadow-sm" : ""}
      `}
      onClick={isEmpty ? onAdd : undefined}
    >
      {/* LEFT SIDE CONTENT */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Image */}
        <div className="flex justify-center">
          {isEmpty ? (
            <img
              src={EmptyCar}
              alt="Empty Car Slot"
              className="h-32 sm:h-40 lg:h-44 object-contain opacity-50"
            />
          ) : (
            <img
              src={car.image_url || EmptyCar}
              alt={car.fullName || `${car.make} ${car.model}`}
              className="h-32 sm:h-40 lg:h-44 object-contain"
              onError={handleImageError}
            />
          )}
        </div>

        {/* Text */}
        <div className="mt-6">
          {isEmpty && (
            <button
              className={`text-sm font-semibold mb-3 ${
                isPrimary ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Add Car
            </button>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isEmpty ? placeholder : (car.fullName || `${car.make} ${car.model}`)}
          </h2>

          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {isEmpty
              ? "Select a vehicle to compare"
              : car.type === "ev"
              ? "Electric Vehicle (EV)"
              : "Internal Combustion Engine (ICE)"}
          </p>

          {!isEmpty && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAdd()
              }}
              className={`text-sm font-semibold mt-3 cursor-pointer hover:underline ${
                isPrimary ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Change car
            </button>
          )}
        </div>
      </div>

      {/* METRICS */}
      <div className="flex flex-col gap-4 w-full lg:w-56">
        {/* For Year 0 - Show all metrics with dashes */}
        <Metric
          title={years === 0 ? "Total Cost Ownership" : `Total Cost Ownership (Year ${years})`}
          value={tcoValue}
          icon={Wallet}
          active={active}
          variant={variant}
        />
        <Metric
          title={years === 0 ? "Tailpipe Emissions" : `Tailpipe Emissions (Year ${years})`}
          value={emissionsValue}
          icon={LineChart}
          active={active}
          variant={variant}
        />
        <Metric
          title="Fuel Economy"
          value={fuelEconomy}
          icon={Fuel}
          active={active}
          variant={variant}
        />

        {/* Floating icon */}
        <div className="flex justify-end pt-2">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition
              ${
                isPrimary
                  ? active
                    ? "bg-blue-100 text-blue-600"
                    : "bg-blue-50 text-blue-300"
                  : active
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gray-100 text-gray-400"
              }
            `}
          >
            <Car size={18} />
          </div>
        </div>
      </div>
    </div>
  )
}

const Metric = ({ title, value, icon: Icon, active, variant }) => {
  const isPrimary = variant === "primary"

  let bg, border, text, iconColor

  if (isPrimary) {
    bg = active ? "bg-blue-100" : "bg-blue-50"
    border = active ? "border-blue-500" : "border-blue-200"
    text = active ? "text-blue-900" : "text-blue-400"
    iconColor = active ? "text-blue-700" : "text-blue-300"
  } else {
    bg = active ? "bg-gray-200" : "bg-gray-100"
    border = active ? "border-gray-600" : "border-gray-300"
    text = active ? "text-gray-900" : "text-gray-400"
    iconColor = active ? "text-gray-700" : "text-gray-400"
  }

  return (
    <div
      className={`
        relative rounded-2xl p-4 border-r-4 transition
        ${bg} ${border}
      `}
    >
      <div className={`absolute top-3 right-3 ${iconColor}`}>
        <Icon size={20} />
      </div>

      <p className="text-[10px] uppercase font-bold text-gray-500 leading-tight">
        {title}
      </p>

      <p className={`mt-1 text-lg sm:text-xl font-black ${text}`}>
        {value}
      </p>
    </div>
  )
}

export default ComparisonCard