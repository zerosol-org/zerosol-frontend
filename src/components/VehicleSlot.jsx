import { Plus } from "lucide-react"

export default function VehicleSlot({
  car,
  title,
  onAdd,
}) {
  // EMPTY STATE
  if (!car) {
    return (
      <button
        onClick={onAdd}
        className="border border-dashed border-gray-300 rounded-xl h-72 flex flex-col items-center justify-center text-gray-500 hover:border-gray-400"
      >
        <Plus size={22} />
        <span className="text-sm mt-2">Add Car</span>
      </button>
    )
  }

  // FILLED STATE
  return (
    <div className="bg-white border rounded-xl p-5 flex gap-6 items-center shadow-sm">
      {/* Image */}
      <img
        src={car.image}
        alt={car.name}
        className="w-52 object-contain"
      />

      {/* Info */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {car.name}
        </h3>
        <p className="text-gray-500 text-sm">
          Electric Vehicle (EV)
        </p>
      </div>
    </div>
  )
}
