import { X, Search } from "lucide-react"
import PopularPicks from "./PopularPicks"

export default function AddVehicleModal({
  open,
  onClose,
  onSelectCar,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add a Vehicle
            </h2>
            <p className="text-sm text-gray-500">
              Find and select a car to compare side-by-side.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Search by make, model or keyword"
            className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All brands</option>
          </select>

          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All makes</option>
          </select>

          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All models</option>
          </select>

          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>Select year</option>
          </select>
        </div>

        {/* Popular Picks */}
        <PopularPicks onSelect={onSelectCar} />
      </div>
    </div>
  )
}
