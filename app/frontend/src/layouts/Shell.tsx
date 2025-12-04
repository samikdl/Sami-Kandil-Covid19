import { Activity } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function Shell({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header compact */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-red-600 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">
                COVID-19 Global Dashboard
              </h1>
              <p className="text-[10px] text-gray-500">Real-time monitoring system</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px]">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-400">LIVE</span>
            <span className="text-gray-600 ml-2">
              {new Date().toLocaleString('fr-FR', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-52px)]">
        {children}
      </main>
    </div>
  );
}