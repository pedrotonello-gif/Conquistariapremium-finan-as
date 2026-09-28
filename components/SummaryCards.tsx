import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { SummaryData } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  summary: SummaryData;
  periodLabel: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, periodLabel }) => {
  const isPositiveBalance = summary.balance >= 0;
  const savingsPct = Math.min(Math.max(Math.round(summary.savingsRate), -100), 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Saldo Total */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#4D0A16] to-[#741726] text-white shadow-md border border-vinho-900/30">
        <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none">
          <Wallet className="w-28 h-28" />
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
            Saldo Líquido
          </span>
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {formatCurrency(summary.balance)}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
              isPositiveBalance
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-200 border border-red-500/30'
            }`}
          >
            {isPositiveBalance ? '+' : ''}
            {isPositiveBalance ? 'Superávit' : 'Déficit'}
          </span>
          <span className="text-stone-300 text-[11px] truncate">
            {periodLabel}
          </span>
        </div>
      </div>

      {/* Total de Entradas */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-white shadow-sm border border-stone-200 hover:border-emerald-200 transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Entradas (Receitas)
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {formatCurrency(summary.totalIncome)}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-500">
          <span className="inline-flex items-center text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            {summary.incomeCount} {summary.incomeCount === 1 ? 'registro' : 'registros'}
          </span>
          <span>recebidos</span>
        </div>
      </div>

      {/* Total de Saídas */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-white shadow-sm border border-stone-200 hover:border-vinho-200 transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-vinho-700">
            Saídas (Despesas)
          </span>
          <div className="w-8 h-8 rounded-xl bg-vinho-50 text-vinho-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {formatCurrency(summary.totalExpense)}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-500">
          <span className="inline-flex items-center text-vinho-700 font-bold">
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            {summary.expenseCount} {summary.expenseCount === 1 ? 'registro' : 'registros'}
          </span>
          <span>desembolsados</span>
        </div>
      </div>

      {/* Taxa de Poupança / Economia */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-white shadow-sm border border-stone-200 hover:border-amber-200 transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Taxa de Economia
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {summary.totalIncome > 0 ? `${savingsPct}%` : '0%'}
        </div>
        
        {/* Progress bar */}
        <div className="mt-2.5">
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                savingsPct >= 20
                  ? 'bg-emerald-500'
                  : savingsPct > 0
                  ? 'bg-amber-500'
                  : 'bg-vinho-600'
              }`}
              style={{ width: `${Math.max(0, Math.min(savingsPct, 100))}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-stone-400 truncate">
            {summary.totalIncome > 0
              ? `${savingsPct >= 0 ? 'Economizado' : 'Excedido'} das receitas`
              : 'Sem receitas no período'}
          </p>
        </div>
      </div>

    </div>
  );
};
