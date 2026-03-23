// src/components/ComparisonPeriod.jsx
export default function ComparisonPeriod({ years, setYears }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <h3 className="font-semibold text-gray-800">
          Select comparison period (Years)
        </h3>
      </div>

      <input
        type="range"
        min="0"
        max="5"
        step="1"
        value={years}
        onChange={(e) => {
          console.log('Slider changed to:', e.target.value)
          setYears(parseInt(e.target.value))
        }}
        className="w-full accent-blue-600"
      />

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {[0, 1, 2, 3, 4, 5].map((year) => (
          <button
            key={year}
            onClick={() => {
              console.log('Button clicked for year:', year)
              setYears(year)
            }}
            className={`hover:text-blue-600 transition px-2 py-1 rounded ${
              years === year ? 'text-blue-600 font-semibold bg-blue-50' : ''
            }`}
          >
            {year === 0 ? 'Initial (0y)' : `${year}${year > 1 ? 'y' : 'y'}`}
          </button>
        ))}
      </div>
      
      {years === 0 && (
        <p className="text-xs text-blue-600 mt-2 text-center">
          Year 0
        </p>
      )}
    </div>
  )
}