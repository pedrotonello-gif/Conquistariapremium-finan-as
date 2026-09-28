import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MonthNavigator } from './components/MonthNavigator';
import { SummaryCards } from './components/SummaryCards';
import { FinancialCharts } from './components/FinancialCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Transaction, SummaryData } from './types';
import { loadStoredTransactions, saveStoredTransactions } from './utils/storage';
import { formatMonthYear } from './utils/formatters';
import { CheckCircle2, Plus } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Initial State from localStorage (auto-recovery)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return loadStoredTransactions();
  });

  // Current month default: "YYYY-MM"
  const now = new Date();
  const initialMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialMonthKey);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. Auto-save to localStorage on every change
  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  // Show auto-dismissing toast notifications
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 3. Compute available monthly periods from transactions
  const availablePeriods = useMemo(() => {
    const periodSet = new Set<string>();
    // Always include current month
    periodSet.add(initialMonthKey);

    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        periodSet.add(tx.date.slice(0, 7));
      }
    });

    return Array.from(periodSet).sort((a, b) => b.localeCompare(a));
  }, [transactions, initialMonthKey]);

  // 4. Filter transactions for the selected month or all
  const filteredTransactions = useMemo(() => {
    if (selectedPeriod === 'all') {
      return transactions;
    }
    return transactions.filter((tx) => tx.date.startsWith(selectedPeriod));
  }, [transactions, selectedPeriod]);

  // 5. Calculate summary metrics (Saldo Total, Entradas, Saídas, Economia)
  const summary: SummaryData = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'entrada') {
        totalIncome += tx.amount;
        incomeCount += 1;
      } else {
        totalExpense += tx.amount;
        expenseCount += 1;
      }
    });

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      incomeCount,
      expenseCount,
    };
  }, [filteredTransactions]);

  // 6. Action Handlers: Add / Edit
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Edit existing transaction
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === existingId
            ? { ...t, ...txData }
            : t
        )
      );
      showToast('Transação atualizada com sucesso!');
    } else {
      // Create new transaction
      const newTransaction: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      // If user added a transaction for a different month than currently selected,
      // optionally navigate to that month if not on 'all'
      const txMonth = txData.date.slice(0, 7);
      if (selectedPeriod !== 'all' && selectedPeriod !== txMonth) {
        setSelectedPeriod(txMonth);
      }

      showToast('Nova transação adicionada!');
    }
  };

  // 7. Action Handlers: Delete
  const handleConfirmDelete = () => {
    if (!deletingTransaction) return;
    setTransactions((prev) => prev.filter((t) => t.id !== deletingTransaction.id));
    setDeletingTransaction(null);
    showToast('Transação excluída com sucesso.');
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const handleOpenNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const periodLabel = formatMonthYear(selectedPeriod);

  return (
    <div className="min-h-screen bg-[#FAF5F7] text-stone-800 flex flex-col font-sans selection:bg-vinho-200 selection:text-vinho-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-[#380B12] text-white rounded-2xl shadow-2xl border border-vinho-700/50 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenNewTransaction={handleOpenNew}
        filteredTransactions={filteredTransactions}
        allTransactions={transactions}
        currentPeriodLabel={periodLabel}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Month Selector Bar */}
        <section aria-label="Navegação Mensal">
          <MonthNavigator
            selectedPeriod={selectedPeriod}
            onChangePeriod={setSelectedPeriod}
            availablePeriods={availablePeriods}
          />
        </section>

        {/* Financial Summary Cards */}
        <section aria-label="Resumo Financeiro">
          <SummaryCards
            summary={summary}
            periodLabel={periodLabel}
          />
        </section>

        {/* Visual Charts (Graphs) */}
        <section aria-label="Gráficos Financeiros">
          <FinancialCharts
            transactions={filteredTransactions}
            periodLabel={periodLabel}
          />
        </section>

        {/* Transactions List with Edit & Delete */}
        <section aria-label="Histórico de Transações">
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleOpenEdit}
            onDelete={setDeletingTransaction}
            onOpenNewTransaction={handleOpenNew}
            periodLabel={periodLabel}
          />
        </section>

      </main>

      {/* Floating Action Button on Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button
          type="button"
          onClick={handleOpenNew}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-vinho-700 to-vinho-800 text-white shadow-xl shadow-vinho-950/30 flex items-center justify-center active:scale-95 transition"
          aria-label="Adicionar Nova Transação"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white/70 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-vinho-800 tracking-wider">CONQUISTARIA</span>
            <span>&bull;</span>
            <span>Controle Financeiro Pessoal</span>
          </div>
          <div className="text-stone-400">
            Seus dados são salvos com segurança de forma local e automática.
          </div>
        </div>
      </footer>

      {/* Modal for Adding / Editing Transaction */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Modal for Confirming Deletion */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
};

export default App;
