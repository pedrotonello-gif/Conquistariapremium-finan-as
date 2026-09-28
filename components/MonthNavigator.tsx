import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Layers } from 'lucide-react';
import { formatMonthYear, getMonthNamePTBR } from '../utils/formatters';

interface MonthNavigatorProps {
  selectedPeriod: string; // "YYYY-MM" or "all"
  onChangePeriod: (period: string) => void;
  availablePeriods: string[]; // ["2026-09", "2026-08", ...]
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  selectedPeriod,
  onChangePeriod,
  availablePeriods,
}) => {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const isCurrentMonth = selectedPeriod === currentMonthKey;
  const isAllMonths = selectedPeriod === 'all';

  // Navigation handlers
  const handlePreviousMonth = () => {
    if (isAllMonths) {
      onChangePeriod(currentMonthKey);
      return;
    }
    const [yearStr, monthStr] = selectedPeriod.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1; // 0-based
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    const newKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    onChangePeriod(newKey);
  };

  const handleNextMonth = () => {
    if (isAllMonths) {
      onChangePeriod(currentMonthKey);
      return;
    }
    const [yearStr, monthStr] = selectedPeriod.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1; // 0-based
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    const newKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    onChangePeriod(newKey);
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Month Navigator controls */}
      <div className="flex items-center justify-between sm:justify-start gap-2">
        <button
          type="button"
          onClick={handlePreviousMonth}
          title="Mês anterior"
          className="p-2 rounded-xl text-stone-600 hover:text-vinho-800 hover:bg-vinho-50 border border-stone-200 transition active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-vinho-50 rounded-xl border border-vinho-200/70 text-vinho-900 font-bold text-sm sm:text-base min-w-[190px] justify-center">
          <Calendar className="w-4 h-4 text-vinho-700 shrink-0" />
          <span>{formatMonthYear(selectedPeriod)}</span>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          title="Próximo mês"
          className="p-2 rounded-xl text-stone-600 hover:text-vinho-800 hover:bg-vinho-50 border border-stone-200 transition active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Select & All Months switch */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Dropdown for quick jump */}
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => onChangePeriod(e.target.value)}
            className="appearance-none bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold py-2 px-3 pr-8 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-vinho-500 cursor-pointer"
          >
            <option value="all">Visão Geral (Todos)</option>
            <optgroup label="Meses com Registros">
              {availablePeriods.map((period) => (
                <option key={period} value={period}>
                  {formatMonthYear(period)}
                </option>
              ))}
            </optgroup>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
            <svg className="fill-current h-3.5 w-3.5" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {!isCurrentMonth && (
          <button
            type="button"
            onClick={() => onChangePeriod(currentMonthKey)}
            className="px-3 py-2 text-xs font-bold text-vinho-700 bg-vinho-100 hover:bg-vinho-200/80 rounded-xl transition"
          >
            Ir para Mês Atual
          </button>
        )}

        <button
          type="button"
          onClick={() => onChangePeriod(isAllMonths ? currentMonthKey : 'all')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition ${
            isAllMonths
              ? 'bg-vinho-800 text-white border-vinho-800'
              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isAllMonths ? 'Ver por Mês' : 'Todos os Meses'}</span>
        </button>
      </div>
    </div>
  );
};
