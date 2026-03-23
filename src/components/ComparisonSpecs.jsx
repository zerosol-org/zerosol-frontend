// src/components/ComparisonSpecs.jsx
import { useMemo } from 'react'

const ComparisonSpecs = ({ leftCar, rightCar, onReset, years = 3 }) => {
  const leftActive = Boolean(leftCar)
  const rightActive = Boolean(rightCar)

  // Helper to get initial price
  const getInitialPrice = (car) => {
    if (!car) return 0
    
    let price = null
    if (car.price_ghs) price = parseFloat(car.price_ghs)
    else if (car['Price (GHS)']) price = parseFloat(car['Price (GHS)'])
    else if (car.price_usd) price = parseFloat(car.price_usd) * 12.01
    else if (car['Price (USD)']) price = parseFloat(car['Price (USD)']) * 12.01
    
    return !isNaN(price) && price > 0 ? price : 0
  }

  // Get TCO for the selected year
  const getTCO = (car, year) => {
    if (!car) return '-'
    
    // YEARS 1-5: Get TCO data
    let tcoValue = null
    
    if (car.tco) {
      const yearKey = `year${year}`
      tcoValue = car.tco[yearKey]
    }
    if (!tcoValue) {
      const tcoField = `tco_yr${year}`
      tcoValue = car[tcoField]
    }
    if (!tcoValue) {
      const sheetField = `TCO Yr${year}`
      tcoValue = car[sheetField]
    }
    
    if (tcoValue && !isNaN(parseFloat(tcoValue))) {
      return `₵${parseFloat(tcoValue).toLocaleString()}`
    }
    
    return '-'
  }

  // Memoize TCO values for left and right cars
  const leftTCO = useMemo(() => getTCO(leftCar, years), [leftCar, years])
  const rightTCO = useMemo(() => getTCO(rightCar, years), [rightCar, years])

  // Fuel Economy Values
  const getFuelEconomyValues = (car) => {
    if (!car) return { per1km: '-', per100km: '-', annual: '-' }
    
    return {
      per1km: car.fuel_economy_per_km ? `${car.fuel_economy_per_km}/km` : '-',
      per100km: car.fuel_economy_per_100km ? `${car.fuel_economy_per_100km}/100km` : '-',
      annual: car.annual_fuel_economy ? `${car.annual_fuel_economy}` : '-'
    }
  }

  // Emissions Values
  const getEmissionsValues = (car) => {
    if (!car) return { per1km: '-', per100km: '-', annual: '-' }

    return {
      per1km: car.tailpipe_emissions_per_km ? `${car.tailpipe_emissions_per_km}` : '-',
      per100km: car.tailpipe_emissions_per_100km ? `${car.tailpipe_emissions_per_100km}` : '-',
      annual: car.annual_tailpipe_emissions ? `${car.annual_tailpipe_emissions}` : '-'
    }
  }

  // Maintenance Values
  const getMaintenanceValues = (car) => {
    if (!car) return { per1km: '-', per100km: '-', annual: '-' }
    
    return {
      per1km: car.avg_maintenance_cost_per_km ? `₵${car.avg_maintenance_cost_per_km}/km` : '-',
      per100km: car.avg_maintenance_cost_per_100km ? `₵${car.avg_maintenance_cost_per_100km}/100km` : '-',
      annual: car.annual_maintenance_cost ? `₵${car.annual_maintenance_cost.toLocaleString()}` : '-'
    }
  }

  // Get Price
  const getPrice = (car, type) => {
    if (!car) return '-'
    if (type === 'ghs') {
      const price = car.price_ghs || car['Price (GHS)']
      return price ? `₵${parseFloat(price).toLocaleString()}` : '-'
    }
    const price = car.price_usd || car['Price (USD)']
    return price ? `$${parseFloat(price).toLocaleString()}` : '-'
  }

  // Memoize values
  const leftFuel = useMemo(() => getFuelEconomyValues(leftCar), [leftCar])
  const rightFuel = useMemo(() => getFuelEconomyValues(rightCar), [rightCar])
  const leftEmissions = useMemo(() => getEmissionsValues(leftCar), [leftCar])
  const rightEmissions = useMemo(() => getEmissionsValues(rightCar), [rightCar])
  const leftMaintenance = useMemo(() => getMaintenanceValues(leftCar), [leftCar])
  const rightMaintenance = useMemo(() => getMaintenanceValues(rightCar), [rightCar])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* TOP SUMMARY - Only show for years 1-5 */}
      {years > 0 ? (
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-12">
          <SummaryRow
            label="Fuel Economy"
            leftValues={leftFuel}
            rightValues={rightFuel}
            leftActive={leftActive}
            rightActive={rightActive}
          />
          <SummaryRow
            label="Emissions"
            leftValues={leftEmissions}
            rightValues={rightEmissions}
            leftActive={leftActive}
            rightActive={rightActive}
          />
          <SummaryRow
            label="Maintenance"
            leftValues={leftMaintenance}
            rightValues={rightMaintenance}
            leftActive={leftActive}
            rightActive={rightActive}
          />
        </div>
      ) : (
        // Year 0: Show empty state with dashes
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-12">
          <EmptySummaryRow label="Fuel Economy" />
          <EmptySummaryRow label="Emissions" />
          <EmptySummaryRow label="Maintenance" />
        </div>
      )}

      {/* KEY HIGHLIGHTS - Always show with dashes for Year 0 */}
      <SpecSection
        title="Key Highlights"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["Seating Capacity", 
           years > 0 ? (leftCar?.seating_capacity ? `${leftCar.seating_capacity} seats` : '-') : '-',
           years > 0 ? (rightCar?.seating_capacity ? `${rightCar.seating_capacity} seats` : '-') : '-'],
          
          ["Drivetrain", 
           years > 0 ? (leftCar?.drive_type || leftCar?.type === 'ev' ? 'Electric' : leftCar?.type || '-') : '-',
           years > 0 ? (rightCar?.drive_type || rightCar?.type === 'ev' ? 'Electric' : rightCar?.type || '-') : '-'],
          
          ["Ground Clearance", 
           years > 0 ? (leftCar?.ground_clearance_mm || leftCar?.ground_clearance ? `${leftCar.ground_clearance_mm || leftCar.ground_clearance} mm` : '-') : '-',
           years > 0 ? (rightCar?.ground_clearance_mm || rightCar?.ground_clearance ? `${rightCar.ground_clearance_mm || rightCar.ground_clearance} mm` : '-') : '-'],
          
          ["Apple CarPlay", 
           years > 0 ? (leftCar?.apple_car_play ? 'Yes' : leftCar?.apple_car_play === false ? 'No' : '-') : '-',
           years > 0 ? (rightCar?.apple_car_play ? 'Yes' : rightCar?.apple_car_play === false ? 'No' : '-') : '-'],
          
          ["Android Auto", 
           years > 0 ? (leftCar?.android_auto ? 'Yes' : leftCar?.android_auto === false ? 'No' : '-') : '-',
           years > 0 ? (rightCar?.android_auto ? 'Yes' : rightCar?.android_auto === false ? 'No' : '-') : '-'],
        ]}
      />

      {/* BODY AND SUSPENSION */}
      <SpecSection
        title="Body and Suspension"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["Body Type", 
           years > 0 ? (leftCar?.body_type || leftCar?.category || '-') : '-',
           years > 0 ? (rightCar?.body_type || rightCar?.category || '-') : '-'],
          
          ["Drive Type", 
           years > 0 ? (leftCar?.drive_type || (leftCar?.type === 'ev' ? 'Electric' : '-')) : '-',
           years > 0 ? (rightCar?.drive_type || (rightCar?.type === 'ev' ? 'Electric' : '-')) : '-'],
          
          ["Cargo Capacity", 
           years > 0 ? (leftCar?.cargo_capacity_l || leftCar?.cargo_capacity ? `${leftCar.cargo_capacity_l || leftCar.cargo_capacity} L` : '-') : '-',
           years > 0 ? (rightCar?.cargo_capacity_l || rightCar?.cargo_capacity ? `${rightCar.cargo_capacity_l || rightCar.cargo_capacity} L` : '-') : '-'],
        ]}
      />

      {/* ENGINE AND PERFORMANCE */}
      <SpecSection
        title="Engine and Performance"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["0–60 mph", 
           years > 0 ? (leftCar?.acceleration_0_60_mph ? `${leftCar.acceleration_0_60_mph} seconds` : '-') : '-',
           years > 0 ? (rightCar?.acceleration_0_60_mph ? `${rightCar.acceleration_0_60_mph} seconds` : '-') : '-'],
          
          ["Top Speed", 
           years > 0 ? (leftCar?.top_speed_kmh || leftCar?.top_speed ? `${leftCar.top_speed_kmh || leftCar.top_speed} km/h` : '-') : '-',
           years > 0 ? (rightCar?.top_speed_kmh || rightCar?.top_speed ? `${rightCar.top_speed_kmh || rightCar.top_speed} km/h` : '-') : '-'],
          
          ["Horsepower", 
           years > 0 ? (leftCar?.horsepower ? `${leftCar.horsepower} hp` : '-') : '-',
           years > 0 ? (rightCar?.horsepower ? `${rightCar.horsepower} hp` : '-') : '-'],
          
          ["Engine Type", 
           years > 0 ? (leftCar?.engine_type || (leftCar?.type === 'ev' ? 'Electric Motor' : '-')) : '-',
           years > 0 ? (rightCar?.engine_type || (rightCar?.type === 'ev' ? 'Electric Motor' : '-')) : '-'],
        ]}
      />

      {/* COST SUMMARY - Conditional based on years */}
      {years === 0 ? (
        // Year 0: Show all dashes
        <SpecSection
          title="Cost Summary"
          leftActive={leftActive}
          rightActive={rightActive}
          rows={[
            ["Total Cost of Ownership", "-", "-"],
            ["Price (GHS)", "-", "-"],
            ["Price (USD)", "-", "-"],
          ]}
        />
      ) : (
        // Years 1-5: Show full cost summary
        <SpecSection
          title={`Cost Summary (Year ${years})`}
          leftActive={leftActive}
          rightActive={rightActive}
          rows={[
            ["Total Cost of Ownership", leftTCO, rightTCO],
            ["Price (GHS)", getPrice(leftCar, 'ghs'), getPrice(rightCar, 'ghs')],
            ["Price (USD)", getPrice(leftCar, 'usd'), getPrice(rightCar, 'usd')],
          ]}
        />
      )}

      {/* CTA Button */}
      <div className="flex justify-center mt-8 sm:mt-12">
        <button
          onClick={onReset}
          className="px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-black text-white text-sm sm:text-base font-medium hover:bg-gray-900 transition w-full sm:w-auto"
        >
          Start New Comparison
        </button>
      </div>
    </div>
  )
}

