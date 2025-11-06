import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmt } from '../services/format';

type DataPoint = {
  date: string;
  cases: number;
  deaths: number;
};

type Props = {
  data: DataPoint[];
};

export default function GlobalChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
        
        {/* Axe Y gauche pour les cas */}
        <YAxis yAxisId="left" stroke="#3b82f6" style={{ fontSize: '12px' }} tickFormatter={(v) => fmt.format(v)} />
        <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" style={{ fontSize: '12px' }} tickFormatter={(v) => fmt.format(v)} />
        
        <Tooltip
        formatter={(value: number, name) => [fmt.format(value), name]}
        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
        />
        <Legend />
        
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey="cases" 
          stroke="#3b82f6" 
          fillOpacity={1} 
          fill="url(#colorCases)"
          name="Cas cumulés"
        />
        <Area 
          yAxisId="right"
          type="monotone" 
          dataKey="deaths" 
          stroke="#f43f5e" 
          fillOpacity={1} 
          fill="url(#colorDeaths)"
          name="Décès cumulés"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}