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
  '0-60 mph(s)', 'Top Speed (km/h)', 'Horsepower',
  'Image URL'
];

// Exact headers from your "ICE" sheet - UPDATED to match your actual columns
const ICE_HEADERS = [
  'Image', 'Make', 'Model', 'Category', 'Price (USD)', 'Exchange Rate', 'Price (GHS)', 
  'Fuel Economy (/km)', 'Fuel Economy (/100 km)', 'Annual Fuel Economy', 
  'Tailpipe emissions /km', 'Tailpipe emissions (/100 km)', 'Annual Tailpipe emissions ', 
  'Average maintenance cost (/km)', 'Average maintenance cost (/100km)', 
  'Average annual maintenance cost', 'TCO Yr1', 'TCO Yr2', 'TCO Yr3', 'TCO Yr4', 'TCO Yr5', 
  'Tailpipe Emissions Yr1', 'Tailpipe Emissions Yr2', 'Tailpipe Emissions Yr3', 
  'Tailpipe Emissions Yr4', 'Tailpipe Emissions Yr5', 'Seating Capacity', 
  'Ground Clearance', 'Tech & Special Features', 'Cargo Capacity', 
  '0-60 mph', 'Top Speed', 'Horsepower', 
  'Apple Car Play', 'Body Type', 'Drive Type', 'Engine Type',
  'Image URL'  // ← Last column
];

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