// ================= SUMMARY ROW =================
const SummaryRow = ({ label, leftValues, rightValues, leftActive, rightActive }) => (
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-start w-full">
    <div className="w-full sm:w-40 text-sm sm:text-base font-medium text-gray-600 pt-2">
      {label}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full">
      {/* LEFT CAR */}
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 mb-1">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">Per 1km</div>
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">Per 100km</div>
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">Annual Cost</div>
        </div>
        <div className={`grid grid-cols-3 gap-2 p-2 rounded-xl transition ${leftActive ? "bg-blue-100" : "bg-blue-50"}`}>
          <SummaryPill side="left" active={leftActive} value={leftValues?.per1km || '-'} />
          <SummaryPill side="left" active={leftActive} value={leftValues?.per100km || '-'} />
          <SummaryPill side="left" active={leftActive} value={leftValues?.annual || '-'} />
        </div>
      </div>
      {/* RIGHT CAR */}
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 mb-1">
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">Per 1km</div>
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">Per 100km</div>
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">Annual Cost</div>
        </div>
        <div className={`grid grid-cols-3 gap-2 p-2 rounded-xl transition ${rightActive ? "bg-gray-200" : "bg-gray-100"}`}>
          <SummaryPill side="right" active={rightActive} value={rightValues?.per1km || '-'} />
          <SummaryPill side="right" active={rightActive} value={rightValues?.per100km || '-'} />
          <SummaryPill side="right" active={rightActive} value={rightValues?.annual || '-'} />
        </div>
      </div>
    </div>
  </div>
)

