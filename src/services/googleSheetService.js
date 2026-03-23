// src/services/googleSheetService.js
import { gSheets } from '../lib/googleSheets';

// Exact headers from your "EV" sheet
const EV_HEADERS = [
  'Image', 'Make', 'Model', 'Category', 'Price (USD)', 'Exhange Rate', 'Price (GHS)', 
  'Fuel Economy (/km)', 'Fuel Economy (/100 km)', 'Annual Fuel Economy', 
  'Tailpipe emissions /km', 'Tailpipe emissions (/100 km)', 'Annual Tailpipe emissions ', 
  'Average maintenance cost (/km)', 'Average maintenance cost (/100km)', 
  'Average annual maintenance cost', 'TCO Yr1', 'TCO Yr2', 'TCO Yr3', 'TCO Yr4', 'TCO Yr5', 
  'Tailpipe Emissions Yr1', 'Tailpipe Emissions Yr2', 'Tailpipe Emissions Yr3', 
  'Tailpipe Emissions Yr4', 'Tailpipe Emissions Yr5', 'Seating Capacity', 
  'Ground Clearance(mm)', 'Tech & Special Features', 'Cargo Capacity(L)', 
  '0-60 mph(s)', 'Top Speed(km/h)', 'Horsepower'
];

// Exact headers from your "ICE" sheet
const ICE_HEADERS = [
  'Image', 'Make', 'Model', 'Category', 'Price (USD)', 'Exchange Rate', 'Price (GHS)', 
  'Fuel Economy (/km)', 'Fuel Economy (/100 km)', 'Fuel Economy (annual)', 
  'Tailpipe emissions /km', 'Tailpipe emissions /100 km', 'Annual Tailpipe emissions ', 
  'Average maintenance cost (/km)', 'Average maintenance cost (/100km)', 
  'Average annual maintenance cost', 'TCO Yr1', 'TCO Yr2', 'TCO Yr3', 'TCO Yr4', 'TCO Yr5', 
  'Tailpipe Emissions Yr1', 'Tailpipe Emissions Yr2', 'Tailpipe Emissions Yr3', 
  'Tailpipe Emissions Yr4', 'Tailpipe Emissions Yr5', 'Seating Capacity', 
  'Fuel Economy (GHS/km)', 'Ground Clearance', 'Apple Car Play', 
  'Tech & Special Features', 'Body Type', 'Drive Type', 'Cargo Capacity', 
  'Engine Type', '0-60 mph', 'Top Speed', 'Horsepower'
];

// Helper function to safely parse numbers
const safeParseNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  
  // If it's already a number
  if (typeof value === 'number' && !isNaN(value)) return value;
  
  // If it's a string, try to parse
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and spaces
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

