import type { GlobalMetrics, CountryData } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:9090/api/v1';

export async function getGlobalMetrics(): Promise<GlobalMetrics> {
  const res = await fetch(`${BASE_URL}/metrics/global`);
  if (!res.ok) throw new Error(`API /global failed: ${res.status}`);
  return res.json();
}

export async function getCountryData(country: string): Promise<CountryData> {
  const res = await fetch(`${BASE_URL}/metrics/country/${country}`);
  if (!res.ok) throw new Error(`API /country failed: ${res.status}`);
  return res.json();
}

export async function getAllCountries(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/metrics/countries`);
  if (!res.ok) throw new Error(`API /countries failed: ${res.status}`);
  return res.json();
}