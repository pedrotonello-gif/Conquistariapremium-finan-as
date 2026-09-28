import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../utils/formatters';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTransaction?: Transaction | null;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('saida');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state whenever modal opens or editing transaction changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(String(editingTransaction.amount));
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description);
      
      const foundInPresets = CATEGORIES.some(c => c.name === editingTransaction.category);
      if (foundInPresets) {
        setCategory(editingTransaction.category);
        setCustomCategory('');
      } else {
        setCategory('Outro');
        setCustomCategory(editingTransaction.category);
      }
    } else {
      // Default new transaction values
      setType('saida');
      setAmountStr('');
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
      setDescription('');
      setCategory(CATEGORIES.filter(c => c.type === 'saida')[0]?.name || '');
      setCustomCategory('');
    }
    setErrorMessage('');
  }, [isOpen, editingTransaction]);

  // Adjust default category if type changes and current category doesn't match
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validPresets = CATEGORIES.filter(c => c.type === newType);
    if (!validPresets.some(c => c.name === category)) {
      setCategory(validPresets[0]?.name || '');
      setCustomCategory('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Clean amount
    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor, informe uma descrição para a transação.');
      return;
    }

    if (!date) {
      setErrorMessage('Por favor, selecione uma data válida.');
      return;
    }

    const finalCategory = (category === 'Outro' && customCategory.trim()) 
      ? customCategory.trim() 
      : (category || (type === 'entrada' ? 'Outras Entradas' : 'Outras Saídas'));

    onSave(
      {
        description: description.trim(),
        amount: parsedAmount,
        type,
        category: finalCategory,
        date,
      },
      editingTransaction?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  const availableCategories = CATEGORIES.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#4D0A16] to-[#741726] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-amber-300">
              {type === 'entrada' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </span>
            <h2 className="text-lg font-bold">
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMessage}
            </div>
          )}

          {/* Type Selector (Entrada vs Saída) */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeChange('entrada')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition ${
                  type === 'entrada'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Entrada (Receita)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('saida')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition ${
                  type === 'saida'
                    ? 'bg-vinho-700 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Saída (Despesa)</span>
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 font-bold text-base">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                className="w-full pl-11 pr-4 py-2.5 bg-stone-50 hover:bg-stone-50/80 focus:bg-white text-stone-900 font-bold text-lg rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-vinho-600 transition"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                <FileText className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Mercado, Salário, Internet, Combustível..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 hover:bg-stone-50/80 focus:bg-white text-stone-900 text-sm font-medium rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-vinho-600 transition"
              />
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Data da Transação
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 hover:bg-stone-50/80 focus:bg-white text-stone-900 text-sm font-medium rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-vinho-600 transition"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 pointer-events-none">
                <Tag className="w-4 h-4" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-stone-50 hover:bg-stone-50/80 focus:bg-white text-stone-900 text-sm font-medium rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-vinho-600 transition appearance-none"
              >
                {availableCategories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="Outro">Outra (Personalizada)...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {/* If custom category selected */}
            {category === 'Outro' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Digite o nome da sua categoria personalizada"
                  className="w-full px-3.5 py-2 bg-stone-50 focus:bg-white text-stone-900 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-vinho-600 transition"
                />
              </div>
            )}

            {/* Quick category chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {availableCategories.slice(0, 5).map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => {
                    setCategory(c.name);
                    setCustomCategory('');
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    category === c.name
                      ? 'bg-vinho-100 text-vinho-900 border-vinho-300 font-bold'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-vinho-700 hover:bg-vinho-800 text-white text-sm font-bold shadow-md shadow-vinho-900/20 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
