// src/components/PopularPicks.jsx
import { useState, useEffect } from "react"
import { vehicleService } from "../services/vehicleService"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function PopularPicks({
  onSelect,
  search,
  category,
  fuel,
  make,
}) {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [itemsPerPageOptions] = useState([9, 18, 27, 36])

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, category, fuel, make])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const data = await vehicleService.getAllVehicles()
      
      // Clean the data - trim spaces and standardize case for filtering
      const cleanedData = data.map(v => ({
        ...v,
        make: v.make?.trim(),
        category: v.category?.trim(),
        name: v.name?.trim(),
        fullName: v.fullName?.trim(),
        type: v.type,
        // Store original for display
        displayMake: v.make,
        displayCategory: v.category
      }))
      
      console.log('Loaded vehicles:', cleanedData)
      setVehicles(cleanedData)
    } catch (err) {
      console.error('Error loading vehicles:', err)
      setError('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  // Enhanced filtering that matches Supabase data structure (case-insensitive)
  const filteredVehicles = vehicles.filter((car) => {
    // Search filter - case insensitive
    const matchesSearch = search === "" || 
      (car.fullName && car.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (car.make && car.make.toLowerCase().includes(search.toLowerCase())) ||
      (car.name && car.name.toLowerCase().includes(search.toLowerCase()))

    // Category filter - case insensitive
    const matchesCategory = category === "All" || 
      (car.category && car.category.toLowerCase() === category.toLowerCase())

    // Fuel filter - handles both EV and ICE vehicles
    const matchesFuel = fuel === "All" || 
      (fuel === "Electric" && car.type === "ev") ||
      (fuel !== "Electric" && car.type === "ice" && 
       car.fuel && car.fuel.toLowerCase() === fuel.toLowerCase())

    // Make filter - case insensitive
    const matchesMake = make === "All" || 
      (car.make && car.make.toLowerCase() === make.toLowerCase())

    return matchesSearch && matchesCategory && matchesFuel && matchesMake
  })

  // Pagination calculations
  const totalItems = filteredVehicles.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x400/EEE/31343C?text=No+Image'
    e.target.onerror = null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadVehicles}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <section>
      {/* Results count and items per page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> vehicles
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
            Show:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentVehicles.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition"
          >
            {/* Image */}
            <div className="h-40 overflow-hidden rounded-t-xl bg-gray-100">
              <img
                src={car.image_url || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'}
                alt={car.fullName}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain p-2"
                onError={handleImageError}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-semibold text-blue-600 uppercase">
                  {car.displayMake || car.make}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  car.type === 'ev' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {car.type === 'ev' ? 'Electric' : 'ICE'}
                </span>
              </div>

              {/* Full vehicle name - make + model */}
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {car.fullName || `${car.make} ${car.name}`}
              </h3>

              <p className="text-xs text-gray-500 mb-2 truncate">
                {car.displayCategory || car.category}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">HP:</span> {car.horsepower || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">0-60:</span> {car.acceleration_0_60_mph || 'N/A'}s
                </div>
                <div>
                  <span className="font-medium">Top Speed:</span> {car.top_speed_kmh || car.top_speed || 'N/A'}km/h
                </div>
                <div>
                  <span className="font-medium">Seats:</span> {car.seating_capacity || 'N/A'}
                </div>
              </div>

              <button
                onClick={() => onSelect?.(car)}
                className="w-full mt-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredVehicles.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-8">
          No vehicles match your filters.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Go to page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Go to</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value)
                if (page >= 1 && page <= totalPages) {
                  goToPage(page)
                }
              }}
              className="w-16 border rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </section>
  )
}