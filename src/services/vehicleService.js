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

  // Get all vehicles (both EV and ICE) with all fields for comparison
  async getAllVehicles() {
    const [evVehicles, iceVehicles] = await Promise.all([
      this.getEVVehicles(),
      this.getICEVehicles()
    ])
    
    // Transform EV data with ALL fields including fuel economy, emissions, maintenance
    const evFormatted = evVehicles.map(v => ({
      id: `ev_${v.id}`,
      brand: v.make?.trim(),
      name: v.model?.trim(),
      fullName: `${v.make?.trim()} ${v.model?.trim()}`.trim(),
      category: v.category?.trim(),
      fuel: 'Electric',
      type: 'EV',
      image: v.image_url || 'https://placehold.co/600x400/EEE/31343C?text=No+Image',
      
      // Price fields
      price_usd: v.price_usd,
      price_ghs: v.price_ghs,
      
      // Performance fields
      horsepower: v.horsepower,
      top_speed_kmh: v.top_speed_kmh,
      acceleration: v.acceleration_0_60_mph,
      seating_capacity: v.seating_capacity,
      cargo_capacity_l: v.cargo_capacity_l,
      ground_clearance_mm: v.ground_clearance_mm,
      
      // FUEL ECONOMY FIELDS (CRITICAL FOR COMPARISON)
      fuel_economy_per_km: v.fuel_economy_per_km,
      fuel_economy_per_100km: v.fuel_economy_per_100km,
      annual_fuel_economy: v.annual_fuel_economy,
      
      // EMISSIONS FIELDS (CRITICAL FOR COMPARISON)
      tailpipe_emissions_per_km: v.tailpipe_emissions_per_km,
      tailpipe_emissions_per_100km: v.tailpipe_emissions_per_100km,
      annual_tailpipe_emissions: v.annual_tailpipe_emissions,
      
      // MAINTENANCE FIELDS (CRITICAL FOR COMPARISON)
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
      
      // Yearly emissions
      emissions: {
        year1: v.tailpipe_emissions_yr1,
        year2: v.tailpipe_emissions_yr2,
        year3: v.tailpipe_emissions_yr3,
        year4: v.tailpipe_emissions_yr4,
        year5: v.tailpipe_emissions_yr5
      },
      
      // Tech features
      tech_features: v.tech_features,
      apple_car_play: v.apple_car_play,
      android_auto: v.android_auto, // Note: You may need to add this to your DB
      drive_type: v.drive_type || 'Electric',
      body_type: v.body_type || v.category,
      engine_type: 'Electric'
    }))

    // Transform ICE data with ALL fields
    const iceFormatted = iceVehicles.map(v => ({
      id: `ice_${v.id}`,
      brand: v.make?.trim(),
      name: v.model?.trim(),
      fullName: `${v.make?.trim()} ${v.model?.trim()}`.trim(),
      category: v.category?.trim(),
      fuel: v.engine_type?.trim() || 'Petrol',
      type: 'ICE',
      image: v.image_url || 'https://placehold.co/600x400/EEE/31343C?text=No+Image',
      
      // Price fields
      price_usd: v.price_usd,
      price_ghs: v.price_ghs,
      
      // Performance fields
      horsepower: v.horsepower,
      top_speed: v.top_speed,
      acceleration: v.acceleration_0_60_mph,
      seating_capacity: v.seating_capacity,
      cargo_capacity: v.cargo_capacity,
      ground_clearance: v.ground_clearance,
      
      // FUEL ECONOMY FIELDS (CRITICAL FOR COMPARISON)
      fuel_economy_per_km: v.fuel_economy_per_km,
      fuel_economy_per_100km: v.fuel_economy_per_100km,
      annual_fuel_economy: v.annual_fuel_economy,
      fuel_economy_ghs_per_km: v.fuel_economy_ghs_per_km,
      
      // EMISSIONS FIELDS (CRITICAL FOR COMPARISON)
      tailpipe_emissions_per_km: v.tailpipe_emissions_per_km,
      tailpipe_emissions_per_100km: v.tailpipe_emissions_per_100km,
      annual_tailpipe_emissions: v.annual_tailpipe_emissions,
      
      // MAINTENANCE FIELDS (CRITICAL FOR COMPARISON)
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
      
      // Yearly emissions
      emissions: {
        year1: v.tailpipe_emissions_yr1,
        year2: v.tailpipe_emissions_yr2,
        year3: v.tailpipe_emissions_yr3,
        year4: v.tailpipe_emissions_yr4,
        year5: v.tailpipe_emissions_yr5
      },
      
      // Tech features
      tech_features: v.tech_features,
      apple_car_play: v.apple_car_play,
      android_auto: v.android_auto, // Note: You may need to add this to your DB
      drive_type: v.drive_type,
      body_type: v.body_type,
      engine_type: v.engine_type
    }))

    // Log first vehicle to verify fields
    if (evFormatted.length > 0) {
      console.log("Sample EV vehicle with all fields:", {
        ...evFormatted[0],
        // Show that fuel economy fields exist
        fuel_fields: {
          per_km: evFormatted[0].fuel_economy_per_km,
          per_100km: evFormatted[0].fuel_economy_per_100km,
          annual: evFormatted[0].annual_fuel_economy
        },
        emission_fields: {
          per_km: evFormatted[0].tailpipe_emissions_per_km,
          per_100km: evFormatted[0].tailpipe_emissions_per_100km,
          annual: evFormatted[0].annual_tailpipe_emissions
        },
        maintenance_fields: {
          per_km: evFormatted[0].avg_maintenance_cost_per_km,
          per_100km: evFormatted[0].avg_maintenance_cost_per_100km,
          annual: evFormatted[0].annual_maintenance_cost
        }
      })
    }

    return [...evFormatted, ...iceFormatted]
  },

  // Get a single vehicle by ID with all fields
  async getVehicleById(id, type) {
    const table = type === 'EV' ? 'ev_vehicles' : 'ice_vehicles'
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id.replace(/^(ev_|ice_)/, '')) // Remove prefix
      .single()
    
    if (error) throw error
    return data
  },

  // Search vehicles
  async searchVehicles(query) {
    const { data: evData, error: evError } = await supabase
      .from('ev_vehicles')
      .select('*')
      .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
    
    const { data: iceData, error: iceError } = await supabase
      .from('ice_vehicles')
      .select('*')
      .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
    
    if (evError || iceError) throw evError || iceError
    
    return [...(evData || []), ...(iceData || [])]
  },

  // Get vehicles by category
  async getVehiclesByCategory(category) {
    const [evVehicles, iceVehicles] = await Promise.all([
      supabase.from('ev_vehicles').select('*').eq('category', category),
      supabase.from('ice_vehicles').select('*').eq('category', category)
    ])
    
    return [...(evVehicles.data || []), ...(iceVehicles.data || [])]
  },

  // Get vehicle by make and model
  async getVehicle(make, model, type) {
    const table = type === 'EV' ? 'ev_vehicles' : 'ice_vehicles'
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('make', make)
      .eq('model', model)
      .single()
    
    if (error) throw error
    return data
  },

  // Debug function to check what fields are available
  async debugVehicleFields() {
    const [evSample, iceSample] = await Promise.all([
      supabase.from('ev_vehicles').select('*').limit(1).single(),
      supabase.from('ice_vehicles').select('*').limit(1).single()
    ])
    
    console.log("EV vehicle fields from DB:", Object.keys(evSample.data || {}))
    console.log("ICE vehicle fields from DB:", Object.keys(iceSample.data || {}))
    
    return {
      evFields: Object.keys(evSample.data || {}),
      iceFields: Object.keys(iceSample.data || {})
    }
  }
}