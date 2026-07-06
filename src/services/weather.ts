// src/services/weather.ts
// Phase 3B – restored legacy exports for Hub components + new functions

import type { LocalReport, LocationUpdateCategory } from '../types/news';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY ?? '';
const BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// ── Legacy types (used by existing Hub components) ──

export interface WeatherAlert {
  id: string;
  severity: 'moderate' | 'severe' | 'extreme';
  description: string;
  start: string;
  end: string;
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

export interface WeatherData {
  current: CurrentWeather;
  alerts: WeatherAlert[];
  forecast: Array<{
    dt: number;
    temp: { day: number };
    weather: Array<{ description: string; icon: string }>;
  }>;
}

export function getWeatherAlertColor(severity: string): string {
  switch (severity) {
    case 'extreme': return '#FF1744';
    case 'severe': return '#FF5722';
    case 'moderate': return '#FFC107';
    default: return '#42A5F5';
  }
}

export function getWeatherAlertIcon(severity: string): string {
  switch (severity) {
    case 'extreme': return 'warning';
    case 'severe': return 'alert-circle';
    case 'moderate': return 'information-circle';
    default: return 'cloud';
  }
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export async function fetchWeatherData(city: { latitude: number; longitude: number }): Promise<WeatherData | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(
      `${BASE_URL}?lat=${city.latitude}&lon=${city.longitude}&exclude=minutely,hourly&units=metric&appid=${API_KEY}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return {
      current: {
        temp: json.current.temp,
        feels_like: json.current.feels_like,
        humidity: json.current.humidity,
        wind_speed: json.current.wind_speed,
        description: json.current.weather[0].description,
        icon: json.current.weather[0].icon,
      },
      alerts: (json.alerts || []).map((a: any) => ({
        id: `alert-${a.start}`,
        severity: a.tags.includes('extreme') ? 'extreme' : a.tags.includes('severe') ? 'severe' : 'moderate',
        description: a.description,
        start: new Date(a.start * 1000).toISOString(),
        end: new Date(a.end * 1000).toISOString(),
      })),
      forecast: (json.daily || []).map((d: any) => ({
        dt: d.dt,
        temp: { day: d.temp.day },
        weather: [{ description: d.weather[0].description, icon: d.weather[0].icon }],
      })),
    };
  } catch {
    return null;
  }
}

// ── New functions for Near Me Alerts ──

interface CityCoords {
  name: string;
  latitude: number;
  longitude: number;
}

function mapToLocalAlert(city: CityCoords, data: WeatherData): LocalReport {
  return {
    id: `weather-${city.name}-${Date.now()}`,
    category: 'weather' as LocationUpdateCategory,
    description: `${data.current.description}, ${Math.round(data.current.temp)}°C`,
    latitude: city.latitude,
    longitude: city.longitude,
    locationName: city.name,
    reportedBy: 'system',
    votesConfirm: 0,
    votesDeny: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
}

export async function fetchWeatherAlerts(city: CityCoords): Promise<LocalReport[]> {
  const data = await fetchWeatherData(city);
  if (!data) return [];
  return [mapToLocalAlert(city, data)];
}

export async function fetchWeatherForecast(city: CityCoords): Promise<WeatherData | null> {
  return fetchWeatherData(city);
}