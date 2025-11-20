import { useState, useEffect } from 'react';
import { Activity, Skull, Users, TrendingUp, Map, GitCompare, BarChart3 } from 'lucide-react';

import Shell from './layouts/Shell';
import KPICard from './components/KPICard';
import ChartCard from './components/ChartCard';
import GlobalChart from './components/GlobalChart';
import DailyChart from './components/DailyChart';
import StatsPanel from './components/StatsPanel';
import WorldMap from './components/WorldMap';
import CountryComparison from './components/CountryComparison';
import AdvancedChart from './components/AdvancedChart';
import TopCountriesChart from './components/TopCountriesChart';

import { getGlobalMetrics, getCountryData, getAllCountriesLatestStats, type CountryLatestStats } from './services/api';
import type { GlobalMetrics, CountryData } from './types';

type Tab = 'overview' | 'map' | 'compare' | 'analysis';

export default function App() {
  const [globalData, setGlobalData] = useState<GlobalMetrics | null>(null);
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [mapData, setMapData] = useState<CountryLatestStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('France');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // États pour la gestion de la période
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    fetchGlobalData();
    fetchMapData();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchMapData = async () => {
    try {
      const data = await getAllCountriesLatestStats();
      setMapData(data);
    } catch (err) {
      console.error('Erreur API map data:', err);
    }
  };

  const fetchCountryData = async (country: string, start?: string, end?: string) => {
    try {
      const data = await getCountryData(country, start, end);
      setCountryData(data);
      
      if (data.series && data.series.length > 0) {
        setMinDate(data.series[0].date);
        setMaxDate(data.series[data.series.length - 1].date);
        
        if (!startDate && !endDate && data.series.length > 0) {
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
    setActiveTab('overview');
  };

  // Filtrer les données selon la période sélectionnée
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

  const dailyData = chartData.map((item, i) => {
    if (i === 0) return { ...item, newCases: 0, newDeaths: 0 };
    return {
      date: item.date,
      newCases: Math.max(0, item.cases - chartData[i - 1].cases),
      newDeaths: Math.max(0, item.deaths - chartData[i - 1].deaths),
    };
  });

  const deathRate = globalData?.cases_cumulative && globalData.cases_cumulative > 0 
    ? ((globalData.deaths_cumulative / globalData.cases_cumulative) * 100).toFixed(2)
    : '0';

  const latestInPeriod = filteredSeries.length > 0 
    ? filteredSeries[filteredSeries.length - 1] 
    : countryData?.latest;

  // Transformer les données pour la carte
  const mapCountryData = mapData.map(d => ({
    country: d.country,
    cases: d.cases,
    deaths: d.deaths,
    lat: 0,
    lng: 0,
  }));

  return (
    <Shell>
      <div className="space-y-6">
        {/* Navigation par onglets */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Activity className="h-4 w-4" />
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'map'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Map className="h-4 w-4" />
            Carte mondiale
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'compare'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <GitCompare className="h-4 w-4" />
            Comparaison
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'bg-amber-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analyse avancée
          </button>
        </div>

        {/* KPI Grid - Toujours visible */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Cas Confirmés"
            value={globalData?.cases_cumulative}
            icon={Users}
            accent="blue"
            loading={loading}
          />
          <KPICard
            label="Décès"
            value={globalData?.deaths_cumulative}
            icon={Skull}
            accent="rose"
            loading={loading}
          />
          <KPICard
            label="Taux de Mortalité"
            value={deathRate}
            icon={Activity}
            accent="amber"
            loading={loading}
            showCompactHint={false}
          />
          <KPICard
            label="Cas dans la période"
            value={latestInPeriod?.cases_cum}
            icon={TrendingUp}
            accent="emerald"
            loading={loading}
          />
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'overview' && (
          <>
            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
              <ChartCard 
                title={`Évolution ${selectedCountry} ${filteredSeries.length > 0 ? `(${filteredSeries.length} jours)` : ''}`} 
                className="lg:col-span-2"
              >
                <GlobalChart data={chartData} />
              </ChartCard>

              <ChartCard title="Statistiques">
                <StatsPanel
                  date={globalData?.date || ''}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                  deathRate={deathRate}
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              </ChartCard>
            </div>

            {/* Daily Changes Chart */}
            <ChartCard title={`Nouveaux Cas Quotidiens ${selectedCountry}`}>
              <DailyChart data={dailyData} />
            </ChartCard>
          </>
        )}

        {activeTab === 'map' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <ChartCard title="Carte interactive mondiale" className="lg:col-span-2">
              <div className="h-[500px]">
                <WorldMap 
                  data={mapCountryData} 
                  onCountryClick={handleCountrySelect}
                />
              </div>
            </ChartCard>

            <ChartCard title="Top pays">
              <TopCountriesChart onCountryClick={handleCountrySelect} />
            </ChartCard>
          </div>
        )}

        {activeTab === 'compare' && (
          <ChartCard title="Comparaison entre pays">
            <CountryComparison />
          </ChartCard>
        )}

        {activeTab === 'analysis' && (
          <>
            <ChartCard title={`Analyse détaillée - ${selectedCountry}`}>
              <AdvancedChart data={chartData} />
            </ChartCard>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Évolution cumulative">
                <GlobalChart data={chartData} />
              </ChartCard>

              <ChartCard title="Variations quotidiennes">
                <DailyChart data={dailyData} />
              </ChartCard>
            </div>
          </>
        )}

        {/* Footer Info */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-sm text-gray-400">
            Données fournies par Johns Hopkins University CSSE • Projet personnel • {selectedCountry}
            {startDate && endDate && (
              <span className="block mt-1 text-xs">
                Période : du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
              </span>
            )}
          </p>
        </div>
      </div>
    </Shell>
  );
}