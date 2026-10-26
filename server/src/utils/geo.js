import https from 'https';
import http from 'http';
import { ENV } from '../config/env.js';
import ApiError from './ApiError.js';

// Simple in-memory cache to respect Nominatim usage policy & speed up repetitive requests
const geoCache = new Map();

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(
      url,
      {
        headers: {
          'Accept': 'application/json',
          ...headers,
        },
        timeout: 8000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data.slice(0, 100)}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Geocoding request timed out'));
    });

    req.on('error', (err) => reject(err));
  });
}

/**
 * Nominatim OpenStreetMap Reverse Geocoding Adapter
 */
async function reverseGeocodeNominatim(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
  const headers = {
    'User-Agent': 'FynDry-ECommerce-Platform/1.0 (support@fyndry.com)',
  };

  const data = await fetchJson(url, headers);
  if (!data || data.error) {
    throw new ApiError(404, data?.error || 'Unable to resolve address from coordinates');
  }

  const addr = data.address || {};

  const addressLine2 =
    addr.road ||
    addr.suburb ||
    addr.neighbourhood ||
    addr.residential ||
    addr.village ||
    '';

  const city =
    addr.city ||
    addr.town ||
    addr.city_district ||
    addr.village ||
    addr.state_district ||
    addr.county ||
    '';

  const state = addr.state || '';
  const pincode = (addr.postcode || '').replace(/\D/g, '').slice(0, 6);
  const formattedAddress = data.display_name || '';

  return {
    addressLine2,
    city,
    state,
    pincode,
    formattedAddress,
    provider: 'nominatim',
  };
}

/**
 * Google Geocoding API Adapter
 */
async function reverseGeocodeGoogle(lat, lng) {
  if (!ENV.GOOGLE_MAPS_API_KEY) {
    throw new ApiError(500, 'Google Maps API key is not configured in environment variables');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${ENV.GOOGLE_MAPS_API_KEY}`;
  const data = await fetchJson(url);

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new ApiError(404, `Google Geocoding error: ${data.status}`);
  }

  const firstResult = data.results[0];
  const components = firstResult.address_components || [];

  let route = '';
  let sublocality = '';
  let city = '';
  let state = '';
  let pincode = '';

  for (const comp of components) {
    const types = comp.types || [];
    if (types.includes('route')) route = comp.long_name;
    if (types.includes('sublocality') || types.includes('sublocality_level_1')) sublocality = comp.long_name;
    if (types.includes('locality')) city = comp.long_name;
    else if (!city && types.includes('administrative_area_level_2')) city = comp.long_name;
    if (types.includes('administrative_area_level_1')) state = comp.long_name;
    if (types.includes('postal_code')) pincode = comp.long_name;
  }

  const addressLine2 = [sublocality, route].filter(Boolean).join(', ');
  const formattedAddress = firstResult.formatted_address || '';

  return {
    addressLine2,
    city,
    state,
    pincode,
    formattedAddress,
    provider: 'google',
  };
}

/**
 * Universal reverse geocode interface
 * @param {number|string} latitude
 * @param {number|string} longitude
 */
export async function reverseGeocode(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new ApiError(400, 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required');
  }

  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geoCache.has(cacheKey)) {
    return geoCache.get(cacheKey);
  }

  let result;
  const provider = (ENV.GEO_PROVIDER || 'nominatim').toLowerCase();

  if (provider === 'google' && ENV.GOOGLE_MAPS_API_KEY) {
    result = await reverseGeocodeGoogle(lat, lng);
  } else {
    // Default Nominatim
    try {
      result = await reverseGeocodeNominatim(lat, lng);
    } catch (nominatimErr) {
      if (ENV.GOOGLE_MAPS_API_KEY) {
        result = await reverseGeocodeGoogle(lat, lng);
      } else {
        throw nominatimErr;
      }
    }
  }

  // Cache up to 100 recent coordinate responses
  if (geoCache.size > 100) {
    const firstKey = geoCache.keys().next().value;
    geoCache.delete(firstKey);
  }
  geoCache.set(cacheKey, result);

  return result;
}

export default { reverseGeocode };
