import type { GlobalMetrics, CountryData } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:9090/api/v1';

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
  const url = `${BASE_URL}/metrics/country/${country}${queryString ? `?${queryString}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API /country failed: ${res.status}`);
  return res.json();
}

export async function getAllCountries(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/metrics/countries`);
  if (!res.ok) throw new Error(`API /countries failed: ${res.status}`);
  return res.json();
}

// Nouvelle fonction pour obtenir les dernières stats de tous les pays (pour la carte)
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

// Fonction pour obtenir les top N pays par cas ou décès
export async function getTopCountries(
  metric: 'cases' | 'deaths' = 'cases',
  limit: number = 10
): Promise<CountryLatestStats[]> {
  const res = await fetch(`${BASE_URL}/metrics/countries/top?metric=${metric}&limit=${limit}`);
  if (!res.ok) throw new Error(`API /countries/top failed: ${res.status}`);
  return res.json();
}