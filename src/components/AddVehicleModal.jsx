// src/components/AddVehicleModal.jsx
import { useState, useEffect } from "react"
import { X, Search, RotateCcw } from "lucide-react"
import PopularPicks from "./PopularPicks"
import { vehicleService } from "../services/vehicleService"

export default function AddVehicleModal({
  open,
  onClose,
  onSelectCar,
}) {
  if (!open) return null

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [fuel, setFuel] = useState("All")
  const [make, setMake] = useState("All") // Changed from brand to make
  const [makes, setMakes] = useState([]) // Changed from brands to makes
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch available makes and categories from Supabase
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true)
        const vehicles = await vehicleService.getAllVehicles()
        
        console.log('All vehicles for filter options:', vehicles)
        
        // Extract unique makes - preserve original casing but remove duplicates
        const makeMap = new Map()
        vehicles.forEach(v => {
          if (v.make) { // Using make from database
            const trimmed = v.make.trim()
            makeMap.set(trimmed.toUpperCase(), trimmed)
          }
        })
        
        const uniqueMakes = Array.from(makeMap.values()).sort((a, b) => 
          a.localeCompare(b, undefined, { sensitivity: 'base' })
        )
        
        setMakes(uniqueMakes)
        
        // Extract unique categories - preserve original casing
        const categoryMap = new Map()
        vehicles.forEach(v => {
          if (v.category) {
            const trimmed = v.category.trim()
            categoryMap.set(trimmed.toUpperCase(), trimmed)
          }
        })
        
        const uniqueCategories = Array.from(categoryMap.values()).sort((a, b) => 
          a.localeCompare(b, undefined, { sensitivity: 'base' })
        )
        
        setCategories(uniqueCategories)
        
        console.log('Loaded makes:', uniqueMakes)
        console.log('Loaded categories:', uniqueCategories)
        
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchFilterOptions()
    }
  }, [open])

  const resetFilters = () => {
    setSearch("")
    setCategory("All")
    setFuel("All")
    setMake("All") // Changed from brand to make
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
            placeholder="Search by make, model or keyword"
            className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {/* Category - Dynamically populated from Supabase */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            disabled={loading}
          >
            <option value="All">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Fuel - Updated to match database values */}
          <select
            value={fuel}
            onChange={(e) => setFuel(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All fuel types</option>
            <option value="Electric">Electric (EV)</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          {/* Make - Dynamically populated from Supabase */}
          <select
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
            disabled={loading}
          >
            <option value="All">All makes</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
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

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Car List */}
        {!loading && (
          <PopularPicks
            search={search}
            category={category}
            fuel={fuel}
            make={make} // Changed from brand to make
            onSelect={onSelectCar}
          />
        )}
      </div>
    </div>
  )
}