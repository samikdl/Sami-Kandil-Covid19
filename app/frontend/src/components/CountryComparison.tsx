import { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, X, TrendingUp } from 'lucide-react';
import { getCountryData, getAllCountries } from '../services/api';
import { fmt } from '../services/format';
import type { CountrySeries } from '../types';

type CountrySeriesData = {
  country: string;
  series: CountrySeries[];
  color: string;
};

const COLORS = [
  '#3b82f6', // blue
  '#f43f5e', // rose
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
];

// Cache pour éviter de recharger les mêmes pays
const dataCache = new Map<string, CountrySeries[]>();

// Fonction pour réduire le nombre de points (prend 1 point sur N)
const reduceDataPoints = (series: CountrySeries[], maxPoints: number = 150): CountrySeries[] => {
  if (series.length <= maxPoints) return series;
  const step = Math.ceil(series.length / maxPoints);
  return series.filter((_, index) => index % step === 0 || index === series.length - 1);
};

export default function CountryComparison() {
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['France', 'Germany', 'Italy']);
  const [countriesData, setCountriesData] = useState<CountrySeriesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState<'cases' | 'deaths'>('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Charger la liste des pays une seule fois
  useEffect(() => {
    getAllCountries()
      .then(setAvailableCountries)
      .catch(console.error);
  }, []);

  // Charger les données des pays sélectionnés (avec cache)
  useEffect(() => {
    if (selectedCountries.length === 0) {
      setCountriesData([]);
      return;
    }

    setLoading(true);
    
    // Séparer les pays déjà en cache et ceux à charger
    const toLoad: string[] = [];
    const cached: CountrySeriesData[] = [];

    selectedCountries.forEach((country, index) => {
      if (dataCache.has(country)) {
        cached.push({
          country,
          series: dataCache.get(country)!,
          color: COLORS[index % COLORS.length],
        });
      } else {
        toLoad.push(country);
      }
    });

    // Si tout est en cache, on affiche directement
    if (toLoad.length === 0) {
      setCountriesData(cached);
      setLoading(false);
      return;
    }

    // Charger uniquement les nouveaux pays
    Promise.all(
      toLoad.map(country =>
        getCountryData(country).then(data => {
          // Mettre en cache
          dataCache.set(country, data.series);
          return data.series;
        })
      )
    )
      .then(loadedData => {
        const allData = selectedCountries.map((country, index) => {
          const series = dataCache.get(country) || [];
          return {
            country,
            series,
            color: COLORS[index % COLORS.length],
          };
        });
        setCountriesData(allData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCountries]);

  // Préparer les données pour le graphique (optimisé avec useMemo)
  const chartData = useMemo(() => {
    if (countriesData.length === 0) return [];

    // Réduire le nombre de points pour chaque pays
    const reducedData = countriesData.map(cd => ({
      ...cd,
      series: reduceDataPoints(cd.series),
    }));

    // Trouver toutes les dates uniques (après réduction)
    const allDates = new Set<string>();
    reducedData.forEach(cd => {
      cd.series.forEach(s => allDates.add(s.date));
    });

    // Trier les dates
    const sortedDates = Array.from(allDates).sort();

    // Créer les données du graphique
    return sortedDates.map(date => {
      const point: Record<string, string | number> = {
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      };

      reducedData.forEach(cd => {
        const dayData = cd.series.find(s => s.date === date);
        if (dayData) {
          point[cd.country] = metric === 'cases' ? dayData.cases_cum : dayData.deaths_cum;
        }
      });

      return point;
    });
  }, [countriesData, metric]);

  const addCountry = useCallback((country: string) => {
    if (!selectedCountries.includes(country) && selectedCountries.length < 8) {
      setSelectedCountries(prev => [...prev, country]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  }, [selectedCountries]);

  const removeCountry = useCallback((country: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== country));
  }, []);

  const filteredCountries = useMemo(() => 
    availableCountries
      .filter(c => !selectedCountries.includes(c))
      .filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10),
    [availableCountries, selectedCountries, searchTerm]
  );

  return (
    <div className="space-y-4">
      {/* Contrôles */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Sélecteur de métrique */}
        <div className="flex gap-2">
          <button
            onClick={() => setMetric('cases')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              metric === 'cases'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            Cas cumulés
          </button>
          <button
            onClick={() => setMetric('deaths')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              metric === 'deaths'
                ? 'bg-rose-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            Décès cumulés
          </button>
        </div>

        {/* Ajout de pays */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Ajouter un pays..."
              className="w-48 rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              disabled={selectedCountries.length >= 8}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Dropdown des pays */}
          {showDropdown && filteredCountries.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-48 max-h-48 overflow-y-auto rounded-lg bg-gray-800 border border-white/10 shadow-xl z-50">
              {filteredCountries.map(country => (
                <button
                  key={country}
                  onClick={() => addCountry(country)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors"
                >
                  {country}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp className="h-4 w-4 animate-pulse" />
            <span>Chargement...</span>
          </div>
        )}
      </div>

      {/* Tags des pays sélectionnés */}
      <div className="flex flex-wrap gap-2">
        {selectedCountries.map((country, index) => (
          <span
            key={country}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: `${COLORS[index % COLORS.length]}20`,
              borderColor: COLORS[index % COLORS.length],
              borderWidth: 1,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {country}
            <button
              onClick={() => removeCountry(country)}
              className="hover:text-rose-400 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Graphique */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
              tickFormatter={(v) => fmt.format(v)}
            />
            <Tooltip
              formatter={(value: number, name) => [fmt.format(value), name]}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            {countriesData.map((cd) => (
              <Line
                key={cd.country}
                type="monotone"
                dataKey={cd.country}
                stroke={cd.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          Sélectionnez des pays pour afficher la comparaison
        </div>
      )}

      {/* Info sur l'optimisation */}
      {chartData.length > 0 && (
        <div className="text-xs text-gray-500">
          Affichage optimisé : ~{chartData.length} points • {selectedCountries.length}/8 pays
        </div>
      )}
    </div>
  );
}