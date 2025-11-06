import { Activity } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function Shell({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                COVID-19 Tracker
              </h1>
              <p className="text-xs text-gray-400">Données mondiales en temps réel</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Dernière mise à jour
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
