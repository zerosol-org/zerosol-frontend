import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import AdminDashboard from './pages/admin/AdminDashboard'
import VehicleForm from './pages/admin/VehicleForm'
import VehicleDetails from './pages/admin/VehicleDetails'


function App() {
  return (
    <>
      <Routes >
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/vehicles/:type/:id" element={<VehicleDetails />} />
        <Route path="/admin/vehicles/:type/:id/edit" element={<VehicleForm />} />
        <Route path="/admin/vehicles/:type/new" element={<VehicleForm />} />
      </Routes>
       
    </>
  )
}

export default App
