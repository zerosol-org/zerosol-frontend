// src/components/admin/StatsCards.jsx
import { Car, Battery, Fuel, Grid } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
)

export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total Vehicles"
        value={stats.totalVehicles}
        icon={Car}
        color="bg-blue-600"
      />
      <StatCard
        title="Electric Vehicles"
        value={stats.totalEV}
        icon={Battery}
        color="bg-green-600"
      />
      <StatCard
        title="ICE Vehicles"
        value={stats.totalICE}
        icon={Fuel}
        color="bg-orange-600"
      />
      <StatCard
        title="Unique Brands"
        value={stats.uniqueMakes}
        icon={Grid}
        color="bg-purple-600"
      />
    </div>
  )
}