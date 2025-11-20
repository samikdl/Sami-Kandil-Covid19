import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy } from 'lucide-react';
import { getTopCountries, type CountryLatestStats } from '../services/api';
import { fmt, compact } from '../services/format';

type Props = {
  onCountryClick?: (country: string) => void;
};

type ChartDataItem = {
  name: string;
  value: number;
  fullName: string;
};

export default function TopCountriesChart({ onCountryClick }: Props) {
  const [data, setData] = useState<CountryLatestStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'cases' | 'deaths'>('cases');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setLoading(true);
    getTopCountries(metric, limit)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [metric, limit]);

  const chartData: ChartDataItem[] = data.map(item => ({
    name: item.country,
    value: metric === 'cases' ? item.cases : item.deaths,
    fullName: item.country,
  }));

  // Couleurs dégradées pour le classement
  const getColor = (index: number) => {
    if (metric === 'cases') {
      const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
      return colors[Math.min(index, colors.length - 1)];
    } else {
      const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6'];
      return colors[Math.min(index, colors.length - 1)];
    }
  };

  const handleBarClick = (data: ChartDataItem) => {
    if (onCountryClick && data.fullName) {
      onCountryClick(data.fullName);
    }
  };

  return (
    <div className="space-y-4">
      {/* Contrôles */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Trophy className="h-4 w-4" />
          <span>Classement mondial</span>
        </div>

        <div className="flex gap-2">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-lg bg-white/10 border border-white/10 px-2 py-1 text-sm text-white"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>

          <button
            onClick={() => setMetric('cases')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              metric === 'cases'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            Cas
          </button>
          <button
            onClick={() => setMetric('deaths')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              metric === 'deaths'
                ? 'bg-rose-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            Décès
          </button>
        </div>
      </div>

      {/* Graphique */}
      {loading ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          <Trophy className="h-8 w-8 animate-pulse" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(300, limit * 35)}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#6b7280" 
              style={{ fontSize: '11px' }}
              tickFormatter={(v) => compact.format(v)}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#6b7280" 
              style={{ fontSize: '11px' }}
              width={100}
              tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
            />
            <Tooltip
              formatter={(value: number) => [fmt.format(value), metric === 'cases' ? 'Cas' : 'Décès']}
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151', 
                borderRadius: '8px', 
                color: '#fff' 
              }}
              labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(data: unknown) => handleBarClick(data as ChartDataItem)}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Tableau récapitulatif */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-2 px-3 text-left text-gray-400 font-medium">#</th>
              <th className="py-2 px-3 text-left text-gray-400 font-medium">Pays</th>
              <th className="py-2 px-3 text-right text-gray-400 font-medium">
                {metric === 'cases' ? 'Cas' : 'Décès'}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((item, index) => (
              <tr 
                key={item.country} 
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => onCountryClick?.(item.country)}
              >
                <td className="py-2 px-3 text-gray-400">{index + 1}</td>
                <td className="py-2 px-3 font-medium">{item.country}</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  {fmt.format(metric === 'cases' ? item.cases : item.deaths)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}