// src/components/ComparisonSpecs.jsx
const ComparisonSpecs = ({ leftCar, rightCar, onReset, years = 3 }) => {
  const leftActive = Boolean(leftCar)
  const rightActive = Boolean(rightCar)

  console.log("Rendering ComparisonSpecs with:")
  console.log("Left Car:", leftCar)
  console.log("Right Car:", rightCar)

  // Helper functions to get values based on car type
  const getFuelEconomyValues = (car) => {
    console.log("Calculating fuel economy values for car:", car)
    if (!car) return { per100km: '-', perYear: '-', annual: '-' }
    
    if (car.type === 'EV') {
      // EV: kWh consumption
      return {
        per100km: car.fuel_economy_per_100km ? `₵${car.fuel_economy_per_100km}` : '-',
        perYear: car.annual_fuel_economy ? `₵${car.annual_fuel_economy}` : '-',
        annual: car.annual_fuel_economy ? `₵${(car.annual_fuel_economy)}` : '-'
      }
    } else {
      // ICE: Fuel consumption
      return {
        per100km: car.fuel_economy_per_100km ? `₵${car.fuel_economy_per_100km}` : '-',
        perYear: car.annual_fuel_economy ? `₵${car.annual_fuel_economy}` : '-',
        annual: car.annual_fuel_economy ? `₵${car.annual_fuel_economy}` : '-'
      }
    }
  }

  const getEmissionsValues = (car) => {
    if (!car) return { per100km: '-', perYear: '-', annual: '-' }

    return {
      per100km: car.tailpipe_emissions_per_100km ? `${car.tailpipe_emissions_per_100km} kgCO₂e` : '-',
      perYear: car.annual_tailpipe_emissions ? `${(car.annual_tailpipe_emissions)} kgCO₂e` : '-',
      annual: car.annual_tailpipe_emissions ? `${car.annual_tailpipe_emissions} kgCO₂e` : '-'
    }
    
  }

  const getMaintenanceValues = (car) => {
    if (!car) return { per100km: '-', perYear: '-', annual: '-' }
    
    return {
      per100km: car.avg_maintenance_cost_per_100km ? `₵${car.avg_maintenance_cost_per_100km}` : '-',
      perYear: car.annual_maintenance_cost ? `₵${car.annual_maintenance_cost.toLocaleString()}` : '-',
      annual: car.annual_maintenance_cost ? `₵${car.annual_maintenance_cost.toLocaleString()}` : '-'
    }
  }

  const leftFuel = getFuelEconomyValues(leftCar)
  const rightFuel = getFuelEconomyValues(rightCar)
  const leftEmissions = getEmissionsValues(leftCar)
  const rightEmissions = getEmissionsValues(rightCar)
  const leftMaintenance = getMaintenanceValues(leftCar)
  const rightMaintenance = getMaintenanceValues(rightCar)

  // Get TCO for the selected year
  const getTCO = (car, year) => {
    if (!car?.tco) return '-'
    const yearKey = `year${year}`
    return car.tco[yearKey] ? `₵${car.tco[yearKey].toLocaleString()}` : '-'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* TOP SUMMARY */}
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

      {/* KEY HIGHLIGHTS */}
      <SpecSection
        title="Key Highlights"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["Seating Capacity", 
           leftCar?.seating_capacity ? `${leftCar.seating_capacity} seats` : '-',
           rightCar?.seating_capacity ? `${rightCar.seating_capacity} seats` : '-'],
          
          ["Drivetrain", 
           leftCar?.drive_type || leftCar?.type || '-',
           rightCar?.drive_type || rightCar?.type || '-'],
          
          ["Ground Clearance", 
           leftCar?.ground_clearance_mm || leftCar?.ground_clearance ? `${leftCar.ground_clearance_mm || leftCar.ground_clearance} mm` : '-',
           rightCar?.ground_clearance_mm || rightCar?.ground_clearance ? `${rightCar.ground_clearance_mm || rightCar.ground_clearance} mm` : '-'],
          
          ["Apple CarPlay", 
           leftCar?.apple_car_play ? 'Yes' : leftCar?.apple_car_play === false ? 'No' : '-',
           rightCar?.apple_car_play ? 'Yes' : rightCar?.apple_car_play === false ? 'No' : '-'],
          
          ["Any OEM Tech Onboard", 
           leftCar?.android_auto ? 'Yes' : leftCar?.android_auto === false ? 'No' : '-',
           rightCar?.android_auto ? 'Yes' : rightCar?.android_auto === false ? 'No' : '-'],
        ]}
      />

      {/* BODY AND SUSPENSION */}
      <SpecSection
        title="Body and Suspension"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["Body Type", 
           leftCar?.body_type || leftCar?.category || '-',
           rightCar?.body_type || rightCar?.category || '-'],
          
          ["Drive Type", 
           leftCar?.drive_type || leftCar?.type || '-',
           rightCar?.drive_type || rightCar?.type || '-'],
          
          ["Cargo Capacity", 
           leftCar?.cargo_capacity_l || leftCar?.cargo_capacity ? `${leftCar.cargo_capacity_l || leftCar.cargo_capacity} L` : '-',
           rightCar?.cargo_capacity_l || rightCar?.cargo_capacity ? `${rightCar.cargo_capacity_l || rightCar.cargo_capacity} L` : '-'],
        ]}
      />

      {/* ENGINE AND PERFORMANCE */}
      <SpecSection
        title="Engine and Performance"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["0–60 mph", 
           leftCar?.acceleration ? `${leftCar.acceleration} seconds` : '-',
           rightCar?.acceleration ? `${rightCar.acceleration} seconds` : '-'],
          
          ["Top Speed", 
           leftCar?.top_speed_kmh || leftCar?.top_speed ? `${leftCar.top_speed_kmh || leftCar.top_speed} km/h` : '-',
           rightCar?.top_speed_kmh || rightCar?.top_speed ? `${rightCar.top_speed_kmh || rightCar.top_speed} km/h` : '-'],
          
          ["Horsepower", 
           leftCar?.horsepower ? `${leftCar.horsepower} hp` : '-',
           rightCar?.horsepower ? `${rightCar.horsepower} hp` : '-'],
          
          ["Engine Type", 
           leftCar?.engine_type || leftCar?.type || '-',
           rightCar?.engine_type || rightCar?.type || '-'],
        ]}
      />

      {/* COST SUMMARY (Optional) */}
      <SpecSection
        title={`Cost Summary (Year ${years})`}
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["Total Cost of Ownership", 
           getTCO(leftCar, years),
           getTCO(rightCar, years)],
          
          ["Price (GHS)", 
           leftCar?.price_ghs ? `₵${leftCar.price_ghs.toLocaleString()}` : '-',
           rightCar?.price_ghs ? `₵${rightCar.price_ghs.toLocaleString()}` : '-'],
          
          ["Price (USD)", 
           leftCar?.price_usd ? `$${leftCar.price_usd.toLocaleString()}` : '-',
           rightCar?.price_usd ? `$${rightCar.price_usd.toLocaleString()}` : '-'],
        ]}
      />

      {/* CTA */}
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

