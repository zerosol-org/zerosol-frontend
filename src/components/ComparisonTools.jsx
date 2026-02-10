import { Plus } from "lucide-react"

export default function ComparisonTools({
  firstCar,
  onChangeFirst,
  onAddSecond
}) {
  return (
    <div className="flex items-center gap-6 mt-6 border-t pt-6">
      {/* TOOLS label */}
      <span className="text-xs tracking-widest text-gray-400 font-semibold">
        TOOLS
      </span>

      {/* Highlight button */}
      <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-sm">
        Highlight Differences
      </button>

      {/* Selected first vehicle */}
      {firstCar && (
        <>
          <div className="h-10 w-px bg-gray-200" />

          <div className="flex items-center gap-3">
            <img
              src={firstCar.image}
              alt={firstCar.name}
              className="w-14 h-10 object-contain"
            />

            <div>
              <p className="text-sm font-medium text-gray-800">
                {firstCar.name}
              </p>

              <div className="flex gap-3 text-xs">
                <button
                  onClick={onChangeFirst}
                  className="text-blue-600 font-medium"
                >
                  Change
                </button>

                <button className="text-gray-400">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add second */}
      <div className="h-10 w-px bg-gray-200" />

      <button
        onClick={onAddSecond}
        className="flex items-center gap-2 px-5 py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-gray-400"
      >
        <Plus size={16} />
        Add Second Car
      </button>
    </div>
  )
}
