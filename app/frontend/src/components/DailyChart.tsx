import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmt } from '../services/format';

type DataPoint = {
  date: string;
  newCases: number;
  newDeaths: number;
};

type Props = {
  data: DataPoint[];
};

export default function DailyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={(v) => fmt.format(v)} />
        <Tooltip
          formatter={(value: number, name) => [fmt.format(value), name]}
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
        />
        <Legend />
        <Bar dataKey="newCases" fill="#3b82f6" name="Nouveaux cas" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}