// Helper function to normalize vehicle data to match component expectations
const normalizeVehicleData = (vehicle, type) => {
  // Parse prices
  const priceUSD = safeParseNumber(vehicle['Price (USD)'] || vehicle.price_usd);
  const priceGHS = safeParseNumber(vehicle['Price (GHS)'] || vehicle.price_ghs);
  
  // Parse performance numbers
  const horsepower = safeParseNumber(vehicle.Horsepower || vehicle.horsepower);
  const seatingCapacity = safeParseNumber(vehicle['Seating Capacity'] || vehicle.seating_capacity);
  
  // Parse economy numbers
  const fuelEconomyPer100km = safeParseString(vehicle['Fuel Economy (/100 km)'] || vehicle.fuel_economy_per_100km);
  
  return {
    // Core fields
    id: vehicle.id,
    displayId: vehicle.rowNumber || vehicle.id,
    type: type,
    displayType: type.toUpperCase(),
    make: safeParseString(vehicle.Make || vehicle.make),
    model: safeParseString(vehicle.Model || vehicle.model),
    category: safeParseString(vehicle.Category || vehicle.category),
    
    // Price fields (as numbers)
    price_usd: priceUSD,
    price_ghs: priceGHS,
    
    // Performance fields (as numbers)
    horsepower: horsepower,
    acceleration_0_60_mph: safeParseString(vehicle['0-60 mph(s)'] || vehicle['0-60 mph'] || vehicle.acceleration_0_60_mph),
    top_speed_kmh: safeParseString(vehicle['Top Speed(km/h)'] || vehicle['Top Speed'] || vehicle.top_speed_kmh),
    
    // Economy fields
    fuel_economy_per_100km: fuelEconomyPer100km,
    fuel_economy_per_km: safeParseString(vehicle['Fuel Economy (/km)'] || vehicle.fuel_economy_per_km),
    annual_fuel_economy: safeParseString(vehicle['Annual Fuel Economy'] || vehicle.annual_fuel_economy),
    
    // Emissions fields
    tailpipe_emissions_per_100km: safeParseString(vehicle['Tailpipe emissions (/100 km)'] || vehicle.tailpipe_emissions_per_100km),
    tailpipe_emissions_per_km: safeParseString(vehicle['Tailpipe emissions /km'] || vehicle.tailpipe_emissions_per_km),
    annual_tailpipe_emissions: safeParseString(vehicle['Annual Tailpipe emissions '] || vehicle.annual_tailpipe_emissions),
    
    // Maintenance fields
    avg_maintenance_cost_per_100km: safeParseString(vehicle['Average maintenance cost (/100km)'] || vehicle.avg_maintenance_cost_per_100km),
    avg_maintenance_cost_per_km: safeParseString(vehicle['Average maintenance cost (/km)'] || vehicle.avg_maintenance_cost_per_km),
    annual_maintenance_cost: safeParseString(vehicle['Average annual maintenance cost'] || vehicle.annual_maintenance_cost),
    
    // TCO fields
    tco_yr1: safeParseString(vehicle['TCO Yr1'] || vehicle.tco_yr1),
    tco_yr2: safeParseString(vehicle['TCO Yr2'] || vehicle.tco_yr2),
    tco_yr3: safeParseString(vehicle['TCO Yr3'] || vehicle.tco_yr3),
    tco_yr4: safeParseString(vehicle['TCO Yr4'] || vehicle.tco_yr4),
    tco_yr5: safeParseString(vehicle['TCO Yr5'] || vehicle.tco_yr5),
    
    // Emissions yearly
    tailpipe_emissions_yr1: safeParseString(vehicle['Tailpipe Emissions Yr1'] || vehicle.tailpipe_emissions_yr1),
    tailpipe_emissions_yr2: safeParseString(vehicle['Tailpipe Emissions Yr2'] || vehicle.tailpipe_emissions_yr2),
    tailpipe_emissions_yr3: safeParseString(vehicle['Tailpipe Emissions Yr3'] || vehicle.tailpipe_emissions_yr3),
    tailpipe_emissions_yr4: safeParseString(vehicle['Tailpipe Emissions Yr4'] || vehicle.tailpipe_emissions_yr4),
    tailpipe_emissions_yr5: safeParseString(vehicle['Tailpipe Emissions Yr5'] || vehicle.tailpipe_emissions_yr5),
    
    // Other fields
    seating_capacity: seatingCapacity,
    ground_clearance_mm: safeParseString(vehicle['Ground Clearance(mm)'] || vehicle.ground_clearance_mm),
    cargo_capacity_l: safeParseString(vehicle['Cargo Capacity(L)'] || vehicle.cargo_capacity_l),
    tech_features: safeParseString(vehicle['Tech & Special Features'] || vehicle.tech_features),
    
    // Image
    image_url: safeParseString(vehicle.Image || vehicle.image_url),
    
    // ICE specific fields
    fuel_economy_ghs_per_km: safeParseString(vehicle['Fuel Economy (GHS/km)'] || vehicle.fuel_economy_ghs_per_km),
    ground_clearance: safeParseString(vehicle['Ground Clearance'] || vehicle.ground_clearance),
    apple_car_play: safeParseString(vehicle['Apple Car Play'] || vehicle.apple_car_play),
    body_type: safeParseString(vehicle['Body Type'] || vehicle.body_type),
    drive_type: safeParseString(vehicle['Drive Type'] || vehicle.drive_type),
    cargo_capacity: safeParseString(vehicle['Cargo Capacity'] || vehicle.cargo_capacity),
    engine_type: safeParseString(vehicle['Engine Type'] || vehicle.engine_type),
    android_auto: safeParseString(vehicle['Android Auto'] || vehicle.android_auto),
    
    // Original data (for debugging)
    _original: vehicle
  };
};

