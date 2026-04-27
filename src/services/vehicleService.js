// src/services/vehicleService.js
import { gSheets } from '../lib/googleSheets';

// Helper function to safely parse numbers
const safeParseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,₵\s]/g, '');
    const parsed = parseFloat(cleaned);
    return !isNaN(parsed) ? parsed : defaultValue;
  }
  return defaultValue;
};

// Helper function to safely parse strings
const safeParseString = (value, defaultValue = '') => {
  if (value === undefined || value === null) return defaultValue;
  return String(value).trim();
};

// Helper to normalize vehicle data
const normalizeVehicle = (rawVehicle, type, rowId) => {
  // Parse prices
  const priceUSD = safeParseNumber(rawVehicle['Price (USD)'] || rawVehicle.price_usd);
  const priceGHS = safeParseNumber(rawVehicle['Price (GHS)'] || rawVehicle.price_ghs);
  
  // Parse performance
  const horsepower = safeParseNumber(rawVehicle.Horsepower || rawVehicle.horsepower);
  const seatingCapacity = safeParseNumber(rawVehicle['Seating Capacity'] || rawVehicle.seating_capacity);
  
  // Parse acceleration - handle both EV and ICE column names
  let acceleration = '';
  if (type === 'ev') {
    acceleration = safeParseString(rawVehicle['0-60 mph(s)'] || rawVehicle['0-60 mph'] || rawVehicle.acceleration_0_60_mph);
  } else {
    acceleration = safeParseString(rawVehicle['0-60 mph'] || rawVehicle['0-60 mph(s)'] || rawVehicle.acceleration_0_60_mph);
  }
  
  // Parse top speed - IMPORTANT: ICE uses "Top Speed", EV uses "Top Speed(km/h)"
  let topSpeedValue = '';
  if (type === 'ev') {
    topSpeedValue = safeParseString(
      rawVehicle['Top Speed (km/h)'] ||
      rawVehicle.top_speed_kmh || 
      rawVehicle.top_speed
    );
  } else {
    topSpeedValue = safeParseString(
      rawVehicle['Top Speed'] || 
      rawVehicle.top_speed || 
      rawVehicle.top_speed_kmh
    );
  }
  
  // Parse economy
  const fuelEconomyPer100km = safeParseString(rawVehicle['Fuel Economy (/100 km)'] || rawVehicle.fuel_economy_per_100km);
  const fuelEconomyPerKm = safeParseString(rawVehicle['Fuel Economy (/km)'] || rawVehicle.fuel_economy_per_km);
  const annualFuelEconomy = safeParseString(rawVehicle['Annual Fuel Economy'] || rawVehicle['Fuel Economy (annual)'] || rawVehicle.annual_fuel_economy);
  
  // Parse emissions
  const tailpipePer100km = safeParseString(rawVehicle['Tailpipe emissions (/100 km)'] || rawVehicle['Tailpipe emissions /100 km'] || rawVehicle.tailpipe_emissions_per_100km);
  const tailpipePerKm = safeParseString(rawVehicle['Tailpipe emissions /km'] || rawVehicle.tailpipe_emissions_per_km);
  const annualTailpipe = safeParseString(rawVehicle['Annual Tailpipe emissions '] || rawVehicle.annual_tailpipe_emissions);
  
  // Parse maintenance
  const maintenancePer100km = safeParseString(rawVehicle['Average maintenance cost (/100km)'] || rawVehicle.avg_maintenance_cost_per_100km);
  const maintenancePerKm = safeParseString(rawVehicle['Average maintenance cost (/km)'] || rawVehicle.avg_maintenance_cost_per_km);
  const annualMaintenance = safeParseString(rawVehicle['Average annual maintenance cost'] || rawVehicle.annual_maintenance_cost);
  
  // Parse TCO
  const tcoYr1 = safeParseString(rawVehicle['TCO Yr1'] || rawVehicle.tco_yr1);
  const tcoYr2 = safeParseString(rawVehicle['TCO Yr2'] || rawVehicle.tco_yr2);
  const tcoYr3 = safeParseString(rawVehicle['TCO Yr3'] || rawVehicle.tco_yr3);
  const tcoYr4 = safeParseString(rawVehicle['TCO Yr4'] || rawVehicle.tco_yr4);
  const tcoYr5 = safeParseString(rawVehicle['TCO Yr5'] || rawVehicle.tco_yr5);
  
  // Parse emissions yearly
  const emissionsYr1 = safeParseString(rawVehicle['Tailpipe Emissions Yr1'] || rawVehicle.tailpipe_emissions_yr1);
  const emissionsYr2 = safeParseString(rawVehicle['Tailpipe Emissions Yr2'] || rawVehicle.tailpipe_emissions_yr2);
  const emissionsYr3 = safeParseString(rawVehicle['Tailpipe Emissions Yr3'] || rawVehicle.tailpipe_emissions_yr3);
  const emissionsYr4 = safeParseString(rawVehicle['Tailpipe Emissions Yr4'] || rawVehicle.tailpipe_emissions_yr4);
  const emissionsYr5 = safeParseString(rawVehicle['Tailpipe Emissions Yr5'] || rawVehicle.tailpipe_emissions_yr5);
  
  // Handle image URL.
  // Priority: 'Image URL' (last col, Cloudinary URL set by admin upload) →
  //           'Image' (col A, may be a legacy URL or Drive link)
  let imageUrl = safeParseString(
    rawVehicle['Image URL'] ||   // last column — Cloudinary URL (preferred)
    rawVehicle.image_url  ||     // normalized field (fallback)
    rawVehicle.Image             // col A legacy fallback
  );
  
  // If it's a Google Drive link, convert to direct image URL
  if (imageUrl && imageUrl.includes('drive.google.com')) {
    const match = imageUrl.match(/[-\w]{25,}/);
    if (match) {
      imageUrl = `https://drive.google.com/uc?export=view&id=${match[0]}`;
    }
  }
  
  // Parse ground clearance
  let groundClearanceValue = '';
  if (type === 'ev') {
    groundClearanceValue = safeParseString(rawVehicle['Ground Clearance(mm)'] || rawVehicle.ground_clearance_mm);
  } else {
    groundClearanceValue = safeParseString(rawVehicle['Ground Clearance'] || rawVehicle.ground_clearance);
  }
  
  // Parse cargo capacity
  let cargoCapacityValue = '';
  if (type === 'ev') {
    cargoCapacityValue = safeParseString(rawVehicle['Cargo Capacity(L)'] || rawVehicle.cargo_capacity_l);
  } else {
    cargoCapacityValue = safeParseString(rawVehicle['Cargo Capacity'] || rawVehicle.cargo_capacity);
  }
  
  // Base vehicle object
  const vehicle = {
    // Core fields
    id: `${type}_${rowId}`,
    displayId: rowId,
    type: type,
    fullName: `${rawVehicle.Make || rawVehicle.make || ''} ${rawVehicle.Model || rawVehicle.model || ''}`.trim(),
    fuel: type === 'ev' ? 'Electric' : (rawVehicle['Engine Type'] || rawVehicle.engine_type || 'Petrol'),
    
    // Original fields from sheet
    make: safeParseString(rawVehicle.Make || rawVehicle.make),
    model: safeParseString(rawVehicle.Model || rawVehicle.model),
    category: safeParseString(rawVehicle.Category || rawVehicle.category),
    image_url: imageUrl || '',
    
    // Price fields
    price_usd: priceUSD,
    price_ghs: priceGHS,
    // EV sheet has typo 'Exhange Rate'; ICE sheet has correct 'Exchange Rate'
    exchange_rate: safeParseString(rawVehicle['Exchange Rate'] || rawVehicle['Exhange Rate'] || rawVehicle.exchange_rate),
    
    // Performance fields
    horsepower: horsepower,
    acceleration_0_60_mph: acceleration,
    top_speed: topSpeedValue,
    top_speed_kmh: topSpeedValue,
    
    // Economy fields
    fuel_economy_per_km: fuelEconomyPerKm,
    fuel_economy_per_100km: fuelEconomyPer100km,
    annual_fuel_economy: annualFuelEconomy,
    
    // Emissions fields
    tailpipe_emissions_per_km: tailpipePerKm,
    tailpipe_emissions_per_100km: tailpipePer100km,
    annual_tailpipe_emissions: annualTailpipe,
    
    // Maintenance fields
    avg_maintenance_cost_per_km: maintenancePerKm,
    avg_maintenance_cost_per_100km: maintenancePer100km,
    annual_maintenance_cost: annualMaintenance,
    
    // TCO object
    tco: {
      year1: tcoYr1,
      year2: tcoYr2,
      year3: tcoYr3,
      year4: tcoYr4,
      year5: tcoYr5
    },
    
    // TCO direct fields (for backward compatibility)
    tco_yr1: tcoYr1,
    tco_yr2: tcoYr2,
    tco_yr3: tcoYr3,
    tco_yr4: tcoYr4,
    tco_yr5: tcoYr5,
    
    // Emissions object
    emissions: {
      year1: emissionsYr1,
      year2: emissionsYr2,
      year3: emissionsYr3,
      year4: emissionsYr4,
      year5: emissionsYr5
    },
    
    // Emissions direct fields (for backward compatibility)
    tailpipe_emissions_yr1: emissionsYr1,
    tailpipe_emissions_yr2: emissionsYr2,
    tailpipe_emissions_yr3: emissionsYr3,
    tailpipe_emissions_yr4: emissionsYr4,
    tailpipe_emissions_yr5: emissionsYr5,
    
    // Other fields
    seating_capacity: seatingCapacity,
    ground_clearance_mm: groundClearanceValue,
    cargo_capacity_l: cargoCapacityValue,
    tech_features: safeParseString(rawVehicle['Tech & Special Features'] || rawVehicle.tech_features),
    
    // Metadata
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add ICE-specific fields
  if (type === 'ice') {
    vehicle.fuel_economy_ghs_per_km = safeParseString(rawVehicle['Fuel Economy (GHS/km)'] || rawVehicle.fuel_economy_ghs_per_km);
    vehicle.ground_clearance = groundClearanceValue;
    vehicle.apple_car_play = safeParseString(rawVehicle['Apple Car Play'] || rawVehicle.apple_car_play);
    vehicle.body_type = safeParseString(rawVehicle['Body Type'] || rawVehicle.body_type);
    vehicle.drive_type = safeParseString(rawVehicle['Drive Type'] || rawVehicle.drive_type);
    vehicle.cargo_capacity = cargoCapacityValue;
    vehicle.engine_type = safeParseString(rawVehicle['Engine Type'] || rawVehicle.engine_type);
    vehicle.android_auto = safeParseString(rawVehicle['Android Auto'] || rawVehicle.android_auto);
  }
  
  // Add EV-specific fields
  if (type === 'ev') {
    vehicle.ground_clearance_mm = groundClearanceValue;
    vehicle.cargo_capacity_l = cargoCapacityValue;
    vehicle.top_speed_kmh = topSpeedValue;
    vehicle.tech_features = safeParseString(rawVehicle['Tech & Special Features'] || rawVehicle.tech_features);
  }
  
  return vehicle;
};

export const vehicleService = {
  // Get all EV vehicles
  async getEVVehicles() {
    try {
      const data = await gSheets.get('EV!A:ZZ');
      if (!data.values || data.values.length < 2) return [];
      
      const headers = data.values[0];
      const rows = data.values.slice(1);
      
      // rowNumber = idx + 2 is set during map (before filter) so blank rows in the
      // sheet don't shift the row numbers of vehicles that come after them.
      const vehicles = rows.map((row, idx) => {
        const rawVehicle = {};
        headers.forEach((h, i) => {
          if (h && row[i] !== undefined) rawVehicle[h] = row[i];
        });
        return normalizeVehicle(rawVehicle, 'ev', idx + 2);
      }).filter(v => v.make && v.make !== '');
      
      return vehicles;
    } catch (error) {
      console.error('Error in getEVVehicles:', error);
      return [];
    }
  },

  // Get all ICE vehicles
  async getICEVehicles() {
    try {
      const data = await gSheets.get('ICE!A:ZZ');
      if (!data.values || data.values.length < 2) return [];
      
      const headers = data.values[0];
      const rows = data.values.slice(1);
      
      const vehicles = rows.map((row, idx) => {
        const rawVehicle = {};
        headers.forEach((h, i) => {
          if (h && row[i] !== undefined) rawVehicle[h] = row[i];
        });
        return normalizeVehicle(rawVehicle, 'ice', idx + 2);
      }).filter(v => v.make && v.make !== '');
      
      return vehicles;
    } catch (error) {
      console.error('Error in getICEVehicles:', error);
      return [];
    }
  },

  // Get all vehicles (both EV and ICE) with ALL fields for comparison
  async getAllVehicles() {
    try {
      const [evVehicles, iceVehicles] = await Promise.all([
        this.getEVVehicles(),
        this.getICEVehicles()
      ]);
      
      const allVehicles = [...evVehicles, ...iceVehicles];
      
      console.log(`Total vehicles loaded: ${allVehicles.length} (${evVehicles.length} EV, ${iceVehicles.length} ICE)`);
      
      return allVehicles;
    } catch (error) {
      console.error('Error in getAllVehicles:', error);
      return [];
    }
  },

  // Get vehicle by ID
  async getVehicleById(id, type) {
    try {
      const sheet = type === 'ev' ? 'EV' : 'ICE';
      const data = await gSheets.get(`${sheet}!A:ZZ`);
      
      if (!data.values || data.values.length < 2) {
        throw new Error('No data found');
      }
      
      // Extract the numeric ID (remove the type prefix if present)
      const rowId = id.toString().replace(/^(ev_|ice_)/, '');
      const numericId = parseInt(rowId);
      
      // data.values[0]  = headers  (sheet row 1)
      // data.values[1]  = sheet row 2  (first data row)
      // data.values[N]  = sheet row N+1
      // To read sheet row numericId: data.values[numericId - 1]
      if (isNaN(numericId) || numericId < 2 || numericId > data.values.length) {
        throw new Error('Invalid vehicle ID');
      }
      
      const headers = data.values[0];
      const row = data.values[numericId - 1]; // correct: sheet row numericId
      const rawVehicle = {};
      headers.forEach((h, i) => {
        if (h && row[i] !== undefined) rawVehicle[h] = row[i];
      });
      
      return normalizeVehicle(rawVehicle, type, numericId);
    } catch (error) {
      console.error('Error in getVehicleById:', error);
      throw error;
    }
  },

  // Search vehicles
  async searchVehicles(query) {
    if (!query || query.length < 2) return [];

    try {
      const allVehicles = await this.getAllVehicles();
      
      const searchLower = query.toLowerCase();
      const results = allVehicles.filter(v => 
        v.make?.toLowerCase().includes(searchLower) ||
        v.model?.toLowerCase().includes(searchLower) ||
        v.category?.toLowerCase().includes(searchLower)
      );
      
      return results.slice(0, 10);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      return [];
    }
  },

  // Search by category
  async searchByCategory(category, query = '') {
    try {
      const allVehicles = await this.getAllVehicles();
      
      let results = allVehicles.filter(v => 
        v.category === category
      );
      
      if (query) {
        const searchLower = query.toLowerCase();
        results = results.filter(v => 
          v.make?.toLowerCase().includes(searchLower) ||
          v.model?.toLowerCase().includes(searchLower)
        );
      }
      
      return results.slice(0, 10);
    } catch (error) {
      console.error('Error searching by category:', error);
      return [];
    }
  },

  // Get popular/recent vehicles
  async getPopularVehicles(limit = 6) {
    try {
      const allVehicles = await this.getAllVehicles();
      
      // Split into EV and ICE
      const evVehicles = allVehicles.filter(v => v.type === 'ev');
      const iceVehicles = allVehicles.filter(v => v.type === 'ice');
      
      // Interleave EV and ICE vehicles
      const combined = [];
      const maxLength = Math.max(evVehicles.length, iceVehicles.length);
      
      for (let i = 0; i < maxLength && combined.length < limit; i++) {
        if (i < evVehicles.length) combined.push(evVehicles[i]);
        if (combined.length >= limit) break;
        if (i < iceVehicles.length) combined.push(iceVehicles[i]);
        if (combined.length >= limit) break;
      }
      
      return combined.slice(0, limit);
    } catch (error) {
      console.error('Error getting popular vehicles:', error);
      return [];
    }
  },

  // Get vehicles by make
  async getVehiclesByMake(make) {
    try {
      const allVehicles = await this.getAllVehicles();
      
      const results = allVehicles.filter(v => 
        v.make?.toLowerCase() === make.toLowerCase()
      );
      
      return results.slice(0, 20);
    } catch (error) {
      console.error('Error getting vehicles by make:', error);
      return [];
    }
  }
};