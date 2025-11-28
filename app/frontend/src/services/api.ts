import type { GlobalMetrics, CountryData } from '../types';

const DEFAULT_API_BASE = `${window.location.protocol}//${window.location.hostname}:9090/api/v1`;
const BASE_URL = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;

console.log('[API] BASE_URL =', BASE_URL); // pour vérifier

export async function getGlobalMetrics(): Promise<GlobalMetrics> {
  const res = await fetch(`${BASE_URL}/metrics/global`);
  if (!res.ok) throw new Error(`API /global failed: ${res.status}`);
  return res.json();
}

export async function getCountryData(
  country: string, 
  startDate?: string, 
  endDate?: string
): Promise<CountryData> {
  const params = new URLSearchParams();
  if (startDate) params.append('start', startDate);
  if (endDate) params.append('end', endDate);
  
  const queryString = params.toString();
  const url = `${BASE_URL}/metrics/country/${encodeURIComponent(country)}${
    queryString ? `?${queryString}` : ''
  }`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API /country failed: ${res.status}`);
  return res.json();
}

export async function getAllCountries(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/metrics/countries`);
  if (!res.ok) throw new Error(`API /countries failed: ${res.status}`);
  return res.json();
}

export type CountryLatestStats = {
  country: string;
  cases: number;
  deaths: number;
};

export async function getAllCountriesLatestStats(): Promise<CountryLatestStats[]> {
  const res = await fetch(`${BASE_URL}/metrics/countries/latest`);
  if (!res.ok) throw new Error(`API /countries/latest failed: ${res.status}`);
  return res.json();
}

export async function getTopCountries(
  metric: 'cases' | 'deaths' = 'cases',
  limit: number = 10
): Promise<CountryLatestStats[]> {
  const params = new URLSearchParams({
    metric,
    limit: String(limit),
  });

  const res = await fetch(`${BASE_URL}/metrics/countries/top?${params.toString()}`);
  if (!res.ok) throw new Error(`API /countries/top failed: ${res.status}`);
  return res.json();
}
