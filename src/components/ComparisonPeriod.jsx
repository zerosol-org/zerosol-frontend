export default function ComparisonPeriod({ years, setYears }) {
  return (
    <div className="max-w-7xl mx-auto px-6 mt-6">
      <div className="flex items-center gap-2 mb-3">
        📅
        <h3 className="font-semibold text-gray-800">
          Select comparison period (Years)
        </h3>
      </div>

      <input
        type="range"
        min="1"
        max="5"
        value={years}
        onChange={(e) => setYears(Number(e.target.value))}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {[1, 2, 3, 4, 5].map((y) => (
          <span key={y}>{y} Year{y > 1 && "s"}</span>
        ))}
      </div>
    </div>
  )
}
