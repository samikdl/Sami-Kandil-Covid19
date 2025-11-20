import { useState } from 'react';
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts';
import { fmt } from '../services/format';

type DataPoint = {
  date: string;
  cases: number;
  deaths: number;
  newCases?: number;
  newDeaths?: number;
};

type Props = {
  data: DataPoint[];
  title?: string;
};

// Calcul de la moyenne mobile
const calculateMovingAverage = (data: number[], window: number): number[] => {
  return data.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    const subset = data.slice(start, index + 1);
    return subset.reduce((sum, val) => sum + val, 0) / subset.length;
  });
};

export default function AdvancedChart({ data, title = "Analyse détaillée" }: Props) {
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [avgWindow, setAvgWindow] = useState(7);
  const [chartType, setChartType] = useState<'combined' | 'cases' | 'deaths'>('combined');

  // Calculer les nouveaux cas/décès quotidiens
  const enrichedData = data.map((item, index) => {
    const prev = data[index - 1];
    return {
      ...item,
      newCases: prev ? Math.max(0, item.cases - prev.cases) : 0,
      newDeaths: prev ? Math.max(0, item.deaths - prev.deaths) : 0,
    };
  });

  // Calculer les moyennes mobiles
  const newCasesArr = enrichedData.map(d => d.newCases || 0);
  const newDeathsArr = enrichedData.map(d => d.newDeaths || 0);
  const avgCases = calculateMovingAverage(newCasesArr, avgWindow);
  const avgDeaths = calculateMovingAverage(newDeathsArr, avgWindow);

  const chartData = enrichedData.map((item, index) => ({
    ...item,
    avgCases: Math.round(avgCases[index]),
    avgDeaths: Math.round(avgDeaths[index]),
  }));

  // Calculer la moyenne globale pour la ligne de référence
  const avgTotal = newCasesArr.reduce((a, b) => a + b, 0) / newCasesArr.length;

  return (
    <div className="space-y-4">
      {/* Contrôles */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('combined')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              chartType === 'combined'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            Combiné
          </button>
          <button
            onClick={() => setChartType('cases')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              chartType === 'cases'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            Cas
          </button>
          <button
            onClick={() => setChartType('deaths')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              chartType === 'deaths'
                ? 'bg-rose-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            Décès
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showMovingAvg}
              onChange={(e) => setShowMovingAvg(e.target.checked)}
              className="rounded border-white/20 bg-white/10 text-blue-500"
            />
            <span className="text-gray-300">Moyenne mobile</span>
          </label>

          {showMovingAvg && (
            <select
              value={avgWindow}
              onChange={(e) => setAvgWindow(Number(e.target.value))}
              className="rounded-lg bg-white/10 border border-white/10 px-2 py-1 text-sm text-white"
            >
              <option value={3}>3 jours</option>
              <option value={7}>7 jours</option>
              <option value={14}>14 jours</option>
              <option value={30}>30 jours</option>
            </select>
          )}
        </div>
      </div>

      {/* Graphique */}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            style={{ fontSize: '11px' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="left"
            stroke="#6b7280" 
            style={{ fontSize: '11px' }} 
            tickFormatter={(v) => fmt.format(v)}
          />
          {chartType === 'combined' && (
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#f43f5e" 
              style={{ fontSize: '11px' }} 
              tickFormatter={(v) => fmt.format(v)}
            />
          )}
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

          {/* Ligne de référence moyenne */}
          {chartType !== 'deaths' && (
            <ReferenceLine 
              yAxisId="left"
              y={avgTotal} 
              stroke="#ffffff30" 
              strokeDasharray="3 3" 
              label={{ value: 'Moy.', fill: '#ffffff50', fontSize: 10 }}
            />
          )}

          {/* Barres pour les nouveaux cas */}
          {(chartType === 'combined' || chartType === 'cases') && (
            <Bar 
              yAxisId="left"
              dataKey="newCases" 
              fill="#3b82f6" 
              fillOpacity={0.3}
              name="Nouveaux cas"
              radius={[2, 2, 0, 0]}
            />
          )}

          {/* Barres pour les décès */}
          {(chartType === 'combined' || chartType === 'deaths') && (
            <Bar 
              yAxisId={chartType === 'combined' ? 'right' : 'left'}
              dataKey="newDeaths" 
              fill="#f43f5e" 
              fillOpacity={0.3}
              name="Nouveaux décès"
              radius={[2, 2, 0, 0]}
            />
          )}

          {/* Lignes de moyenne mobile */}
          {showMovingAvg && (chartType === 'combined' || chartType === 'cases') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avgCases"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name={`Moy. mobile ${avgWindow}j (cas)`}
            />
          )}

          {showMovingAvg && (chartType === 'combined' || chartType === 'deaths') && (
            <Line
              yAxisId={chartType === 'combined' ? 'right' : 'left'}
              type="monotone"
              dataKey="avgDeaths"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
              name={`Moy. mobile ${avgWindow}j (décès)`}
            />
          )}

          {/* Brush pour zoomer */}
          <Brush 
            dataKey="date" 
            height={30} 
            stroke="#3b82f6"
            fill="#1f293750"
            travellerWidth={10}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}