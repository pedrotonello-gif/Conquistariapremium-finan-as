import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDatePTBR } from '../utils/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !transaction) return null;

  const isEntrada = transaction.type === 'entrada';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-stone-900">
            Excluir Transação?
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Esta ação não pode ser desfeita. A transação será removida permanentemente do seu histórico.
          </p>

          {/* Details preview */}
          <div className="mt-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Descrição:</span>
              <span className="font-bold text-stone-800">{transaction.description}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Categoria:</span>
              <span className="font-semibold text-stone-700">{transaction.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Data:</span>
              <span className="text-stone-600">{formatDatePTBR(transaction.date)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-stone-200">
              <span className="text-stone-500">Valor:</span>
              <span className={`font-extrabold ${isEntrada ? 'text-emerald-600' : 'text-vinho-700'}`}>
                {isEntrada ? '+ ' : '- '}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/20 transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Sim, Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
