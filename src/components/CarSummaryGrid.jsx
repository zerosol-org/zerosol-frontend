const CarSummaryGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <CarSummaryCard
      name="BYD BO03"
      price="GHS 319,000"
      image="https://via.placeholder.com/400x200"
    />
    <CarSummaryCard
      name="Toyota Starlet"
      price="GHS 285,000"
      image="https://via.placeholder.com/400x200"
    />
  </div>
);

const CarSummaryCard = ({ name, price, image }) => (
  <div className="border rounded-xl p-4 bg-white shadow-sm">
    <div className="flex justify-between items-start">
      <h3 className="font-semibold">{name}</h3>
      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
        {price}
      </span>
    </div>

    <img
      src={image}
      alt={name}
      className="w-full h-40 object-contain my-4"
    />

    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
      <Stat label="Fuel" value="Electric" />
      <Stat label="Transmission" value="Auto" />
      <Stat label="Range" value="420 km" />
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-gray-50 p-2 rounded text-center">
    <div className="font-medium text-gray-800">{value}</div>
    <div className="text-[10px] uppercase">{label}</div>
  </div>
);

