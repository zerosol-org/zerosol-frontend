const cars = [
  {
    id: 1,
    brand: "TESLA",
    name: "2024 Model 3",
    spec: "Long Range Dual Motor",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    brand: "PORSCHE",
    name: "Taycan Turbo S",
    spec: "Electric Sedan",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=400&q=80&fit=crop",
  },
  {
    id: 3,
    brand: "BMW",
    name: "BYD BX3",
    spec: "Long Range Dual Motor",
    image: "https://images.unsplash.com/photo-1549927681-0b673b8243ab?w-800&auto=format&fit=crop",
  },
  {
    id: 4,
    brand: "XIAOMI",
    name: "SU7",
    spec: "Long Range Dual Motor",
    image: "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    brand: "AUDI",
    name: "Audi Q8 e-tron",
    spec: "Long Range Dual Motor",
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    brand: "BMW",
    name: "BMW iX3",
    spec: "Long Range Dual Motor",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop",
  },
]

export default function PopularPicks({ onSelect }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Popular Picks
        </h2>

        <button className="text-sm text-blue-600 hover:underline">
          View all
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition"
          >
            {/* Image */}
            <div className="h-40 overflow-hidden rounded-t-xl bg-gray-100">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
                {car.brand}
              </p>

              <h3 className="text-sm font-semibold text-gray-900">
                {car.name}
              </h3>

              <p className="text-xs text-gray-500 mb-4">
                {car.spec}
              </p>

              <button
                onClick={() => onSelect?.(car)}
                className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
