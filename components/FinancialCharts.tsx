import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, getCategoryMeta, formatDatePTBR } from '../utils/formatters';

interface FinancialChartsProps {
  transactions: Transaction[];
  periodLabel: string;
}

const PALETTE = [
  '#7E1327', // deep wine
  '#B82E49', // vivid wine
  '#F97316', // orange
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#EAB308', // amber
  '#10B981', // emerald
  '#64748B', // slate
];

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ transactions, periodLabel }) => {
  const [activeTab, setActiveTab] = useState<'despesas' | 'receitas' | 'comparativo'>('despesas');

  // Breakdown expenses by category
  const expenseCategories = useMemo(() => {
    const map = new Map<string, number>();
    let total = 0;
    transactions
      .filter((t) => t.type === 'saida')
      .forEach((t) => {
        const current = map.get(t.category) || 0;
        map.set(t.category, current + t.amount);
        total += t.amount;
      });

    const list = Array.from(map.entries()).map(([name, value], index) => {
      const meta = getCategoryMeta(name, 'saida');
      return {
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
        color: meta.color || PALETTE[index % PALETTE.length],
      };
    });

    return list.sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Breakdown income by category
  const incomeCategories = useMemo(() => {
    const map = new Map<string, number>();
    let total = 0;
    transactions
      .filter((t) => t.type === 'entrada')
      .forEach((t) => {
        const current = map.get(t.category) || 0;
        map.set(t.category, current + t.amount);
        total += t.amount;
      });

    const list = Array.from(map.entries()).map(([name, value], index) => {
      const meta = getCategoryMeta(name, 'entrada');
      return {
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
        color: meta.color || PALETTE[index % PALETTE.length],
      };
    });

    return list.sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Daily or grouped timeline comparison of Entradas vs Saídas
  const dailyTimeline = useMemo(() => {
    const dayMap = new Map<string, { date: string; entradas: number; saidas: number }>();

    transactions.forEach((t) => {
      const key = t.date;
      if (!dayMap.has(key)) {
        dayMap.set(key, { date: key, entradas: 0, saidas: 0 });
      }
      const entry = dayMap.get(key)!;
      if (t.type === 'entrada') {
        entry.entradas += t.amount;
      } else {
        entry.saidas += t.amount;
      }
    });

    return Array.from(dayMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        label: formatDatePTBR(item.date).slice(0, 5), // 'DD/MM'
      }));
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return expenseCategories.reduce((acc, cur) => acc + cur.value, 0);
  }, [expenseCategories]);

  const totalIncome = useMemo(() => {
    return incomeCategories.reduce((acc, cur) => acc + cur.value, 0);
  }, [incomeCategories]);

  // Custom tooltips
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-stone-700">
          <p className="font-bold flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            {data.name}
          </p>
          <p className="text-amber-300 font-semibold mt-0.5">
            {formatCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-stone-700">
          <p className="font-semibold text-stone-300 mb-1">Dia: {label}</p>
          {payload.map((item: any) => (
            <p
              key={item.name}
              className="flex items-center justify-between gap-3 text-[11px]"
              style={{ color: item.color }}
            >
              <span>{item.name}:</span>
              <span className="font-bold">{formatCurrency(item.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasData = transactions.length > 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              Análise Visual Financeira
            </h3>
            <span className="text-xs px-2 py-0.5 bg-vinho-50 text-vinho-800 font-semibold rounded-full border border-vinho-100">
              {periodLabel}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Visão gráfica de despesas, receitas e fluxo do período
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('despesas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'despesas'
                ? 'bg-white text-vinho-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-vinho-600" />
            <span>Despesas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('receitas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'receitas'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Receitas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comparativo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'comparativo'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-stone-700" />
            <span>Fluxo</span>
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="py-12 text-center text-stone-400">
          <PieIcon className="w-12 h-12 mx-auto stroke-1 opacity-50 mb-2" />
          <p className="text-sm font-medium">Nenhum dado financeiro para exibir gráficos.</p>
          <p className="text-xs text-stone-400 mt-1">Adicione uma transação para ver os gráficos.</p>
        </div>
      ) : (
        <div className="pt-4">
          {/* TAB 1: Despesas por categoria */}
          {activeTab === 'despesas' && (
            <div>
              {expenseCategories.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <p className="text-sm font-medium">Sem despesas registradas no período selecionado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Donut Chart */}
                  <div className="lg:col-span-6 h-64 sm:h-72 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {expenseCategories.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Donut Summary */}
                    <div className="absolute text-center pointer-events-none">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        Total Saídas
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-vinho-900 block leading-tight">
                        {formatCurrency(totalExpense)}
                      </span>
                    </div>
                  </div>

                  {/* Category Breakdown List */}
                  <div className="lg:col-span-6 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Distribuição por Categoria
                    </div>
                    {expenseCategories.map((item) => (
                      <div
                        key={item.name}
                        className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/80 transition flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-stone-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-stone-900 block">
                            {formatCurrency(item.value)}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Receitas por categoria */}
          {activeTab === 'receitas' && (
            <div>
              {incomeCategories.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <p className="text-sm font-medium">Sem receitas registradas no período selecionado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-6 h-64 sm:h-72 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {incomeCategories.map((entry, index) => (
                            <Cell
                              key={`income-cell-${index}`}
                              fill={entry.color}
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center pointer-events-none">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        Total Entradas
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-emerald-800 block leading-tight">
                        {formatCurrency(totalIncome)}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Fontes de Renda
                    </div>
                    {incomeCategories.map((item) => (
                      <div
                        key={item.name}
                        className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/80 transition flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-stone-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-stone-900 block">
                            {formatCurrency(item.value)}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Fluxo Entradas vs Saídas Timeline */}
          {activeTab === 'comparativo' && (
            <div>
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E5E7EB' }}
                      tickFormatter={(val) => `R$ ${val}`}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                      formatter={(value) => (
                        <span className="font-semibold text-stone-700 capitalize">
                          {value}
                        </span>
                      )}
                    />
                    <Bar
                      name="Entradas"
                      dataKey="entradas"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Saídas"
                      dataKey="saidas"
                      fill="#831A2D"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
