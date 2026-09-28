import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Receipt,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDatePTBR, getCategoryMeta } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onOpenNewTransaction: () => void;
  periodLabel: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenNewTransaction,
  periodLabel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | TransactionType>('todos');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filter and sort transactions
  const processedTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (typeFilter !== 'todos' && t.type !== typeFilter) return false;

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const descMatches = t.description.toLowerCase().includes(term);
          const catMatches = t.category.toLowerCase().includes(term);
          return descMatches || catMatches;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date-asc') {
          return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, sortBy]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Header and Controls */}
      <div className="p-4 sm:p-6 border-b border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900">
                Histórico de Transações
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                {processedTransactions.length} {processedTransactions.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Visualização detalhada para {periodLabel}
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar descrição ou categoria..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 focus:bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-vinho-600 transition"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="inline-flex bg-stone-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTypeFilter('todos')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  typeFilter === 'todos'
                    ? 'bg-white text-stone-900 shadow-sm font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('entrada')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  typeFilter === 'entrada'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Entradas
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('saida')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  typeFilter === 'saida'
                    ? 'bg-vinho-700 text-white shadow-sm font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Saídas
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold py-1.5 pl-2.5 pr-7 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-vinho-600 cursor-pointer"
              >
                <option value="date-desc">Mais recentes</option>
                <option value="date-asc">Mais antigas</option>
                <option value="amount-desc">Maior valor</option>
                <option value="amount-asc">Menor valor</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
                <ArrowUpDown className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table (Desktop & Tablets) */}
      {processedTransactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-vinho-50 text-vinho-700 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-stone-800">
            Nenhuma transação encontrada
          </h4>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchTerm || typeFilter !== 'todos'
              ? 'Tente ajustar os filtros de busca ou remover as palavras pesquisadas.'
              : 'Não há registros para o período selecionado. Comece adicionando sua primeira receita ou despesa!'}
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-vinho-700 hover:bg-vinho-800 text-white text-xs font-bold rounded-xl shadow transition"
            >
              Adicionar Nova Transação
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3 px-4 sm:px-6">Tipo</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 sm:px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {processedTransactions.map((tx) => {
                const isEntrada = tx.type === 'entrada';
                const meta = getCategoryMeta(tx.category, tx.type);

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-vinho-50/30 transition-colors duration-150 group"
                  >
                    {/* Tipo Badge */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                          isEntrada
                            ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                            : 'bg-vinho-100/80 text-vinho-900 border border-vinho-200'
                        }`}
                      >
                        {isEntrada ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-vinho-700" />
                        )}
                        <span>{isEntrada ? 'Entrada' : 'Saída'}</span>
                      </span>
                    </td>

                    {/* Descrição */}
                    <td className="py-3.5 px-4 font-semibold text-stone-900 max-w-xs truncate">
                      {tx.description}
                    </td>

                    {/* Categoria */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        {tx.category}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="py-3.5 px-4 text-xs font-medium text-stone-500 whitespace-nowrap">
                      {formatDatePTBR(tx.date)}
                    </td>

                    {/* Valor */}
                    <td
                      className={`py-3.5 px-4 text-right font-extrabold whitespace-nowrap ${
                        isEntrada ? 'text-emerald-600' : 'text-vinho-700'
                      }`}
                    >
                      {isEntrada ? '+ ' : '- '}
                      {formatCurrency(tx.amount)}
                    </td>

                    {/* Ações (Editar & Excluir) */}
                    <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEdit(tx)}
                          title="Editar transação"
                          className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => onDelete(tx)}
                          title="Excluir transação"
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-700 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
