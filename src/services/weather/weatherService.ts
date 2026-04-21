// src/services/weather/weatherService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_KEYS, LIMITS, STORAGE_KEYS } from '@/config/constants';
import type {
  WeatherData,
  WeatherAlert,
  WeatherAlertType,
  WeatherAlertSeverity,
  CurrentWeather,
  WeatherForecastHour,
} from './types';

const TAG = '[WeatherService]';

// OpenWeatherMap FREE API endpoints
const OWM_API = {
  current: 'https://api.openweathermap.org/data/2.5/weather',
  forecast: 'https://api.openweathermap.org/data/2.5/forecast',
};

// Cache for weather data
interface WeatherCache {
  data: WeatherData;
  timestamp: number;
  latitude: number;
  longitude: number;
}

let weatherCache: WeatherCache | null = null;

/**
 * Map weather condition to alert type (for severe weather)
 */
function mapConditionToAlertType(conditionId: number): WeatherAlertType | null {
  // OpenWeatherMap condition codes: https://openweathermap.org/weather-conditions
  if (conditionId >= 200 && conditionId < 300) return 'thunderstorm';
  if (conditionId >= 500 && conditionId < 600) return 'rain';
  if (conditionId >= 600 && conditionId < 700) return 'cold';
  if (conditionId >= 700 && conditionId < 800) {
    if (conditionId === 781) return 'wind'; // Tornado
    if (conditionId === 751 || conditionId === 761) return 'dust';
    if (conditionId === 741) return 'fog';
    return 'other';
  }
  return null;
}

/**
 * Check if weather condition is severe enough to be an alert
 */
function isSevereCondition(conditionId: number, windSpeed: number): boolean {
  // Thunderstorms
  if (conditionId >= 200 && conditionId < 300) return true;
  // Heavy rain (502, 503, 504, 511, 520-531)
  if (conditionId >= 502 && conditionId < 600) return true;
  // Snow/sleet
  if (conditionId >= 600 && conditionId < 700) return true;
  // Atmospheric conditions (fog, dust, tornado)
  if (conditionId >= 700 && conditionId < 800) return true;
  // High wind (> 50 km/h)
  if (windSpeed > 50) return true;
  
  return false;
}

/**
 * Create weather alert from current conditions if severe
 */
function createAlertFromConditions(
  current: CurrentWeather,
  conditionId: number,
  locationName: string
): WeatherAlert | null {
  if (!isSevereCondition(conditionId, current.windSpeed)) {
    return null;
  }

  const alertType = mapConditionToAlertType(conditionId) || 'other';
  
  // Determine severity based on condition
  let severity: WeatherAlertSeverity = 'minor';
  if (conditionId >= 202 && conditionId <= 212) severity = 'severe'; // Heavy thunderstorm
  if (conditionId === 781) severity = 'extreme'; // Tornado
  if (conditionId >= 502 && conditionId <= 504) severity = 'moderate'; // Heavy rain
  if (current.windSpeed > 80) severity = 'severe';
  if (current.windSpeed > 100) severity = 'extreme';

  const now = new Date();
  const endTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

  return {
    id: `weather-alert-${conditionId}-${now.getTime()}`,
    type: alertType,
    severity,
    title: `${current.condition} Warning`,
    description: `Current conditions: ${current.description}. Wind speed: ${current.windSpeed} km/h. Take precautions.`,
    sender: 'OpenWeatherMap',
    start: now,
    end: endTime,
    areas: [locationName],
    tags: [alertType, current.condition.toLowerCase()],
  };
}

/**
 * Parse current weather from OWM response
 */
function parseCurrentWeather(data: any): { current: CurrentWeather; conditionId: number } {
  const weather = data.weather[0];
  return {
    current: {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // m/s to km/h
      windDirection: data.wind?.deg || 0,
      description: weather.description,
      icon: weather.icon,
      condition: weather.main,
      visibility: (data.visibility || 10000) / 1000, // m to km
      pressure: data.main.pressure,
      updatedAt: new Date(data.dt * 1000),
    },
    conditionId: weather.id,
  };
}

/**
 * Parse hourly forecast from OWM 5-day forecast response
 */
function parseHourlyForecast(data: any): WeatherForecastHour[] {
  if (!data?.list || !Array.isArray(data.list)) return [];

  // OWM free tier gives 3-hour intervals, take first 8 (24 hours)
  return data.list.slice(0, 8).map((item: any) => ({
    time: new Date(item.dt * 1000),
    temperature: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    windSpeed: Math.round((item.wind?.speed || 0) * 3.6),
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    precipProbability: Math.round((item.pop || 0) * 100),
  }));
}

