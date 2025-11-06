import { TrendingUp, type LucideIcon } from 'lucide-react';
import { fmt, compact } from '../services/format';

type Props = {
  label: string;
  value?: number | string;
  icon: LucideIcon;
  accent?: 'blue' | 'rose' | 'emerald' | 'amber';
  trend?: number;
  loading?: boolean;
  showCompactHint?: boolean;
};

export default function KPICard({ label, value, icon: Icon, accent = 'blue', trend, loading, showCompactHint = true }: Props) {
  const isNumber = typeof value === 'number' && Number.isFinite(value);
  const main = loading ? '---' : isNumber ? fmt.format(value as number) : (value || '0');
  const hint = isNumber ? compact.format(value as number) : undefined;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-2xl backdrop-blur-sm transition-all hover:border-white/20 hover:shadow-2xl">
      <div className={`pointer-events-none absolute -inset-20 bg-gradient-radial blur-3xl opacity-0 transition-opacity group-hover:opacity-100`} />
      <div className="relative z-10 space-y-3">
        <div className="flex items-start justify-between">
          <div className={`rounded-xl bg-white/5 p-3 ring-1 ring-inset ring-white/10`}>
            <Icon className="h-6 w-6" />
          </div>
          {typeof trend === 'number' && (
            <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <div>
          <div className="text-sm font-medium text-gray-400">{label}</div>
          <div className="mt-1 text-4xl font-bold tracking-tight tabular-nums">{main}</div>
          {showCompactHint && hint && (
            <div className="mt-1 text-xs text-gray-400">≈ {hint}</div>
          )}
        </div>
      </div>
    </div>
  );
}