export const googleSheetsService = {
  async getAllVehicles() {
    try {
      const [evRes, iceRes] = await Promise.all([
        gSheets.get('EV!A:ZZ'),
        gSheets.get('ICE!A:ZZ')
      ]);

      const processRows = (data, type) => {
        if (!data || !data.values || data.values.length < 2) return [];
        const headers = data.values[0];
        return data.values.slice(1).map((row, idx) => {
          const rawVehicle = {};
          headers.forEach((h, i) => {
            if (h) rawVehicle[h] = row[i];
          });
          return normalizeVehicleData({
            ...rawVehicle,
            id: `${type}_${idx + 2}`,
            rowNumber: idx + 2,
            type: type
          }, type);
        }).filter(v => v.make); // Filter out empty rows
      };

      const evFormatted = processRows(evRes, 'ev');
      const iceFormatted = processRows(iceRes, 'ice');

      return [...evFormatted, ...iceFormatted];
    } catch (error) {
      console.error('Error in getAllVehicles:', error);
      return [];
    }
  },

  // ==================== EV VEHICLES ====================
  async getEVVehicles(page = 1, limit = 10, search = '') {
    try {
      const data = await gSheets.get('EV!A:ZZ');
      if (!data.values) return { data: [], count: 0 };

      const headers = data.values[0];
      let rows = data.values.slice(1).map((row, idx) => {
        const rawVehicle = {};
        headers.forEach((h, i) => {
          if (h) rawVehicle[h] = row[i];
        });
        return normalizeVehicleData({
          ...rawVehicle,
          id: idx + 2,
          rowNumber: idx + 2,
          type: 'ev'
        }, 'ev');
      }).filter(v => v.make); // Filter out empty rows

      if (search) {
        const s = search.toLowerCase();
        rows = rows.filter(r => 
          r.make?.toLowerCase().includes(s) || 
          r.model?.toLowerCase().includes(s) ||
          r.category?.toLowerCase().includes(s)
        );
      }

      const start = (page - 1) * limit;
      const paginated = rows.slice(start, start + limit);
      
      return { 
        data: paginated, 
        total: rows.length,
        count: rows.length
      };
    } catch (error) {
      console.error('Error in getEVVehicles:', error);
      return { data: [], count: 0 };
    }
  },

  async getEVVehicle(rowId) {
    try {
      const data = await gSheets.get('EV!A:ZZ');
      if (!data.values) throw new Error('No data found');
      
      const rowIndex = parseInt(rowId) - 1;
      if (rowIndex < 0 || rowIndex >= data.values.length - 1) {
        throw new Error('Vehicle not found');
      }
      
      const headers = data.values[0];
      const row = data.values[rowIndex + 1];
      const rawVehicle = {};
      headers.forEach((h, i) => {
        if (h) rawVehicle[h] = row[i];
      });
      
      return normalizeVehicleData({
        ...rawVehicle,
        id: rowId,
        rowNumber: rowId,
        type: 'ev'
      }, 'ev');
    } catch (error) {
      console.error('Error in getEVVehicle:', error);
      throw error;
    }
  },

  async createEVVehicle(vehicleData) {
    const row = EV_HEADERS.map(h => vehicleData[h] || vehicleData[h.toLowerCase()] || "");
    return await gSheets.append('EV!A1', row);
  },

  async updateEVVehicle(rowId, vehicleData) {
    const row = EV_HEADERS.map(h => vehicleData[h] !== undefined ? vehicleData[h] : "");
    return await gSheets.update(`EV!A${rowId}`, row);
  },

  async deleteEVVehicle(rowId) {
    return await gSheets.clear(`EV!A${rowId}:ZZ${rowId}`);
  },

  // ==================== ICE VEHICLES ====================
  async getICEVehicles(page = 1, limit = 10, search = '') {
    try {
      const data = await gSheets.get('ICE!A:ZZ');
      if (!data.values) return { data: [], count: 0 };

      const headers = data.values[0];
      let rows = data.values.slice(1).map((row, idx) => {
        const rawVehicle = {};
        headers.forEach((h, i) => {
          if (h) rawVehicle[h] = row[i];
        });
        return normalizeVehicleData({
          ...rawVehicle,
          id: idx + 2,
          rowNumber: idx + 2,
          type: 'ice'
        }, 'ice');
      }).filter(v => v.make); // Filter out empty rows

      if (search) {
        const s = search.toLowerCase();
        rows = rows.filter(r => 
          r.make?.toLowerCase().includes(s) || 
          r.model?.toLowerCase().includes(s) ||
          r.category?.toLowerCase().includes(s)
        );
      }

      const start = (page - 1) * limit;
      const paginated = rows.slice(start, start + limit);
      
      return { 
        data: paginated, 
        total: rows.length,
        count: rows.length
      };
    } catch (error) {
      console.error('Error in getICEVehicles:', error);
      return { data: [], count: 0 };
    }
  },

  async getICEVehicle(rowId) {
    try {
      const data = await gSheets.get('ICE!A:ZZ');
      if (!data.values) throw new Error('No data found');
      
      const rowIndex = parseInt(rowId) - 1;
      if (rowIndex < 0 || rowIndex >= data.values.length - 1) {
        throw new Error('Vehicle not found');
      }
      
      const headers = data.values[0];
      const row = data.values[rowIndex + 1];
      const rawVehicle = {};
      headers.forEach((h, i) => {
        if (h) rawVehicle[h] = row[i];
      });
      
      return normalizeVehicleData({
        ...rawVehicle,
        id: rowId,
        rowNumber: rowId,
        type: 'ice'
      }, 'ice');
    } catch (error) {
      console.error('Error in getICEVehicle:', error);
      throw error;
    }
  },

  async createICEVehicle(vehicleData) {
    const row = ICE_HEADERS.map(h => vehicleData[h] || vehicleData[h.toLowerCase()] || "");
    return await gSheets.append('ICE!A1', row);
  },

  async updateICEVehicle(rowId, vehicleData) {
    const row = ICE_HEADERS.map(h => vehicleData[h] !== undefined ? vehicleData[h] : "");
    return await gSheets.update(`ICE!A${rowId}`, row);
  },

  async deleteICEVehicle(rowId) {
    return await gSheets.clear(`ICE!A${rowId}:ZZ${rowId}`);
  },

  // ==================== DASHBOARD STATS ====================
  async getDashboardStats() {
    try {
      const [evRes, iceRes] = await Promise.all([
        gSheets.get('EV!A:ZZ'),
        gSheets.get('ICE!A:ZZ')
      ]);

      const evs = evRes.values ? evRes.values.slice(1) : [];
      const ices = iceRes.values ? iceRes.values.slice(1) : [];

      // Get unique makes
      const evMakes = [...new Set(evs.map(r => r[1] || '').filter(Boolean))];
      const iceMakes = [...new Set(ices.map(r => r[1] || '').filter(Boolean))];
      const allMakes = [...new Set([...evMakes, ...iceMakes])];

      // Get categories
      const evCategories = {};
      evs.forEach(r => {
        const cat = r[3] || 'Unknown';
        evCategories[cat] = (evCategories[cat] || 0) + 1;
      });

      const iceCategories = {};
      ices.forEach(r => {
        const cat = r[3] || 'Unknown';
        iceCategories[cat] = (iceCategories[cat] || 0) + 1;
      });

      // Get engine types for ICE
      const engineTypes = {};
      ices.forEach(r => {
        const engine = r[34] || 'Unknown';
        engineTypes[engine] = (engineTypes[engine] || 0) + 1;
      });

      // Calculate average prices - properly parse numbers
      const validEVPrices = evs.map(r => {
        const price = r[4];
        if (price && price !== '') {
          const parsed = typeof price === 'number' ? price : parseFloat(String(price).replace(/[$,]/g, ''));
          return !isNaN(parsed) && parsed > 0 ? parsed : 0;
        }
        return 0;
      }).filter(p => p > 0);
      
      const validICEPrices = ices.map(r => {
        const price = r[4];
        if (price && price !== '') {
          const parsed = typeof price === 'number' ? price : parseFloat(String(price).replace(/[$,]/g, ''));
          return !isNaN(parsed) && parsed > 0 ? parsed : 0;
        }
        return 0;
      }).filter(p => p > 0);
      
      const avgEVPrice = validEVPrices.length > 0 
        ? Math.round(validEVPrices.reduce((a, b) => a + b, 0) / validEVPrices.length)
        : 0;
      
      const avgICEPrice = validICEPrices.length > 0 
        ? Math.round(validICEPrices.reduce((a, b) => a + b, 0) / validICEPrices.length)
        : 0;

      // Calculate average horsepower
      const evHP = evs.map(r => parseFloat(r[32])).filter(h => !isNaN(h) && h > 0);
      const iceHP = ices.map(r => parseFloat(r[37])).filter(h => !isNaN(h) && h > 0);
      
      const avgEVHP = evHP.length > 0 
        ? Math.round(evHP.reduce((a, b) => a + b, 0) / evHP.length)
        : 0;
      
      const avgICEHP = iceHP.length > 0 
        ? Math.round(iceHP.reduce((a, b) => a + b, 0) / iceHP.length)
        : 0;

      // Get top brands
      const getTopBrands = (vehicles, limit) => {
        const brandCount = {};
        vehicles.forEach(v => {
          const brand = v[1];
          if (brand) {
            brandCount[brand] = (brandCount[brand] || 0) + 1;
          }
        });
        return Object.entries(brandCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([brand, count]) => ({ brand, count }));
      };

      return {
        totalEV: evs.length,
        totalICE: ices.length,
        totalVehicles: evs.length + ices.length,
        uniqueMakes: allMakes.length,
        evByCategory: Object.entries(evCategories).map(([category, count]) => ({ category, count })),
        iceByCategory: Object.entries(iceCategories).map(([category, count]) => ({ category, count })),
        fuelTypes: Object.entries(engineTypes).map(([type, count]) => ({ type, count })),
        avgEVPrice: avgEVPrice,
        avgICEPrice: avgICEPrice,
        avgEVHP: avgEVHP,
        avgICEHP: avgICEHP,
        topEVBrands: getTopBrands(evs, 5),
        topICEBrands: getTopBrands(ices, 5)
      };
    } catch (error) {
      console.error("Stats error:", error);
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
      };
    }
  }
};