import { useState, useEffect } from 'react';
import { TrendingUp, BarChart2, Globe, GitCompare, ChevronDown } from 'lucide-react';

import Shell from './layouts/Shell';
import WorldMap from './components/WorldMap';
import CountryComparison from './components/CountryComparison';
import AdvancedChart from './components/AdvancedChart';

import { getGlobalMetrics, getCountryData, getAllCountriesLatestStats, getTopCountries, getAllCountries, type CountryLatestStats } from './services/api';
import type { GlobalMetrics, CountryData } from './types';
import { fmt, compact } from './services/format';

type CountryMapData = {
  country: string;
  cases: number;
  deaths: number;
};

type Tab = 'map' | 'charts' | 'compare';

export default function App() {
  const [globalData, setGlobalData] = useState<GlobalMetrics | null>(null);
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [mapData, setMapData] = useState<CountryMapData[]>([]);
  const [topCountries, setTopCountries] = useState<CountryLatestStats[]>([]);
  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('France');
  const [activeTab, setActiveTab] = useState<Tab>('map');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  // État pour mobile
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchGlobalData();
    fetchMapData();
    fetchTopCountries();
    fetchAllCountries();
  }, []);

  useEffect(() => {
    fetchCountryData(selectedCountry, startDate, endDate);
  }, [selectedCountry, startDate, endDate]);

  const fetchGlobalData = async () => {
    try {
      const data = await getGlobalMetrics();
      setGlobalData(data);
    } catch (err) {
      console.error('Erreur API global:', err);
    }
  };

  const fetchMapData = async () => {
    try {
      const data = await getAllCountriesLatestStats();
      const transformed: CountryMapData[] = data.map(d => ({
        country: d.country,
        cases: d.cases,
        deaths: d.deaths,
      }));
      setMapData(transformed);
    } catch (err) {
      console.error('Erreur API map data:', err);
    }
  };

  const fetchTopCountries = async () => {
    try {
      const data = await getTopCountries('cases', 15);
      setTopCountries(data);
    } catch (err) {
      console.error('Erreur API top countries:', err);
    }
  };

  const fetchAllCountries = async () => {
    try {
      const data = await getAllCountries();
      setAllCountries(data);
    } catch (err) {
      console.error('Erreur API all countries:', err);
    }
  };

  const fetchCountryData = async (country: string, start?: string, end?: string) => {
    try {
      const data = await getCountryData(country, start, end);
      setCountryData(data);

      if (data.series && data.series.length > 0) {
        setMinDate(data.series[0].date);
        setMaxDate(data.series[data.series.length - 1].date);

        if (!startDate && !endDate) {
          const lastDate = new Date(data.series[data.series.length - 1].date);
          const firstDate = new Date(lastDate);
          firstDate.setDate(firstDate.getDate() - 90);

          const actualFirstDate = new Date(data.series[0].date);
          if (firstDate < actualFirstDate) {
            setStartDate(data.series[0].date);
          } else {
            setStartDate(firstDate.toISOString().split('T')[0]);
          }
          setEndDate(data.series[data.series.length - 1].date);
        }
      }
    } catch (err) {
      console.error('Erreur API country:', err);
    }
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
  };

  const handleDatePreset = (days: number) => {
    if (days === 0) {
      setStartDate('2020-01-22');
      setEndDate(maxDate || new Date().toISOString().split('T')[0]);
    } else {
      const endDateToUse = maxDate || new Date().toISOString().split('T')[0];
      const end = new Date(endDateToUse);
      const start = new Date(end);
      start.setDate(start.getDate() - days);
      
      const minPossible = new Date('2020-01-22');
      const actualStart = start < minPossible ? minPossible : start;
      
      setStartDate(actualStart.toISOString().split('T')[0]);
      setEndDate(endDateToUse);
    }
  };

  const selectedCountryStats = countryData?.latest || countryData?.series?.[countryData.series.length - 1];
  const recentSeries = countryData?.series?.slice(-7) || [];
  const todayCases = selectedCountryStats?.cases_cum || 0;
  const yesterdayCases = recentSeries.length > 1 ? recentSeries[recentSeries.length - 2].cases_cum : todayCases;
  const newCases = todayCases - yesterdayCases;

  const todayDeaths = selectedCountryStats?.deaths_cum || 0;
  const yesterdayDeaths = recentSeries.length > 1 ? recentSeries[recentSeries.length - 2].deaths_cum : todayDeaths;
  const newDeaths = todayDeaths - yesterdayDeaths;

  const deathRate = todayCases > 0 ? ((todayDeaths / todayCases) * 100).toFixed(2) : '0';

  const sparklineData = recentSeries.map((item, i) => {
    if (i === 0) return 0;
    return item.cases_cum - recentSeries[i - 1].cases_cum;
  });

  const filteredSeries = countryData?.series?.filter(item => {
    if (!startDate && !endDate) return true;
    const itemDate = new Date(item.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && itemDate < start) return false;
    if (end && itemDate > end) return false;
    return true;
  }) || [];

  const chartData = filteredSeries.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    cases: item.cases_cum,
    deaths: item.deaths_cum,
  }));

  return (
    <Shell>
      <div className="h-full flex flex-col">
        {/* Tab Navigation - Responsive */}
        <div className="bg-gray-900 border-b border-gray-800 px-2 sm:px-4 py-2">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors ${
                activeTab === 'map' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Carte mondiale</span>
              <span className="sm:hidden">Carte</span>
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors ${
                activeTab === 'charts' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Graphiques détaillés</span>
              <span className="sm:hidden">Graphiques</span>
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded transition-colors ${
                activeTab === 'compare' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <GitCompare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Comparaison pays</span>
              <span className="sm:hidden">Comparer</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'map' && (
            <div className="h-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-0">
              {/* Stats mobiles au-dessus de la carte */}
              <div className="lg:hidden p-3 bg-gray-900 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-950 border border-gray-800 p-2 rounded">
                    <div className="text-[9px] text-gray-500 uppercase">Confirmed</div>
                    <div className="text-base font-bold text-red-500 tabular-nums">
                      {globalData ? compact.format(globalData.cases_cumulative) : '---'}
                    </div>
                  </div>
                  <div className="bg-gray-950 border border-gray-800 p-2 rounded">
                    <div className="text-[9px] text-gray-500 uppercase">Deaths</div>
                    <div className="text-base font-bold text-gray-400 tabular-nums">
                      {globalData ? compact.format(globalData.deaths_cumulative) : '---'}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-950 border border-gray-800 p-2 rounded">
                  <div className="text-[9px] text-gray-500 uppercase mb-1">{selectedCountry}</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Cases:</span>
                    <span className="text-red-400 font-mono">{compact.format(todayCases)}</span>
                  </div>
                </div>
              </div>

              {/* LEFT PANEL - Desktop only */}
              <div className="hidden lg:block lg:col-span-2 bg-gray-900 border-r border-gray-800 overflow-y-auto">
                <div className="p-3 space-y-3">
                  <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Total Confirmed</div>
                    <div className="text-2xl font-bold text-red-500 tabular-nums">
                      {globalData ? fmt.format(globalData.cases_cumulative) : '---'}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      {globalData ? compact.format(globalData.cases_cumulative) : '---'}
                    </div>
                  </div>

                  <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Total Deaths</div>
                    <div className="text-2xl font-bold text-gray-400 tabular-nums">
                      {globalData ? fmt.format(globalData.deaths_cumulative) : '---'}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      {globalData ? compact.format(globalData.deaths_cumulative) : '---'}
                    </div>
                  </div>

                  <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                    <div className="text-[10px] text-gray-500 uppercase mb-2">Selected Region</div>
                    <div className="text-sm font-bold text-white mb-2">{selectedCountry}</div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cases:</span>
                        <span className="text-red-400 font-mono">{fmt.format(todayCases)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Deaths:</span>
                        <span className="text-gray-400 font-mono">{fmt.format(todayDeaths)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fatality:</span>
                        <span className="text-orange-400 font-mono">{deathRate}%</span>
                      </div>
                    </div>

                    {newCases > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-800 flex items-center gap-1 text-[10px]">
                        <TrendingUp className="h-3 w-3 text-red-400" />
                        <span className="text-red-400">+{fmt.format(newCases)}</span>
                        <span className="text-gray-600">new cases</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                    <div className="text-[10px] text-gray-500 uppercase mb-2">Top Affected Countries</div>
                    <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                      {topCountries.map((country, index) => (
                        <button
                          key={country.country}
                          onClick={() => handleCountrySelect(country.country)}
                          className={`w-full text-left p-2 rounded transition-colors ${
                            selectedCountry === country.country
                              ? 'bg-red-900/20 border border-red-800/50'
                              : 'hover:bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-gray-600 font-mono w-4 flex-shrink-0">#{index + 1}</span>
                              <span className="text-white truncate">{country.country}</span>
                            </div>
                            <span className="text-red-400 font-mono flex-shrink-0 ml-2">
                              {compact.format(country.cases)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER - Map */}
              <div className="lg:col-span-8 bg-gray-950 relative h-[50vh] lg:h-auto">
                <div className="absolute inset-0">
                  <WorldMap data={mapData} onCountryClick={handleCountrySelect} />
                </div>

                {/* Overlay info - Desktop only */}
                <div className="hidden lg:block absolute top-4 left-4 right-4 pointer-events-none">
                  <div className="flex items-start justify-between">
                    <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded px-3 py-2">
                      <div className="text-[10px] text-gray-500 uppercase">Data Source</div>
                      <div className="text-xs text-white">Johns Hopkins CSSE</div>
                    </div>

                    <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded px-3 py-2">
                      <div className="text-[10px] text-gray-500 uppercase">Last Update</div>
                      <div className="text-xs text-white">{globalData?.date || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL - Desktop only */}
              <div className="hidden lg:block lg:col-span-2 bg-gray-900 border-l border-gray-800 overflow-y-auto">
                <div className="p-3 space-y-3">
                  <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Active Cases</div>
                    <div className="text-xl font-bold text-yellow-500 tabular-nums">
                      {globalData ? compact.format(globalData.cases_cumulative - globalData.deaths_cumulative) : '---'}
                    </div>
                  </div>

                  <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Fatality Rate</div>
                    <div className="text-xl font-bold text-orange-500 tabular-nums">
                      {globalData && globalData.cases_cumulative > 0
                        ? ((globalData.deaths_cumulative / globalData.cases_cumulative) * 100).toFixed(2)
                        : '0'}%
                    </div>
                  </div>

                  <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                    <div className="text-[10px] text-gray-500 uppercase mb-2">7-Day Trend ({selectedCountry})</div>

                    <div className="h-12 flex items-end gap-0.5">
                      {sparklineData.map((value, i) => {
                        const maxValue = Math.max(...sparklineData);
                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-red-500/70 rounded-t"
                            style={{ height: `${height}%`, minHeight: '2px' }}
                            title={`${fmt.format(value)} cases`}
                          />
                        );
                      })}
                    </div>

                    <div className="mt-2 text-[10px] text-gray-600">
                      Average: {fmt.format(Math.round(sparklineData.reduce((a, b) => a + b, 0) / sparklineData.length))} daily
                    </div>
                  </div>

                  <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                    <div className="text-[10px] text-gray-500 uppercase mb-2">Recent Activity</div>
                    <div className="space-y-2">
                      {recentSeries.slice(-5).reverse().map((item, i) => {
                        const prevItem = recentSeries[recentSeries.length - 2 - i];
                        const dailyCases = prevItem ? item.cases_cum - prevItem.cases_cum : 0;

                        return (
                          <div key={item.date} className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-600">{item.date}</span>
                            <span className={`font-mono ${dailyCases > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                              {dailyCases > 0 ? '+' : ''}{fmt.format(dailyCases)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-950 border border-yellow-900/30 p-3 rounded">
                    <div className="text-[10px] text-yellow-600 uppercase mb-2 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      System Status
                    </div>
                    <div className="text-xs text-gray-400">All systems operational</div>
                    <div className="text-[10px] text-gray-600 mt-1">Data updated continuously</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="h-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-0">
              {/* Mobile filters */}
              <div className="lg:hidden p-3 bg-gray-900 border-b border-gray-800">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full flex items-center justify-between p-2 bg-gray-950 rounded border border-gray-800"
                >
                  <span className="text-sm font-medium">Options</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                </button>

                {showMobileFilters && (
                  <div className="mt-2 space-y-2">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                    >
                      {allCountries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleDatePreset(7)} className="px-2 py-1.5 text-xs rounded bg-gray-800 border border-gray-700">7j</button>
                      <button onClick={() => handleDatePreset(30)} className="px-2 py-1.5 text-xs rounded bg-gray-800 border border-gray-700">30j</button>
                      <button onClick={() => handleDatePreset(90)} className="px-2 py-1.5 text-xs rounded bg-gray-800 border border-gray-700">90j</button>
                      <button onClick={() => handleDatePreset(0)} className="px-2 py-1.5 text-xs rounded bg-gray-800 border border-gray-700">Tout</button>
                    </div>
                  </div>
                )}
              </div>

              {/* LEFT SIDEBAR - Desktop Controls */}
              <div className="hidden lg:block lg:col-span-3 bg-gray-900 border-r border-gray-800 overflow-y-auto p-4 space-y-4">
                <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                  <label className="text-[10px] text-gray-500 uppercase mb-2 block">Sélection du pays</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                  >
                    {allCountries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                  <label className="text-[10px] text-gray-500 uppercase mb-2 block">Période</label>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button onClick={() => handleDatePreset(7)} className="px-2 py-1.5 text-xs rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">7 jours</button>
                    <button onClick={() => handleDatePreset(30)} className="px-2 py-1.5 text-xs rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">30 jours</button>
                    <button onClick={() => handleDatePreset(90)} className="px-2 py-1.5 text-xs rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">90 jours</button>
                    <button onClick={() => handleDatePreset(0)} className="px-2 py-1.5 text-xs rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">Tout</button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-600 mb-1 block">Début</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min="2020-01-22"
                        max={endDate || maxDate}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-600 mb-1 block">Fin</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || "2020-01-22"}
                        max={maxDate}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {startDate && endDate && (
                    <div className="mt-2 pt-2 border-t border-gray-800 text-[10px] text-gray-500">
                      {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </div>
                  )}
                </div>

                <div className="bg-gray-950 border border-gray-800 p-3 rounded">
                  <div className="text-[10px] text-gray-500 uppercase mb-2">Statistiques {selectedCountry}</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cas totaux:</span>
                      <span className="text-red-400 font-mono">{fmt.format(todayCases)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Décès totaux:</span>
                      <span className="text-gray-400 font-mono">{fmt.format(todayDeaths)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taux létalité:</span>
                      <span className="text-orange-400 font-mono">{deathRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT AREA - Charts */}
              <div className="lg:col-span-9 bg-gray-950 overflow-y-auto p-3 lg:p-4 min-h-[500px]">
                <div className="space-y-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 lg:p-4">
                    <h3 className="text-sm font-semibold text-white mb-4">Analyse Détaillée - {selectedCountry}</h3>
                    <AdvancedChart data={chartData} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="h-full bg-gray-950 overflow-y-auto p-3 lg:p-6">
              <div className="max-w-7xl mx-auto">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 lg:p-6">
                  <h2 className="text-base lg:text-lg font-bold text-white mb-4">Comparaison Multi-Pays</h2>
                  <CountryComparison />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}