/**
 * Fetch weather data from OpenWeatherMap FREE API
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  forceRefresh = false
): Promise<WeatherData> {
  console.log(TAG, `Fetching weather for ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);

  // Check memory cache
  if (!forceRefresh && weatherCache) {
    const cacheAge = Date.now() - weatherCache.timestamp;
    const distance = Math.sqrt(
      Math.pow(weatherCache.latitude - latitude, 2) +
      Math.pow(weatherCache.longitude - longitude, 2)
    );

    // Use cache if less than 30 min old and within ~10km
    if (cacheAge < LIMITS.weather.refreshIntervalMs && distance < 0.1) {
      console.log(TAG, 'Using cached weather data');
      return weatherCache.data;
    }
  }

  // Check persisted cache
  if (!forceRefresh) {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.weatherCache);
      if (stored) {
        const parsed = JSON.parse(stored) as WeatherCache;
        const cacheAge = Date.now() - parsed.timestamp;
        if (cacheAge < LIMITS.weather.refreshIntervalMs) {
          console.log(TAG, 'Using persisted weather cache');
          // Restore Date objects
          parsed.data.current.updatedAt = new Date(parsed.data.current.updatedAt);
          parsed.data.alerts = parsed.data.alerts.map(a => ({
            ...a,
            start: new Date(a.start),
            end: new Date(a.end),
          }));
          parsed.data.hourlyForecast = parsed.data.hourlyForecast.map(h => ({
            ...h,
            time: new Date(h.time),
          }));
          weatherCache = parsed;
          return parsed.data;
        }
      }
    } catch (err) {
      console.warn(TAG, 'Failed to read weather cache:', err);
    }
  }

  // Fetch current weather (FREE endpoint)
  try {
    const currentUrl = `${OWM_API.current}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEYS.openWeatherMap}`;
    const currentResponse = await fetch(currentUrl);

    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();
      console.error(TAG, `Current weather API error: ${currentResponse.status}`, errorText);
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();
    const { current, conditionId } = parseCurrentWeather(currentData);
    const locationName = currentData.name || 'Your Location';

    // Fetch forecast (FREE endpoint)
    let hourlyForecast: WeatherForecastHour[] = [];
    try {
      const forecastUrl = `${OWM_API.forecast}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEYS.openWeatherMap}`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        hourlyForecast = parseHourlyForecast(forecastData);
      }
    } catch (forecastErr) {
      console.warn(TAG, 'Forecast fetch failed, continuing without:', forecastErr);
    }

    // Create alert if conditions are severe
    const alerts: WeatherAlert[] = [];
    const alert = createAlertFromConditions(current, conditionId, locationName);
    if (alert) {
      alerts.push(alert);
      console.log(TAG, `Created weather alert: ${alert.title}`);
    }

    const weatherData: WeatherData = {
      location: {
        name: locationName,
        latitude,
        longitude,
      },
      current,
      alerts,
      hourlyForecast,
    };

    // Update cache
    weatherCache = {
      data: weatherData,
      timestamp: Date.now(),
      latitude,
      longitude,
    };

    // Persist cache
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.weatherCache, JSON.stringify(weatherCache));
    } catch (err) {
      console.warn(TAG, 'Failed to persist weather cache:', err);
    }

    console.log(TAG, `Fetched weather: ${current.condition}, ${current.temperature}°C, ${alerts.length} alerts`);
    return weatherData;
  } catch (error) {
    console.error(TAG, 'Failed to fetch weather:', error);

    // Return cached data if available
    if (weatherCache) {
      console.log(TAG, 'Returning stale cache after error');
      return weatherCache.data;
    }

    // Return empty data
    return {
      location: { name: 'Unknown', latitude, longitude },
      current: {
        temperature: 0,
        feelsLike: 0,
        humidity: 0,
        windSpeed: 0,
        windDirection: 0,
        description: 'Unable to load',
        icon: '01d',
        condition: 'Unknown',
        visibility: 0,
        pressure: 0,
        updatedAt: new Date(),
      },
      alerts: [],
      hourlyForecast: [],
    };
  }
}

/**
 * Get only active weather alerts
 */
export async function getActiveWeatherAlerts(
  latitude: number,
  longitude: number
): Promise<WeatherAlert[]> {
  const weather = await fetchWeatherData(latitude, longitude);
  const now = new Date();

  return weather.alerts.filter(
    (alert) => alert.start <= now && alert.end >= now
  );
}

/**
 * Get weather icon URL
 */
export function getWeatherIconUrl(icon: string, size: '1x' | '2x' | '4x' = '2x'): string {
  const sizeMap = { '1x': '', '2x': '@2x', '4x': '@4x' };
  return `https://openweathermap.org/img/wn/${icon}${sizeMap[size]}.png`;
}

/**
 * Get weather condition color
 */
export function getWeatherAlertColor(severity: WeatherAlertSeverity): string {
  switch (severity) {
    case 'extreme':
      return '#D32F2F'; // Red
    case 'severe':
      return '#F57C00'; // Orange
    case 'moderate':
      return '#FBC02D'; // Yellow
    case 'minor':
      return '#1976D2'; // Blue
    default:
      return '#757575'; // Grey
  }
}

/**
 * Get weather alert icon
 */
export function getWeatherAlertIcon(type: WeatherAlertType): string {
  switch (type) {
    case 'thunderstorm':
      return 'thunderstorm';
    case 'rain':
      return 'rainy';
    case 'flood':
      return 'water';
    case 'wind':
      return 'flag';
    case 'heat':
      return 'sunny';
    case 'cold':
      return 'snow';
    case 'fog':
      return 'cloud';
    case 'fire':
      return 'flame';
    case 'dust':
      return 'cloudy';
    default:
      return 'warning';
  }
}

/**
 * Clear weather cache
 */
export async function clearWeatherCache(): Promise<void> {
  weatherCache = null;
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.weatherCache);
  } catch (err) {
    console.warn(TAG, 'Failed to clear weather cache:', err);
  }
}