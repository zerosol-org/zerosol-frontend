// src/hooks/useAdminAuth.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('Error getting session:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      setUser(data.user)
      return data.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateEmail = async (newEmail, password) => {
    setError(null)
    try {
      // First verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password
      })

      if (signInError) throw new Error('Current password is incorrect')

      // Update email
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error
      
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updatePassword = async (currentPassword, newPassword) => {
    setError(null)
    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: currentPassword
      })

      if (signInError) throw new Error('Current password is incorrect')

      // Update password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return { 
    user, 
    loading, 
    error, 
    signIn, 
    signOut,
    updateEmail,
    updatePassword
  }
}