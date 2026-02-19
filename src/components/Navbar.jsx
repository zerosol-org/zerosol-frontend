// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, X, Search, XCircle } from "lucide-react"
import Logo from "../assets/logo.png"
import { vehicleService } from "../services/vehicleService"

export default function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const searchTimeout = useRef(null)

  const navLinks = [
    // { name: "Home", path: "/" },
    // { name: "Compare", path: "/compare" },
    // { name: "Car Finder", path: "/car-finder" },
  ]

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // Set new timeout
    searchTimeout.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await vehicleService.searchVehicles(searchQuery)
        
        // Format results for display
        const formattedResults = results.map(v => ({
          id: v.id,
          make: v.make,
          model: v.model,
          fullName: `${v.make} ${v.model}`,
          category: v.category,
          type: v.type || (v.engine_type ? 'ICE' : 'EV'),
          image: v.image_url || 'https://placehold.co/100x60/EEE/31343C?text=No+Image'
        }))
        
        setSearchResults(formattedResults)
        setShowResults(true)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [searchQuery])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSelectVehicle = (vehicle) => {
    setSearchQuery("")
    setShowResults(false)
    // Navigate to vehicle details or comparison
    navigate(`/vehicle/${vehicle.type}/${vehicle.id}`)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1E3A8A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <img
            src={Logo}
            alt="Zerosol Fleets"
            className="w-[9rem] object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive
                      ? "text-white"
                      : "text-blue-200 hover:text-white"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by brand or model..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                className="w-64 rounded-full bg-blue-700/40 text-sm text-white placeholder-blue-200 px-4 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => handleSelectVehicle(vehicle)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                      >
                        <img
                          src={vehicle.image}
                          alt={vehicle.fullName}
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {vehicle.fullName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {vehicle.category}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              vehicle.type === 'EV' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {vehicle.type}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No vehicles found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#1E3A8A] border-t border-blue-700">
          <div className="px-6 py-6 space-y-5">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by brand or model..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-full bg-blue-700/40 text-sm text-white placeholder-blue-200 px-4 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-200" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {searchQuery.length >= 2 && (
              <div className="bg-blue-800/30 rounded-lg overflow-hidden">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => {
                          handleSelectVehicle(vehicle)
                          setOpen(false)
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-blue-700/50 transition border-b border-blue-700 last:border-0"
                      >
                        <img
                          src={vehicle.image}
                          alt={vehicle.fullName}
                          className="w-12 h-12 object-contain rounded bg-white"
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">
                            {vehicle.fullName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-blue-200">
                              {vehicle.category}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              vehicle.type === 'EV' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-orange-600 text-white'
                            }`}>
                              {vehicle.type}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-blue-200">
                    No vehicles found
                  </div>
                )}
              </div>
            )}

            {/* Links */}
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-medium ${
                      isActive
                        ? "text-white"
                        : "text-blue-200 hover:text-white"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}