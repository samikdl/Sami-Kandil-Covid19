import { useEffect, useState } from 'react';
import { getAllCountries } from '../services/api';

type Props = {
  date: string;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  deathRate: string;
};

export default function StatsPanel({ date, selectedCountry, onCountryChange, deathRate }: Props) {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCountries()
      .then(data => {
        setCountries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement pays:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white/5 p-4">
        <div className="text-xs text-gray-400">Date des données</div>
        <div className="mt-1 text-lg font-semibold">{date || 'N/A'}</div>
      </div>
      
      <div className="rounded-lg bg-white/5 p-4">
        <div className="text-xs text-gray-400">Pays sélectionné</div>
        <div className="mt-1">
          <select 
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
          >
            {loading ? (
              <option>Chargement...</option>
            ) : (
              countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 p-4">
        <div className="text-xs text-rose-300">Taux de létalité global</div>
        <div className="mt-1 text-2xl font-bold text-rose-400">{deathRate}%</div>
      </div>
    </div>
  );
}