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

  // Get all vehicles (both EV and ICE) with ALL fields for comparison
  async getAllVehicles() {
    const [evVehicles, iceVehicles] = await Promise.all([
      this.getEVVehicles(),
      this.getICEVehicles()
    ])
    
    // Transform EV data with ALL fields
    const evFormatted = evVehicles.map(v => ({
      ...v, // Spread all original fields first
      id: `ev_${v.id}`,
      displayId: v.id,
      type: 'ev',
      fullName: `${v.make} ${v.model}`,
      fuel: 'Electric',
      
      // Ensure these fields are properly mapped (they should already exist from spread)
      fuel_economy_per_km: v.fuel_economy_per_km,
      fuel_economy_per_100km: v.fuel_economy_per_100km,
      annual_fuel_economy: v.annual_fuel_economy,
      tailpipe_emissions_per_km: v.tailpipe_emissions_per_km,
      tailpipe_emissions_per_100km: v.tailpipe_emissions_per_100km,
      annual_tailpipe_emissions: v.annual_tailpipe_emissions,
      avg_maintenance_cost_per_km: v.avg_maintenance_cost_per_km,
      avg_maintenance_cost_per_100km: v.avg_maintenance_cost_per_100km,
      annual_maintenance_cost: v.annual_maintenance_cost,
      
      // TCO fields
      tco: {
        year1: v.tco_yr1,
        year2: v.tco_yr2,
        year3: v.tco_yr3,
        year4: v.tco_yr4,
        year5: v.tco_yr5
      },
      
      // Emissions fields
      emissions: {
        year1: v.tailpipe_emissions_yr1,
        year2: v.tailpipe_emissions_yr2,
        year3: v.tailpipe_emissions_yr3,
        year4: v.tailpipe_emissions_yr4,
        year5: v.tailpipe_emissions_yr5
      },
      
      // Other fields
      seating_capacity: v.seating_capacity,
      horsepower: v.horsepower,
      ground_clearance_mm: v.ground_clearance_mm,
      cargo_capacity_l: v.cargo_capacity_l,
      acceleration_0_60_mph: v.acceleration_0_60_mph,
      top_speed_kmh: v.top_speed_kmh,
      tech_features: v.tech_features,
      
      // ICE-specific fields (will be undefined for EV)
      fuel_economy_ghs_per_km: v.fuel_economy_ghs_per_km,
      ground_clearance: v.ground_clearance,
      apple_car_play: v.apple_car_play,
      body_type: v.body_type,
      drive_type: v.drive_type,
      cargo_capacity: v.cargo_capacity,
      engine_type: v.engine_type,
      top_speed: v.top_speed,
      android_auto: v.android_auto
    }))

    // Transform ICE data with ALL fields
    const iceFormatted = iceVehicles.map(v => ({
      ...v, // Spread all original fields first
      id: `ice_${v.id}`,
      displayId: v.id,
      type: 'ice',
      fullName: `${v.make} ${v.model}`,
      fuel: v.engine_type || 'Petrol',
      
      // Fuel economy fields
      fuel_economy_per_km: v.fuel_economy_per_km,
      fuel_economy_per_100km: v.fuel_economy_per_100km,
      annual_fuel_economy: v.annual_fuel_economy,
      
      // Emissions fields
      tailpipe_emissions_per_km: v.tailpipe_emissions_per_km,
      tailpipe_emissions_per_100km: v.tailpipe_emissions_per_100km,
      annual_tailpipe_emissions: v.annual_tailpipe_emissions,
      
      // Maintenance fields
      avg_maintenance_cost_per_km: v.avg_maintenance_cost_per_km,
      avg_maintenance_cost_per_100km: v.avg_maintenance_cost_per_100km,
      annual_maintenance_cost: v.annual_maintenance_cost,
      
      // TCO fields
      tco: {
        year1: v.tco_yr1,
        year2: v.tco_yr2,
        year3: v.tco_yr3,
        year4: v.tco_yr4,
        year5: v.tco_yr5
      },
      
      // Emissions fields
      emissions: {
        year1: v.tailpipe_emissions_yr1,
        year2: v.tailpipe_emissions_yr2,
        year3: v.tailpipe_emissions_yr3,
        year4: v.tailpipe_emissions_yr4,
        year5: v.tailpipe_emissions_yr5
      },
      
      // Other fields
      seating_capacity: v.seating_capacity,
      horsepower: v.horsepower,
      fuel_economy_ghs_per_km: v.fuel_economy_ghs_per_km,
      ground_clearance: v.ground_clearance,
      apple_car_play: v.apple_car_play,
      body_type: v.body_type,
      drive_type: v.drive_type,
      cargo_capacity: v.cargo_capacity,
      engine_type: v.engine_type,
      acceleration_0_60_mph: v.acceleration_0_60_mph,
      top_speed: v.top_speed,
      android_auto: v.android_auto,
      
      // EV-specific fields (will be undefined for ICE)
      ground_clearance_mm: v.ground_clearance_mm,
      cargo_capacity_l: v.cargo_capacity_l,
      top_speed_kmh: v.top_speed_kmh,
      tech_features: v.tech_features
    }))

    console.log('Sample EV vehicle:', evFormatted[0])
    console.log('Sample ICE vehicle:', iceFormatted[0])

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
    
    // Format the vehicle with all fields
    const formatted = {
      ...data,
      type,
      id: `${type}_${data.id}`,
      displayId: data.id,
      fullName: `${data.make} ${data.model}`,
      fuel: type === 'ev' ? 'Electric' : (data.engine_type || 'Petrol'),
      
      // Create tco object
      tco: {
        year1: data.tco_yr1,
        year2: data.tco_yr2,
        year3: data.tco_yr3,
        year4: data.tco_yr4,
        year5: data.tco_yr5
      },
      
      // Create emissions object
      emissions: {
        year1: data.tailpipe_emissions_yr1,
        year2: data.tailpipe_emissions_yr2,
        year3: data.tailpipe_emissions_yr3,
        year4: data.tailpipe_emissions_yr4,
        year5: data.tailpipe_emissions_yr5
      }
    }
    
    return formatted
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
        type: 'ev',
        id: `ev_${v.id}`,
        displayId: v.id,
        fullName: `${v.make} ${v.model}`
      }))

      const iceVehicles = (iceResults.data || []).map(v => ({
        ...v,
        type: 'ice',
        id: `ice_${v.id}`,
        displayId: v.id,
        fullName: `${v.make} ${v.model}`
      }))

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