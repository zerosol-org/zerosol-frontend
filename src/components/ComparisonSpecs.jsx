const ComparisonSpecs = ({ leftCar, rightCar, onReset  }) => {
  const leftActive = Boolean(leftCar)
  const rightActive = Boolean(rightCar)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* TOP SUMMARY */}
      <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-16">
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
      <div className="flex justify-center mt-12 sm:mt-20">
        <button 
          onClick={onReset}
          className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition w-full sm:w-auto"
        >
          Start New Comparison
        </button>
      </div>
    </div>
  )
}

const SummaryRow = ({ label, leftActive, rightActive }) => (
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center">
    <div className="w-full sm:w-40 text-sm font-medium text-gray-600 pb-1 sm:pb-0">
      {label}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full flex-1">
      {/* Left Car */}
      <div
        className={`grid grid-cols-3 gap-1 sm:gap-2 p-2 rounded-xl transition
          ${leftActive ? "bg-blue-100" : "bg-gray-100"}
        `}
      >
        <SummaryPill active={leftActive} value="per 100km" />
        <SummaryPill active={leftActive} value="per year" />
        <SummaryPill active={leftActive} value="annual" />
      </div>

      {/* Right Car */}
      <div
        className={`grid grid-cols-3 gap-1 sm:gap-2 p-2 rounded-xl transition
          ${rightActive ? "bg-blue-100" : "bg-gray-100"}
        `}
      >
        <SummaryPill active={rightActive} value="per 100km" />
        <SummaryPill active={rightActive} value="per year" />
        <SummaryPill active={rightActive} value="annual" />
      </div>
    </div>
  </div>
)

const SummaryPill = ({ value, active }) => (
  <div
    className={`text-xs font-semibold text-center py-1.5 sm:py-2 rounded-lg transition
      ${active
        ? "bg-white text-blue-700"
        : "bg-white text-gray-400"
      }
    `}
  >
    <span className="hidden xs:inline">{value}</span>
    <span className="xs:hidden text-[10px]">{value.split(' ')[0]}</span>
  </div>
)

const SpecSection = ({ title, rows, leftActive, rightActive }) => (
  <div className="mb-8 sm:mb-16">
    <h3 className="text-sm font-semibold text-gray-500 mb-3 sm:mb-4">
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

const SpecRow = ({ label, left, right, leftActive, rightActive }) => (
  <div className="flex flex-col xs:grid xs:grid-cols-[140px_1fr_1fr] sm:grid-cols-[160px_1fr_1fr] gap-3 xs:gap-4 sm:gap-6">
    {/* Label */}
    <div className="text-sm text-gray-600 py-2 xs:py-3 font-medium xs:font-normal">
      {label}
    </div>

    <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:gap-6 xs:col-span-2">
      {/* Left Car */}
      <div
        className={`py-3 px-4 rounded-lg font-medium transition text-center xs:text-left
          ${leftActive
            ? "bg-blue-100 text-blue-900"
            : "bg-gray-100 text-gray-400"
          }
        `}
      >
        {leftActive ? left : "-"}
      </div>

      {/* Right Car */}
      <div
        className={`py-3 px-4 rounded-lg font-medium transition text-center xs:text-left
          ${rightActive
            ? "bg-blue-100 text-blue-900"
            : "bg-gray-100 text-gray-400"
          }
        `}
      >
        {rightActive ? right : "-"}
      </div>
    </div>
  </div>
)

export default ComparisonSpecs