// Maps a normalized vehicle object back to a sheet row
const vehicleToRow = (headers, vehicleData, preserveExistingImageUrl = true) => {
  const headerToField = {
    'Image URL': preserveExistingImageUrl ? null : 'image_url',
    'Make': 'make',
    'Model': 'model',
    'Category': 'category',
    'Price (USD)': 'price_usd',
    'Price (GHS)': 'price_ghs',
    'Exhange Rate': 'exchange_rate',
    'Exchange Rate': 'exchange_rate',
    'Fuel Economy (/km)': 'fuel_economy_per_km',
    'Fuel Economy (/100 km)': 'fuel_economy_per_100km',
    'Annual Fuel Economy': 'annual_fuel_economy',
    'Tailpipe emissions /km': 'tailpipe_emissions_per_km',
    'Tailpipe emissions (/100 km)': 'tailpipe_emissions_per_100km',
    'Tailpipe emissions /100 km': 'tailpipe_emissions_per_100km',
    'Annual Tailpipe emissions ': 'annual_tailpipe_emissions',
    'Average maintenance cost (/km)': 'avg_maintenance_cost_per_km',
    'Average maintenance cost (/100km)': 'avg_maintenance_cost_per_100km',
    'Average annual maintenance cost': 'annual_maintenance_cost',
    'TCO Yr1': 'tco_yr1',
    'TCO Yr2': 'tco_yr2',
    'TCO Yr3': 'tco_yr3',
    'TCO Yr4': 'tco_yr4',
    'TCO Yr5': 'tco_yr5',
    'Tailpipe Emissions Yr1': 'tailpipe_emissions_yr1',
    'Tailpipe Emissions Yr2': 'tailpipe_emissions_yr2',
    'Tailpipe Emissions Yr3': 'tailpipe_emissions_yr3',
    'Tailpipe Emissions Yr4': 'tailpipe_emissions_yr4',
    'Tailpipe Emissions Yr5': 'tailpipe_emissions_yr5',
    'Seating Capacity': 'seating_capacity',
    'Ground Clearance(mm)': 'ground_clearance_mm',
    'Ground Clearance': 'ground_clearance',
    'Tech & Special Features': 'tech_features',
    'Cargo Capacity(L)': 'cargo_capacity_l',
    'Cargo Capacity': 'cargo_capacity',
    '0-60 mph(s)': 'acceleration_0_60_mph',
    '0-60 mph': 'acceleration_0_60_mph',
    'Top Speed (km/h)': 'top_speed_kmh',
    'Top Speed': 'top_speed',
    'Horsepower': 'horsepower',
    'Apple Car Play': 'apple_car_play',
    'Body Type': 'body_type',
    'Drive Type': 'drive_type',
    'Engine Type': 'engine_type',
    'Fuel Economy (GHS/km)': 'fuel_economy_ghs_per_km',
  };

  return headers.map(header => {
    const field = headerToField[header];
    if (!field) return '';
    if (preserveExistingImageUrl && header === 'Image URL') {
      return '';
    }
    const val = vehicleData[field];
    if (val === undefined || val === null) return '';
    return val;
  });
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
  const fuelEconomyPerKm = safeParseString(vehicle['Fuel Economy (/km)'] || vehicle.fuel_economy_per_km);
  const annualFuelEconomy = safeParseString(vehicle['Annual Fuel Economy'] || vehicle.annual_fuel_economy);
  
  // Parse top speed
  let topSpeedValue = '';
  if (type === 'ev') {
    topSpeedValue = safeParseString(
      vehicle['Top Speed (km/h)'] || 
      vehicle['Top Speed'] || 
      vehicle.top_speed_kmh || 
      vehicle.top_speed
    );
  } else {
    topSpeedValue = safeParseString(
      vehicle['Top Speed'] || 
      vehicle['Top Speed (km/h)'] || 
      vehicle.top_speed || 
      vehicle.top_speed_kmh
    );
  }
  
  if (topSpeedValue) {
    const numberMatch = topSpeedValue.match(/\d+/);
    if (numberMatch) {
      topSpeedValue = numberMatch[0];
    }
  }
  
  // Parse acceleration
  let accelerationValue = '';
  if (type === 'ev') {
    accelerationValue = safeParseString(vehicle['0-60 mph(s)'] || vehicle.acceleration_0_60_mph);
  } else {
    accelerationValue = safeParseString(vehicle['0-60 mph'] || vehicle.acceleration_0_60_mph);
  }
  
  // Parse emissions
  const tailpipePer100km = safeParseString(vehicle['Tailpipe emissions (/100 km)'] || vehicle.tailpipe_emissions_per_100km);
  const tailpipePerKm = safeParseString(vehicle['Tailpipe emissions /km'] || vehicle.tailpipe_emissions_per_km);
  const annualTailpipe = safeParseString(vehicle['Annual Tailpipe emissions '] || vehicle.annual_tailpipe_emissions);
  
  // Parse maintenance
  const maintenancePer100km = safeParseString(vehicle['Average maintenance cost (/100km)'] || vehicle.avg_maintenance_cost_per_100km);
  const maintenancePerKm = safeParseString(vehicle['Average maintenance cost (/km)'] || vehicle.avg_maintenance_cost_per_km);
  const annualMaintenance = safeParseString(vehicle['Average annual maintenance cost'] || vehicle.annual_maintenance_cost);
  
  // Parse TCO
  const tcoYr1 = safeParseString(vehicle['TCO Yr1'] || vehicle.tco_yr1);
  const tcoYr2 = safeParseString(vehicle['TCO Yr2'] || vehicle.tco_yr2);
  const tcoYr3 = safeParseString(vehicle['TCO Yr3'] || vehicle.tco_yr3);
  const tcoYr4 = safeParseString(vehicle['TCO Yr4'] || vehicle.tco_yr4);
  const tcoYr5 = safeParseString(vehicle['TCO Yr5'] || vehicle.tco_yr5);
  
  // Parse emissions yearly
  const emissionsYr1 = safeParseString(vehicle['Tailpipe Emissions Yr1'] || vehicle.tailpipe_emissions_yr1);
  const emissionsYr2 = safeParseString(vehicle['Tailpipe Emissions Yr2'] || vehicle.tailpipe_emissions_yr2);
  const emissionsYr3 = safeParseString(vehicle['Tailpipe Emissions Yr3'] || vehicle.tailpipe_emissions_yr3);
  const emissionsYr4 = safeParseString(vehicle['Tailpipe Emissions Yr4'] || vehicle.tailpipe_emissions_yr4);
  const emissionsYr5 = safeParseString(vehicle['Tailpipe Emissions Yr5'] || vehicle.tailpipe_emissions_yr5);
  
  // Parse other fields
  const groundClearance = safeParseString(vehicle['Ground Clearance'] || vehicle.ground_clearance);
  const cargoCapacity = safeParseString(vehicle['Cargo Capacity'] || vehicle.cargo_capacity);
  const techFeatures = safeParseString(vehicle['Tech & Special Features'] || vehicle.tech_features);
  const appleCarPlay = safeParseString(vehicle['Apple Car Play'] || vehicle.apple_car_play);
  const bodyType = safeParseString(vehicle['Body Type'] || vehicle.body_type);
  const driveType = safeParseString(vehicle['Drive Type'] || vehicle.drive_type);
  const engineType = safeParseString(vehicle['Engine Type'] || vehicle.engine_type);
  const fuelEconomyGhsPerKm = safeParseString(vehicle['Fuel Economy (GHS/km)'] || vehicle.fuel_economy_ghs_per_km);
  
  return {
    // Core fields
    id: vehicle.id,
    displayId: vehicle.rowNumber || vehicle.id,
    type: type,
    displayType: type.toUpperCase(),
    make: safeParseString(vehicle.Make || vehicle.make),
    model: safeParseString(vehicle.Model || vehicle.model),
    category: safeParseString(vehicle.Category || vehicle.category),
    
    // Price fields
    price_usd: priceUSD,
    price_ghs: priceGHS,
    exchange_rate: safeParseString(vehicle['Exchange Rate'] || vehicle['Exhange Rate'] || vehicle.exchange_rate),
    
    // Performance fields
    horsepower: horsepower,
    acceleration_0_60_mph: accelerationValue,
    top_speed_kmh: topSpeedValue,
    top_speed: topSpeedValue,
    
    // Economy fields
    fuel_economy_per_100km: fuelEconomyPer100km,
    fuel_economy_per_km: fuelEconomyPerKm,
    annual_fuel_economy: annualFuelEconomy,
    
    // Emissions fields
    tailpipe_emissions_per_100km: tailpipePer100km,
    tailpipe_emissions_per_km: tailpipePerKm,
    annual_tailpipe_emissions: annualTailpipe,
    
    // Maintenance fields
    avg_maintenance_cost_per_100km: maintenancePer100km,
    avg_maintenance_cost_per_km: maintenancePerKm,
    annual_maintenance_cost: annualMaintenance,
    
    // TCO fields
    tco_yr1: tcoYr1,
    tco_yr2: tcoYr2,
    tco_yr3: tcoYr3,
    tco_yr4: tcoYr4,
    tco_yr5: tcoYr5,
    
    // TCO object
    tco: {
      year1: tcoYr1,
      year2: tcoYr2,
      year3: tcoYr3,
      year4: tcoYr4,
      year5: tcoYr5
    },
    
    // Emissions yearly
    tailpipe_emissions_yr1: emissionsYr1,
    tailpipe_emissions_yr2: emissionsYr2,
    tailpipe_emissions_yr3: emissionsYr3,
    tailpipe_emissions_yr4: emissionsYr4,
    tailpipe_emissions_yr5: emissionsYr5,
    
    // Emissions object
    emissions: {
      year1: emissionsYr1,
      year2: emissionsYr2,
      year3: emissionsYr3,
      year4: emissionsYr4,
      year5: emissionsYr5
    },
    
    // Other fields
    seating_capacity: seatingCapacity,
    ground_clearance_mm: groundClearance,
    ground_clearance: groundClearance,
    cargo_capacity_l: cargoCapacity,
    cargo_capacity: cargoCapacity,
    tech_features: techFeatures,
    apple_car_play: appleCarPlay,
    body_type: bodyType,
    drive_type: driveType,
    engine_type: engineType,
    fuel_economy_ghs_per_km: fuelEconomyGhsPerKm,
    
    // image_url comes from the 'Image URL' column
    image_url: safeParseString(vehicle['Image URL'] || vehicle.image_url),
    
    // Original data (for debugging)
    _original: vehicle
  };
};