// ================= EMPTY SUMMARY ROW (for Year 0) =================
const EmptySummaryRow = ({ label }) => (
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-start w-full">
    <div className="w-full sm:w-40 text-sm sm:text-base font-medium text-gray-600 pt-2">
      {label}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full">
      {/* LEFT CAR - Empty */}
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 mb-1">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">Per 1km</div>
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">Per 100km</div>
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">Annual Cost</div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-blue-50">
          <div className="text-xs font-semibold text-center py-2 rounded-lg bg-white text-blue-300">-</div>
          <div className="text-xs font-semibold text-center py-2 rounded-lg bg-white text-blue-300">-</div>
          <div className="text-xs font-semibold text-center py-2 rounded-lg bg-white text-blue-300">-</div>
        </div>
      </div>
      {/* RIGHT CAR - Empty */}
      <div className="space-y-1">
        <div className="grid grid-cols-3 gap-2 px-2 mb-1">
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">Per 1km</div>
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">Per 100km</div>
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">Annual Cost</div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-gray-100">
          <div className="text-xs font-semibold text-center py-2 rounded-lg bg-white text-gray-400">-</div>
          <div className="text-xs font-semibold text-center py-2 rounded-lg bg-white text-gray-400">-</div>
          <div className="text-xs font-semibold text-center py-2 rounded-lg bg-white text-gray-400">-</div>
        </div>
      </div>
    </div>
  </div>
)

