// src/services/vehicleService.js
import { supabase } from '../lib/supabase'

export const vehicleService = {
  // Get all EV vehicles
  async getEVVehicles() {
    const { data, error } = await supabase
      .from('ev_vehicles')
      .select('*')
      .order('make')
    
    if (error) throw error
    return data
  },

  // Get all ICE vehicles
  async getICEVehicles() {
    const { data, error } = await supabase
      .from('ice_vehicles')
      .select('*')
      .order('make')
    
    if (error) throw error
    return data
  },

  // Get all vehicles (both EV and ICE)
  async getAllVehicles() {
    const [evVehicles, iceVehicles] = await Promise.all([
      this.getEVVehicles(),
      this.getICEVehicles()
    ])
    
    const evFormatted = evVehicles.map(v => ({
      ...v,
      type: 'ev',
      id: `ev_${v.id}`,
      displayId: v.id,
      fullName: `${v.make} ${v.model}`,
      fuel: 'Electric'
    }))

    const iceFormatted = iceVehicles.map(v => ({
      ...v,
      type: 'ice',
      id: `ice_${v.id}`,
      displayId: v.id,
      fullName: `${v.make} ${v.model}`,
      fuel: v.engine_type || 'Petrol'
    }))

    return [...evFormatted, ...iceFormatted]
  },

  // Get vehicle by ID
  async getVehicleById(id, type) {
    const table = type === 'ev' ? 'ev_vehicles' : 'ice_vehicles'
    const numericId = id.replace(/^(ev_|ice_)/, '')
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', numericId)
      .single()
    
    if (error) throw error
    return { ...data, type }
  },

  // Search vehicles
  async searchVehicles(query) {
    if (!query || query.length < 2) return []

    try {
      const [evResults, iceResults] = await Promise.all([
        supabase
          .from('ev_vehicles')
          .select('*')
          .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
          .limit(10),
        
        supabase
          .from('ice_vehicles')
          .select('*')
          .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
          .limit(10)
      ])

      const evVehicles = (evResults.data || []).map(v => ({
        ...v,
        type: 'ev'
      }))

      const iceVehicles = (iceResults.data || []).map(v => ({
        ...v,
        type: 'ice'
      }))

      // Combine and sort by relevance
      return [...evVehicles, ...iceVehicles].slice(0, 10)
    } catch (error) {
      console.error('Error searching vehicles:', error)
      return []
    }
  },

  // Search by category
  async searchByCategory(category, query = '') {
    try {
      const [evResults, iceResults] = await Promise.all([
        supabase
          .from('ev_vehicles')
          .select('*')
          .eq('category', category)
          .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
          .limit(10),
        
        supabase
          .from('ice_vehicles')
          .select('*')
          .eq('category', category)
          .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
          .limit(10)
      ])

      const evVehicles = (evResults.data || []).map(v => ({
        ...v,
        type: 'ev'
      }))

      const iceVehicles = (iceResults.data || []).map(v => ({
        ...v,
        type: 'ice'
      }))

      return [...evVehicles, ...iceVehicles]
    } catch (error) {
      console.error('Error searching by category:', error)
      return []
    }
  },

  // Get popular/recent vehicles
  async getPopularVehicles(limit = 6) {
    try {
      const [evResults, iceResults] = await Promise.all([
        supabase
          .from('ev_vehicles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit),
        
        supabase
          .from('ice_vehicles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit)
      ])

      const evVehicles = (evResults.data || []).map(v => ({
        ...v,
        type: 'ev'
      }))

      const iceVehicles = (iceResults.data || []).map(v => ({
        ...v,
        type: 'ice'
      }))

      // Interleave EV and ICE vehicles
      const combined = []
      const maxLength = Math.max(evVehicles.length, iceVehicles.length)
      
      for (let i = 0; i < maxLength; i++) {
        if (i < evVehicles.length) combined.push(evVehicles[i])
        if (i < iceVehicles.length) combined.push(iceVehicles[i])
      }

      return combined.slice(0, limit)
    } catch (error) {
      console.error('Error getting popular vehicles:', error)
      return []
    }
  },

  // Get vehicles by make
  async getVehiclesByMake(make) {
    try {
      const [evResults, iceResults] = await Promise.all([
        supabase
          .from('ev_vehicles')
          .select('*')
          .eq('make', make)
          .limit(20),
        
        supabase
          .from('ice_vehicles')
          .select('*')
          .eq('make', make)
          .limit(20)
      ])

      const evVehicles = (evResults.data || []).map(v => ({
        ...v,
        type: 'ev'
      }))

      const iceVehicles = (iceResults.data || []).map(v => ({
        ...v,
        type: 'ice'
      }))

      return [...evVehicles, ...iceVehicles]
    } catch (error) {
      console.error('Error getting vehicles by make:', error)
      return []
    }
  }
}