import { Plus, X, Edit } from "lucide-react"

export default function ComparisonHeader({
  firstCar,
  secondCar,
  onAddFirst,
  onAddSecond,
  onRemoveFirst,
  onRemoveSecond,
}) {
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Plug vs Pump Comparison
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mb-10">
          Side-by-side technical evaluation of premium vehicles. Specs are based on
          2025 manufacturers data
        </p>

        {/* Comparison Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* First Car */}
          {firstCar ? (
            <div className="flex items-center gap-3 border border-dashed border-gray-300 rounded-lg p-3 h-16 bg-gray-50">
              <img 
                src={firstCar.image || "/placeholder-car.jpg"} 
                alt={firstCar.name} 
                className="w-10 h-10 object-contain rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{firstCar.name}</div>
                <div className="text-xs text-gray-500">2025 Model</div>
              </div>
              <button 
                onClick={onAddFirst}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Edit size={14} /> Change
              </button>
              <button 
                onClick={onRemoveFirst}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <button
              onClick={onAddFirst}
              className="flex items-center justify-center gap-2 h-16 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Add First Car</span>
            </button>
          )}

          {/* Second Car */}
          {secondCar ? (
            <div className="flex items-center gap-3 border border-dashed border-gray-300 rounded-lg p-3 h-16 bg-gray-50">
              <img 
                src={secondCar.image || "/placeholder-car.jpg"} 
                alt={secondCar.name} 
                className="w-10 h-10 object-contain rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{secondCar.name}</div>
                <div className="text-xs text-gray-500">2025 Model</div>
              </div>
              <button 
                onClick={onAddSecond}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Edit size={14} /> Change
              </button>
              <button 
                onClick={onRemoveSecond}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <button
              onClick={onAddSecond}
              className="flex items-center justify-center gap-2 h-16 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Add Second Car</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}