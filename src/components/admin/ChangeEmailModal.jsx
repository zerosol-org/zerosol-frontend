// src/components/admin/ChangeEmailModal.jsx
import { useState } from 'react'
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function ChangeEmailModal({ isOpen, onClose, currentEmail }) {
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!newEmail || !password) {
      setError('All fields are required')
      return
    }

    if (newEmail === currentEmail) {
      setError('New email must be different from current email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // First verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: password
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (updateError) throw updateError

      setSuccess(true)
      toast.success('Verification email sent to your new address!')
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setNewEmail('')
        setPassword('')
        setSuccess(false)
        onClose()
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Change Email</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Email Sent!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Please check both your old and new email addresses for verification links.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Email Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Email
              </label>
              <input
                type="email"
                value={currentEmail}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
              />
            </div>

            {/* New Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="newemail@example.com"
                  required
                />
              </div>
            </div>

            {/* Password for verification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Info Text */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Note:</span> You'll need to verify both your old and new email addresses. 
                A verification link will be sent to your new email.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  'Update Email'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}