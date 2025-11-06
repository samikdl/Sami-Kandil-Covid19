export type GlobalMetrics = {
  date: string;
  cases_cumulative: number;
  deaths_cumulative: number;
};

export type CountrySeries = {
  date: string;
  cases_cum: number;
  deaths_cum: number;
};

export type CountryData = {
  country: string;
  series: CountrySeries[];
  latest?: CountrySeries;
};