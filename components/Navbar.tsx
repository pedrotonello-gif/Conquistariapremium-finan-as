import React, { useState } from 'react';
import { 
  PlusCircle, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown,
  FileText
} from 'lucide-react';
import { Transaction } from '../types';
import { exportTransactionsToExcel, exportTransactionsToCSV_PTBR } from '../utils/exportExcel';

interface NavbarProps {
  onOpenNewTransaction: () => void;
  filteredTransactions: Transaction[];
  allTransactions: Transaction[];
  currentPeriodLabel: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTransaction,
  filteredTransactions,
  allTransactions,
  currentPeriodLabel,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportXLSX = (useCurrentPeriod: boolean) => {
    const list = useCurrentPeriod ? filteredTransactions : allTransactions;
    const label = useCurrentPeriod ? currentPeriodLabel : 'Historico_Completo';
    exportTransactionsToExcel(list, label);
    setShowExportMenu(false);
  };

  const handleExportCSV = (useCurrentPeriod: boolean) => {
    const list = useCurrentPeriod ? filteredTransactions : allTransactions;
    const label = useCurrentPeriod ? currentPeriodLabel : 'Historico_Completo';
    exportTransactionsToCSV_PTBR(list, label);
    setShowExportMenu(false);
  };

  return (
    <header className="relative bg-gradient-to-r from-[#4D0A16] via-[#681423] to-[#831A2D] text-white shadow-xl">
      {/* Decorative subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 p-0.5 shadow-lg shadow-black/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#4D0A16] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white font-sans">
                  CONQUISTARIA
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-amber-300 border border-white/20">
                  Finanças
                </span>
              </div>
              <p className="text-xs sm:text-sm text-vinho-100/90 font-medium">
                Controle financeiro pessoal inteligente e descomplicado
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto-save status indicator badge */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 text-emerald-300 text-xs font-medium border border-white/10"
              title="Todas as informações são salvas automaticamente no seu navegador"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Salvo automaticamente</span>
            </div>

            {/* Export button with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-sm font-semibold border border-white/20 shadow-sm transition-all duration-150 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-haspopup="true"
                aria-expanded={showExportMenu}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Exportar Excel</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                        Opções de Exportação
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Compatível 100% com Excel Brasil (PT-BR)
                      </p>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={() => handleExportXLSX(true)}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-vinho-50 hover:text-vinho-900 transition flex items-center gap-2.5"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-semibold text-stone-800">
                            Excel (.xlsx) - Mês Selecionado
                          </div>
                          <div className="text-xs text-stone-500">
                            {filteredTransactions.length} transações ({currentPeriodLabel})
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleExportXLSX(false)}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-vinho-50 hover:text-vinho-900 transition flex items-center gap-2.5"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-semibold text-stone-800">
                            Excel (.xlsx) - Histórico Geral
                          </div>
                          <div className="text-xs text-stone-500">
                            Todas as {allTransactions.length} transações salvas
                          </div>
                        </div>
                      </button>

                      <div className="my-1 border-t border-stone-100" />

                      <button
                        onClick={() => handleExportCSV(true)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition flex items-center gap-2.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-stone-400" />
                        <span>CSV Formatado PT-BR (Ponto-e-vírgula com BOM)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Nova Transação Button */}
            <button
              type="button"
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:from-amber-500 active:to-amber-600 text-vinho-950 font-bold text-sm shadow-lg shadow-black/25 transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Transação</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
