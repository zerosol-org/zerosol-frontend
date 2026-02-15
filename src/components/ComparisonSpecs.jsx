const ComparisonSpecs = ({ leftCar, rightCar, onReset }) => {
  const leftActive = Boolean(leftCar)
  const rightActive = Boolean(rightCar)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* TOP SUMMARY */}
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-12">
        <SummaryRow
          label="Fuel Economy"
          leftActive={leftActive}
          rightActive={rightActive}
        />
        <SummaryRow
          label="Emissions"
          leftActive={leftActive}
          rightActive={rightActive}
        />
        <SummaryRow
          label="Maintenance"
          leftActive={leftActive}
          rightActive={rightActive}
        />
      </div>

      {/* TABLE SECTIONS */}
      <SpecSection
        title="Key Highlights"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["Seating Capacity", "4/5 seats", "5 seats"],
          ["Drivetrain", "RWD", "FWD"],
          ["Ground Clearance", "180 mm", "210 mm"],
          ["Apple CarPlay", "Yes", "Yes"],
          ["Android Auto", "Yes", "Yes"],
        ]}
      />

      <SpecSection
        title="Body and Suspension"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["Body Type", "5-door Hatchback", "5-door Hatchback"],
          ["Drive Type", "Rear Wheel Drive", "Front Wheel Drive"],
          ["Cargo Capacity", "350 L", "410 L"],
        ]}
      />

      <SpecSection
        title="Engine and Performance"
        leftActive={leftActive}
        rightActive={rightActive}
        rows={[
          ["0–60 mph", "5.5 seconds", "4.2 seconds"],
          ["Top Speed", "150 mph", "145 mph"],
          ["Horsepower", "182 hp", "169 hp"],
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

const SummaryRow = ({ label, leftActive, rightActive }) => (
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center w-full">
    <div className="w-full sm:w-40 text-sm sm:text-base font-medium text-gray-600">
      {label}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full">
      {/* LEFT CAR */}
      <div
        className={`grid grid-cols-3 gap-2 p-2 rounded-xl transition
          ${leftActive ? "bg-blue-100" : "bg-blue-50"}
        `}
      >
        <SummaryPill side="left" active={leftActive} value="per 100km" />
        <SummaryPill side="left" active={leftActive} value="per year" />
        <SummaryPill side="left" active={leftActive} value="annual" />
      </div>

      {/* RIGHT CAR */}
      <div
        className={`grid grid-cols-3 gap-2 p-2 rounded-xl transition
          ${rightActive ? "bg-gray-200" : "bg-gray-100"}
        `}
      >
        <SummaryPill side="right" active={rightActive} value="per 100km" />
        <SummaryPill side="right" active={rightActive} value="per year" />
        <SummaryPill side="right" active={rightActive} value="annual" />
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
      className={`text-xs sm:text-sm font-semibold text-center py-2 rounded-lg transition
        ${active ? activeStyles : inactiveStyles}
      `}
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
      {leftActive ? left : "-"}
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
      {rightActive ? right : "-"}
    </div>

  </div>
)

export default ComparisonSpecs
