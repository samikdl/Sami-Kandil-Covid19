import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function ChartCard({ title, children, className = '' }: Props) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-xl backdrop-blur-sm ${className}`}>
      <h2 className="mb-6 text-lg font-semibold text-gray-100">{title}</h2>
      {children}
    </div>
  );
}