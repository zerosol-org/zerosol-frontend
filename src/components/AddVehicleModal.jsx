import { useState } from "react"
import { X, Search, RotateCcw } from "lucide-react"
import PopularPicks from "./PopularPicks"

export default function AddVehicleModal({
  open,
  onClose,
  onSelectCar,
}) {
  if (!open) return null

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [fuel, setFuel] = useState("All")
  const [brand, setBrand] = useState("All")

  const resetFilters = () => {
    setSearch("")
    setCategory("All")
    setFuel("All")
    setBrand("All")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, model or keyword"
            className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All categories</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Hatchback">Hatchback</option>
          </select>

          {/* Fuel */}
          <select
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All fuel types</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
          </select>

          {/* Brand */}
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All brands</option>
            <option value="Tesla">Tesla</option>
            <option value="BMW">BMW</option>
            <option value="Audi">Audi</option>
            <option value="Porsche">Porsche</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
          </select>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 text-sm font-medium border rounded-lg px-3 py-2 hover:bg-gray-100 transition"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* Car List */}
        <PopularPicks
          search={search}
          category={category}
          fuel={fuel}
          brand={brand}
          onSelect={onSelectCar}
        />
      </div>
    </div>
  )
}
