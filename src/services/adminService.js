// src/services/adminService.js
import { supabase } from '../lib/supabase'

export const adminService = {
  // ==================== EV VEHICLES ====================
  
  // Get all EV vehicles with pagination
  async getEVVehicles(page = 1, limit = 10, search = '') {
    try {
      let query = supabase
        .from('ev_vehicles')
        .select('*', { count: 'exact' })
        .order('make')
        .range((page - 1) * limit, page * limit - 1)
      
      if (search) {
        query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%`)
      }
      
      const { data, error, count } = await query
      if (error) throw error
      return { data: data || [], count: count || 0 }
    } catch (error) {
      console.error('Error in getEVVehicles:', error)
      throw error
    }
  },

  // Get single EV vehicle
  async getEVVehicle(id) {
    if (!id || id === 'undefined' || id === 'null' || id === 'new') {
      throw new Error('Invalid vehicle ID: ' + id)
    }

    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      throw new Error('ID must be a number')
    }

    try {
      const { data, error } = await supabase
        .from('ev_vehicles')
        .select('*')
        .eq('id', numericId)
        .maybeSingle()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error(`EV vehicle with ID ${numericId} not found`)
      }
      
      return data
    } catch (error) {
      console.error('Error in getEVVehicle:', error)
      throw error
    }
  },

  // Create EV vehicle
  async createEVVehicle(vehicleData) {
    try {
      // Remove id and created_at if they exist
      const { id, created_at, ...dataWithoutId } = vehicleData
      
      // Clean the data - remove any undefined or empty strings
      const cleanData = Object.fromEntries(
        Object.entries(dataWithoutId).filter(([_, v]) => 
          v !== '' && v !== undefined && v !== null
        )
      )
      
      const { data, error } = await supabase
        .from('ev_vehicles')
        .insert([cleanData])
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      return data[0]
    } catch (error) {
      console.error('Error in createEVVehicle:', error)
      throw error
    }
  },

  // Update EV vehicle
  async updateEVVehicle(id, vehicleData) {
    if (!id || id === 'undefined' || id === 'null' || id === 'new') {
      throw new Error('Invalid vehicle ID: ' + id)
    }

    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      throw new Error('ID must be a number')
    }

    try {
      // Remove id and created_at from vehicleData if they exist
      const { id: _, created_at, ...dataWithoutId } = vehicleData
      
      // Clean the data - remove any undefined values
      const cleanData = Object.fromEntries(
        Object.entries(dataWithoutId).filter(([_, v]) => v !== undefined)
      )
      
      const { data, error } = await supabase
        .from('ev_vehicles')
        .update(cleanData)
        .eq('id', numericId)
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      if (!data || data.length === 0) throw new Error('Vehicle not found')
      
      return data[0]
    } catch (error) {
      console.error('Error in updateEVVehicle:', error)
      throw error
    }
  },

  // Delete EV vehicle
  async deleteEVVehicle(id) {
    if (!id || id === 'undefined' || id === 'null' || id === 'new') {
      throw new Error('Invalid vehicle ID: ' + id)
    }

    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      throw new Error('ID must be a number')
    }

    try {
      const { error } = await supabase
        .from('ev_vehicles')
        .delete()
        .eq('id', numericId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error in deleteEVVehicle:', error)
      throw error
    }
  },

  // ==================== ICE VEHICLES ====================
  
  // Get all ICE vehicles with pagination
  async getICEVehicles(page = 1, limit = 10, search = '') {
    try {
      let query = supabase
        .from('ice_vehicles')
        .select('*', { count: 'exact' })
        .order('make')
        .range((page - 1) * limit, page * limit - 1)
      
      if (search) {
        query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%`)
      }
      
      const { data, error, count } = await query
      if (error) throw error
      return { data: data || [], count: count || 0 }
    } catch (error) {
      console.error('Error in getICEVehicles:', error)
      throw error
    }
  },

  // Get single ICE vehicle
  async getICEVehicle(id) {
    if (!id || id === 'undefined' || id === 'null' || id === 'new') {
      throw new Error('Invalid vehicle ID: ' + id)
    }

    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      throw new Error('ID must be a number')
    }

    try {
      const { data, error } = await supabase
        .from('ice_vehicles')
        .select('*')
        .eq('id', numericId)
        .maybeSingle()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (!data) {
        throw new Error(`ICE vehicle with ID ${numericId} not found`)
      }
      
      return data
    } catch (error) {
      console.error('Error in getICEVehicle:', error)
      throw error
    }
  },

  // Create ICE vehicle
  async createICEVehicle(vehicleData) {
    try {
      // Remove id and created_at if they exist
      const { id, created_at, ...dataWithoutId } = vehicleData
      
      // Clean the data - remove any undefined or empty strings
      const cleanData = Object.fromEntries(
        Object.entries(dataWithoutId).filter(([_, v]) => 
          v !== '' && v !== undefined && v !== null
        )
      )
      
      const { data, error } = await supabase
        .from('ice_vehicles')
        .insert([cleanData])
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      return data[0]
    } catch (error) {
      console.error('Error in createICEVehicle:', error)
      throw error
    }
  },

  // Update ICE vehicle
  async updateICEVehicle(id, vehicleData) {
    if (!id || id === 'undefined' || id === 'null' || id === 'new') {
      throw new Error('Invalid vehicle ID: ' + id)
    }

    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      throw new Error('ID must be a number')
    }

    try {
      // Remove id and created_at from vehicleData if they exist
      const { id: _, created_at, ...dataWithoutId } = vehicleData
      
      // Clean the data - remove any undefined values
      const cleanData = Object.fromEntries(
        Object.entries(dataWithoutId).filter(([_, v]) => v !== undefined)
      )
      
      const { data, error } = await supabase
        .from('ice_vehicles')
        .update(cleanData)
        .eq('id', numericId)
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      if (!data || data.length === 0) throw new Error('Vehicle not found')
      
      return data[0]
    } catch (error) {
      console.error('Error in updateICEVehicle:', error)
      throw error
    }
  },

  // Delete ICE vehicle
  async deleteICEVehicle(id) {
    if (!id || id === 'undefined' || id === 'null' || id === 'new') {
      throw new Error('Invalid vehicle ID: ' + id)
    }

    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      throw new Error('ID must be a number')
    }

    try {
      const { error } = await supabase
        .from('ice_vehicles')
        .delete()
        .eq('id', numericId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error in deleteICEVehicle:', error)
      throw error
    }
  },

  // ==================== IMAGE MANAGEMENT ====================
  
  async uploadVehicleImage(file, make, model, type) {
    try {
      const fileName = `${type}_${make}_${model}_${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `vehicles/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('ev-images')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('ev-images')
        .getPublicUrl(filePath)
      
      return publicUrl
    } catch (error) {
      console.error('Error in uploadVehicleImage:', error)
      throw error
    }
  },

  async deleteVehicleImage(imageUrl) {
    try {
      const path = imageUrl.split('/').pop()
      const { error } = await supabase.storage
        .from('ev-images')
        .remove([`vehicles/${path}`])
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error in deleteVehicleImage:', error)
      throw error
    }
  },

  // ==================== DASHBOARD STATS ====================
  
  async getDashboardStats() {
    try {
      const [evCount, iceCount, evData, iceData] = await Promise.all([
        supabase.from('ev_vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('ice_vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('ev_vehicles').select('make, category, price_usd, horsepower'),
        supabase.from('ice_vehicles').select('make, category, price_usd, horsepower, engine_type')
      ])
      
      const evVehicles = evData.data || []
      const iceVehicles = iceData.data || []
      
      const totalEV = evCount.count || 0
      const totalICE = iceCount.count || 0
      
      const allMakes = [
        ...new Set([
          ...evVehicles.map(v => v.make).filter(Boolean),
          ...iceVehicles.map(v => v.make).filter(Boolean)
        ])
      ]
      
      const evCategoryCount = {}
      evVehicles.forEach(v => {
        if (v.category) {
          evCategoryCount[v.category] = (evCategoryCount[v.category] || 0) + 1
        }
      })
      
      const iceCategoryCount = {}
      iceVehicles.forEach(v => {
        if (v.category) {
          iceCategoryCount[v.category] = (iceCategoryCount[v.category] || 0) + 1
        }
      })
      
      const fuelTypeCount = {}
      iceVehicles.forEach(v => {
        if (v.engine_type) {
          fuelTypeCount[v.engine_type] = (fuelTypeCount[v.engine_type] || 0) + 1
        }
      })
      
      const validEVPrices = evVehicles.filter(v => v.price_usd && v.price_usd > 0)
      const validICEPrices = iceVehicles.filter(v => v.price_usd && v.price_usd > 0)
      
      const avgEVPrice = validEVPrices.length > 0 
        ? validEVPrices.reduce((sum, v) => sum + v.price_usd, 0) / validEVPrices.length 
        : 0
      
      const avgICEPrice = validICEPrices.length > 0 
        ? validICEPrices.reduce((sum, v) => sum + v.price_usd, 0) / validICEPrices.length 
        : 0
      
      const validEVHP = evVehicles.filter(v => v.horsepower && v.horsepower > 0)
      const validICEHP = iceVehicles.filter(v => v.horsepower && v.horsepower > 0)
      
      const avgEVHP = validEVHP.length > 0 
        ? validEVHP.reduce((sum, v) => sum + v.horsepower, 0) / validEVHP.length 
        : 0
      
      const avgICEHP = validICEHP.length > 0 
        ? validICEHP.reduce((sum, v) => sum + v.horsepower, 0) / validICEHP.length 
        : 0
      
      return {
        totalEV,
        totalICE,
        totalVehicles: totalEV + totalICE,
        uniqueMakes: allMakes.length,
        evByCategory: Object.entries(evCategoryCount).map(([category, count]) => ({ category, count })),
        iceByCategory: Object.entries(iceCategoryCount).map(([category, count]) => ({ category, count })),
        fuelTypes: Object.entries(fuelTypeCount).map(([type, count]) => ({ type, count })),
        avgEVPrice: Math.round(avgEVPrice),
        avgICEPrice: Math.round(avgICEPrice),
        avgEVHP: Math.round(avgEVHP),
        avgICEHP: Math.round(avgICEHP),
        topEVBrands: getTopBrands(evVehicles, 5),
        topICEBrands: getTopBrands(iceVehicles, 5)
      }
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      return {
        totalEV: 0,
        totalICE: 0,
        totalVehicles: 0,
        uniqueMakes: 0,
        evByCategory: [],
        iceByCategory: [],
        fuelTypes: [],
        avgEVPrice: 0,
        avgICEPrice: 0,
        avgEVHP: 0,
        avgICEHP: 0,
        topEVBrands: [],
        topICEBrands: []
      }
    }
  },

  // ==================== UTILITY ====================
  
  async getAllVehicles() {
    try {
      const [evData, iceData] = await Promise.all([
        supabase.from('ev_vehicles').select('*'),
        supabase.from('ice_vehicles').select('*')
      ])
      
      const evFormatted = (evData.data || []).map(v => ({
        ...v,
        type: 'ev',
        displayId: v.id,
        displayType: 'EV'
      }))
      
      const iceFormatted = (iceData.data || []).map(v => ({
        ...v,
        type: 'ice',
        displayId: v.id,
        displayType: 'ICE'
      }))
      
      return [...evFormatted, ...iceFormatted]
    } catch (error) {
      console.error('Error in getAllVehicles:', error)
      return []
    }
  }
}

function getTopBrands(vehicles, limit) {
  const brandCount = {}
  vehicles.forEach(v => {
    if (v.make) {
      brandCount[v.make] = (brandCount[v.make] || 0) + 1
    }
  })
  
  return Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([brand, count]) => ({ brand, count }))
}