// Converts a 0-based column index to a Sheets column letter
const columnIndexToLetter = (index) => {
  let letter = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
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
        }).filter(v => v.make);
      };

      const evFormatted = processRows(evRes, 'ev');
      const iceFormatted = processRows(iceRes, 'ice');

      return [...evFormatted, ...iceFormatted];
    } catch (error) {
      console.error('Error in getAllVehicles:', error);
      return [];
    }
  },

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
      }).filter(v => v.make);

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
      if (rowIndex < 1 || rowIndex >= data.values.length) {
        throw new Error('Vehicle not found');
      }
      
      const headers = data.values[0];
      const row = data.values[rowIndex];
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
    const row = vehicleToRow(EV_HEADERS, vehicleData, false);
    return await gSheets.append('EV!A1', row);
  },

  async updateEVVehicle(rowId, vehicleData) {
    const row = vehicleToRow(EV_HEADERS, vehicleData, true);
    return await gSheets.update(`EV!A${rowId}`, row);
  },

  async updateEVImageUrl(rowId, imageUrl) {
    const colIndex = EV_HEADERS.indexOf('Image URL');
    const colLetter = columnIndexToLetter(colIndex);
    return await gSheets.update(`EV!${colLetter}${rowId}`, [imageUrl]);
  },

  async deleteEVVehicle(rowId) {
    return await gSheets.clear(`EV!A${rowId}:ZZ${rowId}`);
  },

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
      }).filter(v => v.make);

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
      if (rowIndex < 1 || rowIndex >= data.values.length) {
        throw new Error('Vehicle not found');
      }
      
      const headers = data.values[0];
      const row = data.values[rowIndex];
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
    const row = vehicleToRow(ICE_HEADERS, vehicleData, false);
    return await gSheets.append('ICE!A1', row);
  },

  async updateICEVehicle(rowId, vehicleData) {
    const row = vehicleToRow(ICE_HEADERS, vehicleData, true);
    return await gSheets.update(`ICE!A${rowId}`, row);
  },

  async updateICEImageUrl(rowId, imageUrl) {
    const colIndex = ICE_HEADERS.indexOf('Image URL');
    if (colIndex === -1) {
      console.error('Image URL column not found in ICE_HEADERS');
      throw new Error('Image URL column not configured');
    }
    const colLetter = columnIndexToLetter(colIndex);
    console.log(`Updating ICE image URL: ${colLetter}${rowId} with URL: ${imageUrl}`);
    return await gSheets.update(`ICE!${colLetter}${rowId}`, [imageUrl]);
  },

  async deleteICEVehicle(rowId) {
    return await gSheets.clear(`ICE!A${rowId}:ZZ${rowId}`);
  },

  async getDashboardStats() {
    try {
      const [evRes, iceRes] = await Promise.all([
        gSheets.get('EV!A:ZZ'),
        gSheets.get('ICE!A:ZZ')
      ]);

      const evs = evRes.values ? evRes.values.slice(1) : [];
      const ices = iceRes.values ? iceRes.values.slice(1) : [];

      const evMakes = [...new Set(evs.map(r => r[1] || '').filter(Boolean))];
      const iceMakes = [...new Set(ices.map(r => r[1] || '').filter(Boolean))];
      const allMakes = [...new Set([...evMakes, ...iceMakes])];

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

      const engineTypes = {};
      ices.forEach(r => {
        const engine = r[37] || 'Unknown';
        engineTypes[engine] = (engineTypes[engine] || 0) + 1;
      });

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

      const evHP = evs.map(r => parseFloat(r[32])).filter(h => !isNaN(h) && h > 0);
      const iceHP = ices.map(r => parseFloat(r[32])).filter(h => !isNaN(h) && h > 0);
      
      const avgEVHP = evHP.length > 0 
        ? Math.round(evHP.reduce((a, b) => a + b, 0) / evHP.length)
        : 0;
      
      const avgICEHP = iceHP.length > 0 
        ? Math.round(iceHP.reduce((a, b) => a + b, 0) / iceHP.length)
        : 0;

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