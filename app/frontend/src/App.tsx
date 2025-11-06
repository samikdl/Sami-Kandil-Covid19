import { useState, useEffect } from 'react';
import { Activity, Skull, Users, TrendingUp } from 'lucide-react';
import Shell from './layouts/Shell';
import KPICard from './components/KPICard';
import ChartCard from './components/ChartCard';
import GlobalChart from './components/GlobalChart';
import DailyChart from './components/DailyChart';
import StatsPanel from './components/StatsPanel';
import { getGlobalMetrics, getCountryData } from './services/api';
import type { GlobalMetrics, CountryData } from './types';

export default function App() {
  const [globalData, setGlobalData] = useState<GlobalMetrics | null>(null);
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('France');

  useEffect(() => {
    fetchGlobalData();
    fetchCountryData(selectedCountry);
  }, [selectedCountry]);

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

  const fetchCountryData = async (country: string) => {
    try {
      const data = await getCountryData(country);
      setCountryData(data);
    } catch (err) {
      console.error('Erreur API country:', err);
    }
  };

  const chartData = countryData?.series?.slice(-90).map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    cases: item.cases_cum,
    deaths: item.deaths_cum,
  })) || [];

  const dailyData = chartData.map((item, i) => {
    if (i === 0) return { ...item, newCases: 0, newDeaths: 0 };
    return {
      date: item.date,
      newCases: Math.max(0, item.cases - chartData[i - 1].cases),
      newDeaths: Math.max(0, item.deaths - chartData[i - 1].deaths),
    };
  }).slice(-30);

  const deathRate = globalData?.cases_cumulative && globalData.cases_cumulative > 0 
    ? ((globalData.deaths_cumulative / globalData.cases_cumulative) * 100).toFixed(2)
    : '0';

  return (
    <Shell>
      <div className="space-y-6">
        {/* KPI Grid */}
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
          />
          <KPICard
            label="Pays Affiché"
            value={selectedCountry}
            icon={TrendingUp}
            accent="emerald"
            loading={loading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartCard title="Évolution Globale (90 jours)" className="lg:col-span-2">
            <GlobalChart data={chartData} />
          </ChartCard>

          <ChartCard title="Statistiques">
            <StatsPanel
              date={globalData?.date || ''}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              deathRate={deathRate}
            />
          </ChartCard>
        </div>

        {/* Daily Changes Chart */}
        <ChartCard title="Nouveaux Cas Quotidiens (30 derniers jours)">
          <DailyChart data={dailyData} />
        </ChartCard>

        {/* Footer Info */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <p className="text-sm text-gray-400">
            Données fournies par Johns Hopkins University CSSE • Projet personnel • {selectedCountry}
          </p>
        </div>
      </div>
    </Shell>
  );
}