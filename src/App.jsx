// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Toast from './components/admin/Toast'
import ProtectedRoute from './components/admin/ProtectedRoute'
import Login from './pages/admin/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import VehicleForm from './pages/admin/VehicleForm'
import VehicleDetails from './pages/admin/VehicleDetails'
import VehicleList from './pages/admin/VehicleList'
import Home from './pages/Home'
import ResetPasswordPage from './pages/admin/ResetPasswordPage'

function App() {
  return (
    <>
      <Toast />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/vehicles/:type/:id" element={
          <ProtectedRoute>
            <VehicleDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/vehicles/:type/:id/edit" element={
          <ProtectedRoute>
            <VehicleForm />
          </ProtectedRoute>
        } />
        <Route path="/admin/vehicles/:type/new" element={
          <ProtectedRoute>
            <VehicleForm />
          </ProtectedRoute>
        } />
         {/* Vehicle list by type */}
        <Route path="/admin/vehicles/:type" element={
          <ProtectedRoute>
            <VehicleList />
          </ProtectedRoute>
        } />
        
      </Routes>
    </>
  )
}

export default App