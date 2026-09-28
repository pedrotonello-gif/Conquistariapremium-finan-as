import * as XLSX from 'xlsx';
import { Transaction } from '../types';
import { formatDatePTBR, formatCurrency } from './formatters';

export interface ExportOptions {
  periodLabel?: string;
  format?: 'xlsx' | 'csv';
}

export const exportTransactionsToExcel = (
  transactions: Transaction[],
  periodLabel: string = 'Geral'
): void => {
  if (!transactions || transactions.length === 0) {
    alert('Nenhuma transação disponível para exportar.');
    return;
  }

  // Sort by date ascending for clean financial statement
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  let totalEntradas = 0;
  let totalSaidas = 0;

  // Prepare formatted rows specifically for Brazilian Excel
  const rows = sorted.map((t, index) => {
    const isEntrada = t.type === 'entrada';
    if (isEntrada) {
      totalEntradas += t.amount;
    } else {
      totalSaidas += t.amount;
    }

    const valorNumerico = isEntrada ? t.amount : -t.amount;

    return {
      'Item': index + 1,
      'Data': formatDatePTBR(t.date),
      'Tipo': isEntrada ? 'Entrada (Receita)' : 'Saída (Despesa)',
      'Categoria': t.category,
      'Descrição': t.description,
      'Valor (R$)': t.amount,
      'Impacto no Saldo (R$)': valorNumerico,
    };
  });

  const saldoLiquido = totalEntradas - totalSaidas;

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability in Excel
  worksheet['!cols'] = [
    { wch: 8 },  // Item
    { wch: 14 }, // Data
    { wch: 20 }, // Tipo
    { wch: 26 }, // Categoria
    { wch: 36 }, // Descrição
    { wch: 16 }, // Valor
    { wch: 22 }, // Impacto no Saldo
  ];

  // Append empty row then summary rows
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [],
      ['RESUMO FINANCEIRO', '', '', '', '', '', ''],
      ['Total de Entradas:', '', '', '', '', totalEntradas, ''],
      ['Total de Saídas:', '', '', '', '', totalSaidas, ''],
      ['Saldo do Período:', '', '', '', '', saldoLiquido, ''],
    ],
    { origin: -1 }
  );

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CONQUISTARIA');

  // Format filename cleanly in pt-BR
  const sanitizedPeriod = periodLabel.replace(/[\s\/]+/g, '_').toLowerCase();
  const fileName = `CONQUISTARIA_${sanitizedPeriod}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Write and trigger download
  XLSX.writeFile(workbook, fileName);
};

export const exportTransactionsToCSV_PTBR = (
  transactions: Transaction[],
  periodLabel: string = 'Geral'
): void => {
  if (!transactions || transactions.length === 0) {
    alert('Nenhuma transação disponível para exportar.');
    return;
  }

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  // Brazilian Excel requires UTF-8 BOM, semicolon separator and comma decimal
  const BOM = '\uFEFF';
  const headers = ['Item', 'Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Impacto no Saldo (R$)'];
  
  let totalEntradas = 0;
  let totalSaidas = 0;

  const lines = [headers.join(';')];

  sorted.forEach((t, idx) => {
    const isEntrada = t.type === 'entrada';
    if (isEntrada) totalEntradas += t.amount;
    else totalSaidas += t.amount;

    const formattedAmount = t.amount.toFixed(2).replace('.', ',');
    const formattedImpact = (isEntrada ? t.amount : -t.amount).toFixed(2).replace('.', ',');

    const row = [
      idx + 1,
      formatDatePTBR(t.date),
      isEntrada ? 'Entrada' : 'Saída',
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"R$ ${formattedAmount}"`,
      `"R$ ${formattedImpact}"`
    ];
    lines.push(row.join(';'));
  });

  lines.push('');
  lines.push('--- RESUMO FINANCEIRO ---;;;;;;');
  lines.push(`Total de Entradas:;;;;;;"R$ ${totalEntradas.toFixed(2).replace('.', ',')}"`);
  lines.push(`Total de Saídas:;;;;;;"R$ ${totalSaidas.toFixed(2).replace('.', ',')}"`);
  lines.push(`Saldo Final:;;;;;;"R$ ${(totalEntradas - totalSaidas).toFixed(2).replace('.', ',')}"`);

  const csvContent = BOM + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const sanitizedPeriod = periodLabel.replace(/[\s\/]+/g, '_').toLowerCase();
  a.href = url;
  a.download = `CONQUISTARIA_${sanitizedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
