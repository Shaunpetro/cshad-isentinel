// src/services/weather/types.ts

export type WeatherAlertSeverity = 'extreme' | 'severe' | 'moderate' | 'minor';

export type WeatherAlertType =
  | 'thunderstorm'
  | 'rain'
  | 'flood'
  | 'wind'
  | 'heat'
  | 'cold'
  | 'fog'
  | 'fire'
  | 'dust'
  | 'other';

export interface WeatherAlert {
  id: string;
  type: WeatherAlertType;
  severity: WeatherAlertSeverity;
  title: string;
  description: string;
  sender: string;
  start: Date;
  end: Date;
  areas: string[];
  tags: string[];
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  condition: string;
  visibility: number;
  pressure: number;
  updatedAt: Date;
}

export interface WeatherForecastHour {
  time: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  precipProbability: number;
}

export interface WeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  current: CurrentWeather;
  alerts: WeatherAlert[];
  hourlyForecast: WeatherForecastHour[];
}

// OpenWeatherMap API Response Types
export interface OWMAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface OWMCurrentWeather {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  pressure: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}

export interface OWMHourlyForecast {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  pop: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}

export interface OWMOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  current: OWMCurrentWeather;
  hourly?: OWMHourlyForecast[];
  alerts?: OWMAlert[];
}