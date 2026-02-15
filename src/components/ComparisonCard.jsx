import { Wallet, LineChart, Fuel, Car } from "lucide-react"
import EmptyCar from "../assets/emptyCar.png"

const ComparisonCard = ({
  car,
  placeholder,
  onAdd,
  variant = "primary", // "primary" = left | "secondary" = right
}) => {
  const isEmpty = !car
  const isPrimary = variant === "primary"
  const active = !isEmpty

  // Border colors per side + state
  const borderColor = isPrimary
    ? active
      ? "border-blue-500"
      : "border-blue-200"
    : active
    ? "border-gray-500"
    : "border-gray-200"

  return (
    <div
      className={`
        rounded-3xl border-2 p-6 sm:p-8 min-h-[420px]
        flex flex-col lg:flex-row gap-6 lg:gap-8
        transition relative bg-white
        ${borderColor}
        ${isEmpty ? "cursor-pointer hover:shadow-sm" : ""}
      `}
      onClick={isEmpty ? onAdd : undefined}
    >
      {/* LEFT SIDE CONTENT */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Image */}
        <div className="flex justify-center">
          {isEmpty ? (
            <img
              src={EmptyCar}
              alt="Empty Car Slot"
              className="h-32 sm:h-40 lg:h-44 object-contain opacity-50"
            />
          ) : (
            <img
              src={car.image}
              alt={car.name}
              className="h-32 sm:h-40 lg:h-44 object-contain"
            />
          )}
        </div>

        {/* Text */}
        <div className="mt-6">
          {isEmpty && (
            <button
              className={`text-sm font-semibold mb-3 ${
                isPrimary ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Add Car
            </button>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isEmpty ? placeholder : car.name}
          </h2>

          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {isEmpty
              ? "Internal Combustion Engine (ICE)"
              : car.type === "EV"
              ? "Electric Vehicle (EV)"
              : "Internal Combustion Engine (ICE)"}
          </p>

          {!isEmpty && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAdd()
              }}
              className={`text-sm font-semibold mt-3 ${
                isPrimary ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Change car
            </button>
          )}
        </div>
      </div>

      {/* METRICS */}
      <div className="flex flex-col gap-4 w-full lg:w-56">
        <Metric
          title="Total Cost Ownership"
          value={isEmpty ? "-" : "GHS 241,120"}
          icon={Wallet}
          active={active}
          variant={variant}
        />
        <Metric
          title="Tailpipe Emissions"
          value={isEmpty ? "-" : "0.00 kgCO₂e"}
          icon={LineChart}
          active={active}
          variant={variant}
        />
        <Metric
          title="Fuel Economy"
          value={isEmpty ? "-" : "GHS 241"}
          icon={Fuel}
          active={active}
          variant={variant}
        />

        {/* Floating icon */}
        <div className="flex justify-end pt-2">
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition
              ${
                isPrimary
                  ? active
                    ? "bg-blue-100 text-blue-600"
                    : "bg-blue-50 text-blue-300"
                  : active
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gray-100 text-gray-400"
              }
            `}
          >
            <Car size={18} />
          </div>
        </div>
      </div>
    </div>
  )
}

const Metric = ({ title, value, icon: Icon, active, variant }) => {
  const isPrimary = variant === "primary"

  let bg, border, text, iconColor

  if (isPrimary) {
    // LEFT SIDE (BLUE FAMILY)
    bg = active ? "bg-blue-100" : "bg-blue-50"
    border = active ? "border-blue-500" : "border-blue-200"
    text = active ? "text-blue-900" : "text-blue-400"
    iconColor = active ? "text-blue-700" : "text-blue-300"
  } else {
    // RIGHT SIDE (GRAY FAMILY)
    bg = active ? "bg-gray-200" : "bg-gray-100"
    border = active ? "border-gray-600" : "border-gray-300"
    text = active ? "text-gray-900" : "text-gray-400"
    iconColor = active ? "text-gray-700" : "text-gray-400"
  }

  return (
    <div
      className={`
        relative rounded-2xl p-4 border-r-4 transition
        ${bg} ${border}
      `}
    >
      <div className={`absolute top-3 right-3 ${iconColor}`}>
        <Icon size={20} />
      </div>

      <p className="text-[10px] uppercase font-bold text-gray-500 leading-tight">
        {title}
      </p>

      <p className={`mt-1 text-lg sm:text-xl font-black ${text}`}>
        {value}
      </p>
    </div>
  )
}

export default ComparisonCard
