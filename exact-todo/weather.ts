// Open-Meteo lookup. City names and postal codes go through geocoding.
// An input that looks like "lat,lon" skips geocoding and asks for the forecast.
// No custom headers: a simple GET stays a CORS-simple request.

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const COORDINATES = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;

export type Place = {
  name: string;
  country: string;
  admin1: string;
  latitude: number;
  longitude: number;
};

export type CurrentWeather = {
  time: string;
  temperatureC: number;
  windKmh: number;
  weatherCode: number;
  condition: string;
};

export type DailyForecast = {
  date: string;
  weatherCode: number;
  maxC: number;
  minC: number;
  condition: string;
};

export type WeatherReport = {
  place: Place;
  current: CurrentWeather;
  daily: DailyForecast[];
};

/** WMO code, short phrase. Same table as the Effect UI pilot. */
export function weatherLabel(code: number): string {
  if (code === 0) return 'Despejado';
  if (code === 1) return 'Mayormente despejado';
  if (code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if (code === 45 || code === 48) return 'Niebla';
  if (code >= 51 && code <= 57) return 'Llovizna';
  if (code >= 61 && code <= 67) return 'Lluvia';
  if (code >= 71 && code <= 77) return 'Nieve';
  if (code >= 80 && code <= 82) return 'Chubascos';
  if (code >= 85 && code <= 86) return 'Nieve';
  if (code >= 95) return 'Tormenta';
  return `Código ${code}`;
}

function fail(message: string): never {
  throw new Error(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function numberField(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) fail('La petición al clima falló');
  return value;
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string') fail('La petición al clima falló');
  return value;
}

/** `null` when it is not a coordinate pair. Out of range still skips geocoding. */
export function coordinatesOf(query: string): { latitude: number; longitude: number } | 'invalid' | null {
  const match = COORDINATES.exec(query);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return 'invalid';
  return { latitude, longitude };
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, { exactTimeout: 10000 });
  if (!response.ok) fail('La petición al clima falló');
  return response.json();
}

async function geocode(name: string): Promise<Place> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=1&language=es&format=json`;
  const body = await getJson(url);
  if (!isRecord(body)) fail('La petición al clima falló');
  const results = body.results;
  const first = Array.isArray(results) ? results[0] : undefined;
  if (!isRecord(first)) fail(`No encontré «${name}».`);
  const admin1 = first.admin1;
  const country = first.country;
  return {
    name: stringField(first, 'name'),
    country: typeof country === 'string' ? country : '',
    admin1: typeof admin1 === 'string' ? admin1 : '',
    latitude: numberField(first, 'latitude'),
    longitude: numberField(first, 'longitude'),
  };
}

async function forecastAt(place: Place): Promise<WeatherReport> {
  const url = `${FORECAST_URL}?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
  const body = await getJson(url);
  if (!isRecord(body) || !isRecord(body.current) || !isRecord(body.daily)) fail('La petición al clima falló');
  const current = body.current;
  const daily = body.daily;
  const dates = daily.time;
  const codes = daily.weather_code;
  const highs = daily.temperature_2m_max;
  const lows = daily.temperature_2m_min;
  if (!Array.isArray(dates) || !Array.isArray(codes) || !Array.isArray(highs) || !Array.isArray(lows)) {
    fail('La petición al clima falló');
  }
  const days: DailyForecast[] = [];
  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index];
    const code = codes[index];
    const maxC = highs[index];
    const minC = lows[index];
    if (typeof date !== 'string' || typeof code !== 'number' || typeof maxC !== 'number' || typeof minC !== 'number') {
      fail('La petición al clima falló');
    }
    days.push({ date, weatherCode: code, maxC, minC, condition: weatherLabel(code) });
  }
  const weatherCode = numberField(current, 'weather_code');
  return {
    place,
    current: {
      time: stringField(current, 'time'),
      temperatureC: numberField(current, 'temperature_2m'),
      windKmh: numberField(current, 'wind_speed_10m'),
      weatherCode,
      condition: weatherLabel(weatherCode),
    },
    daily: days,
  };
}

export async function loadWeather(query: string): Promise<WeatherReport> {
  const name = query.trim();
  if (name === '') fail('Escribe una ciudad.');
  const coordinates = coordinatesOf(name);
  if (coordinates === 'invalid') fail('Esas coordenadas no sirven.');
  const place = coordinates === null
    ? await geocode(name)
    : { name, country: '', admin1: '', latitude: coordinates.latitude, longitude: coordinates.longitude };
  return forecastAt(place);
}
