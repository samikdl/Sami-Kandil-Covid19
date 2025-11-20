import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  minDate,
  maxDate 
}: DateRangePickerProps) {
  return (
    <div className="rounded-lg bg-white/5 p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <Calendar className="h-4 w-4" />
        <span>Période d'analyse</span>
      </div>
      
      <div className="space-y-3">
        {/* Date de début */}
        <div>
          <label htmlFor="startDate" className="block text-xs text-gray-400 mb-1">
            Date de début
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            min={minDate}
            max={endDate || maxDate}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Date de fin */}
        <div>
          <label htmlFor="endDate" className="block text-xs text-gray-400 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || minDate}
            max={maxDate}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Boutons de raccourcis */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 7);
              onStartDateChange(start.toISOString().split('T')[0]);
              onEndDateChange(end.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            7 jours
          </button>
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 30);
              onStartDateChange(start.toISOString().split('T')[0]);
              onEndDateChange(end.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            30 jours
          </button>
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - 90);
              onStartDateChange(start.toISOString().split('T')[0]);
              onEndDateChange(end.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            90 jours
          </button>
          <button
            onClick={() => {
              onStartDateChange('');
              onEndDateChange('');
            }}
            className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Tout
          </button>
        </div>

        {/* Indicateur de durée */}
        {startDate && endDate && (
          <div className="text-xs text-gray-400 pt-2 border-t border-white/5">
            Période : {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
          </div>
        )}
      </div>
    </div>
  );
}