// ================= SUMMARY PILL =================
const SummaryPill = ({ value, active, side }) => {
  const isLeft = side === "left"
  const activeStyles = isLeft ? "bg-white text-blue-700" : "bg-white text-gray-700"
  const inactiveStyles = isLeft ? "bg-white text-blue-300" : "bg-white text-gray-400"

  return (
    <div className={`text-xs sm:text-sm font-semibold text-center py-2 rounded-lg transition truncate ${active ? activeStyles : inactiveStyles}`} title={value}>
      {value}
    </div>
  )
}

// ================= SPEC SECTION =================
const SpecSection = ({ title, rows, leftActive, rightActive }) => (
  <div className="mb-6 sm:mb-12">
    <h3 className="text-sm sm:text-base font-semibold text-gray-500 mb-3 sm:mb-4">{title}</h3>
    <div className="space-y-2">
      {rows.map(([label, left, right], idx) => (
        <SpecRow key={idx} label={label} left={left} right={right} leftActive={leftActive} rightActive={rightActive} />
      ))}
    </div>
  </div>
)

// ================= SPEC ROW =================
const SpecRow = ({ label, left, right, leftActive, rightActive }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_1fr] gap-4 sm:gap-6">
    <div className="text-sm sm:text-base text-gray-600 py-2 sm:py-3">{label}</div>
    <div className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition text-left ${leftActive ? "bg-blue-100 text-blue-900" : "bg-blue-50 text-blue-300"}`}>
      {left}
    </div>
    <div className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition text-left ${rightActive ? "bg-gray-200 text-gray-900" : "bg-gray-100 text-gray-400"}`}>
      {right}
    </div>
  </div>
)

export default ComparisonSpecs