/* ================= SUMMARY ROW ================= */

const SummaryRow = ({ label, leftValues, rightValues, leftActive, rightActive }) => (
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-start w-full">
    <div className="w-full sm:w-40 text-sm sm:text-base font-medium text-gray-600 pt-2">
      {label}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full">
      {/* LEFT CAR */}
      <div className="space-y-1">
        {/* Column headers for left side */}
        <div className="grid grid-cols-3 gap-2 px-2 mb-1">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">
            Per 100km
          </div>
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">
            Per Year
          </div>
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider text-center">
            Annual Cost
          </div>
        </div>
        
        {/* Values */}
        <div
          className={`grid grid-cols-3 gap-2 p-2 rounded-xl transition
            ${leftActive ? "bg-blue-100" : "bg-blue-50"}
          `}
        >
          <SummaryPill side="left" active={leftActive} value={leftValues?.per100km || '-'} />
          <SummaryPill side="left" active={leftActive} value={leftValues?.perYear || '-'} />
          <SummaryPill side="left" active={leftActive} value={leftValues?.annual || '-'} />
        </div>
      </div>

      {/* RIGHT CAR */}
      <div className="space-y-1">
        {/* Column headers for right side */}
        <div className="grid grid-cols-3 gap-2 px-2 mb-1">
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">
            Per 100km
          </div>
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">
            Per Year
          </div>
          <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider text-center">
            Annual Cost
          </div>
        </div>
        
        {/* Values */}
        <div
          className={`grid grid-cols-3 gap-2 p-2 rounded-xl transition
            ${rightActive ? "bg-gray-200" : "bg-gray-100"}
          `}
        >
          <SummaryPill side="right" active={rightActive} value={rightValues?.per100km || '-'} />
          <SummaryPill side="right" active={rightActive} value={rightValues?.perYear || '-'} />
          <SummaryPill side="right" active={rightActive} value={rightValues?.annual || '-'} />
        </div>
      </div>
    </div>
  </div>
)

/* ================= SUMMARY PILL ================= */

const SummaryPill = ({ value, active, side }) => {
  const isLeft = side === "left"

  const activeStyles = isLeft
    ? "bg-white text-blue-700"
    : "bg-white text-gray-700"

  const inactiveStyles = isLeft
    ? "bg-white text-blue-300"
    : "bg-white text-gray-400"

  return (
    <div
      className={`text-xs sm:text-sm font-semibold text-center py-2 rounded-lg transition truncate
        ${active ? activeStyles : inactiveStyles}
      `}
      title={value}
    >
      {value}
    </div>
  )
}

/* ================= SPEC SECTION ================= */

const SpecSection = ({ title, rows, leftActive, rightActive }) => (
  <div className="mb-6 sm:mb-12">
    <h3 className="text-sm sm:text-base font-semibold text-gray-500 mb-3 sm:mb-4">
      {title}
    </h3>

    <div className="space-y-2">
      {rows.map(([label, left, right], idx) => (
        <SpecRow
          key={idx}
          label={label}
          left={left}
          right={right}
          leftActive={leftActive}
          rightActive={rightActive}
        />
      ))}
    </div>
  </div>
)

/* ================= SPEC ROW ================= */

const SpecRow = ({ label, left, right, leftActive, rightActive }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_1fr] gap-4 sm:gap-6">

    {/* LABEL */}
    <div className="text-sm sm:text-base text-gray-600 py-2 sm:py-3">
      {label}
    </div>

    {/* LEFT CAR */}
    <div
      className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition text-left
        ${leftActive
          ? "bg-blue-100 text-blue-900"
          : "bg-blue-50 text-blue-300"
        }
      `}
    >
      {left}
    </div>

    {/* RIGHT CAR */}
    <div
      className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition text-left
        ${rightActive
          ? "bg-gray-200 text-gray-900"
          : "bg-gray-100 text-gray-400"
        }
      `}
    >
      {right}
    </div>

  </div>
)

export default ComparisonSpecs