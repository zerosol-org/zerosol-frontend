const cars = [
  {
    id: 1,
    brand: "Tesla",
    name: "2024 Model 3",
    spec: "Long Range Dual Motor",
    category: "Sedan",
    fuel: "Electric",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    brand: "Porsche",
    name: "Taycan Turbo S",
    spec: "Electric Sedan",
    category: "Sedan",
    fuel: "Electric",
    image:
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    brand: "BMW",
    name: "BMW iX3",
    spec: "Long Range",
    category: "SUV",
    fuel: "Electric",
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    brand: "Audi",
    name: "Q8 e-tron",
    spec: "Premium SUV",
    category: "SUV",
    fuel: "Electric",
    image:
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: 5,
    brand: "Toyota",
    name: "RAV4 Hybrid",
    spec: "Hybrid SUV",
    category: "SUV",
    fuel: "Hybrid",
    image:
      "https://images.unsplash.com/photo-1549927681-0b673b8243ab?w=600&q=80&auto=format&fit=crop",
  },
  {
    id: 6,
    brand: "Honda",
    name: "Civic",
    spec: "Compact Sedan",
    category: "Sedan",
    fuel: "Petrol",
    image:
      "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=600&q=80&auto=format&fit=crop",
  },
]

export default function PopularPicks({
  onSelect,
  search,
  category,
  fuel,
  brand,
}) {
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(search.toLowerCase()) ||
      car.brand.toLowerCase().includes(search.toLowerCase())

    return (
      matchesSearch &&
      (category === "All" || car.category === category) &&
      (fuel === "All" || car.fuel === fuel) &&
      (brand === "All" || car.brand === brand)
    )
  })

  return (
    <section>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition"
          >
            {/* Image */}
            <div className="h-40 overflow-hidden rounded-t-xl bg-gray-100">
              <img
                src={car.image}
                alt={car.name}
                loading="lazy"
                decoding="async"
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

      {filteredCars.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-8">
          No vehicles match your filters.
        </p>
      )}
    </section>
  )
}
