import { CategoryOption, TransactionType } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

export const formatDatePTBR = (dateStr: string): string => {
  if (!dateStr) return '';
  // handles YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime())
    ? dateStr
    : date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const getMonthNamePTBR = (monthIndex: number, short = false): string => {
  const name = MONTH_NAMES[monthIndex] || '';
  return short ? name.slice(0, 3) : name;
};

export const formatMonthYear = (key: string): string => {
  if (!key || key === 'all') return 'Todas as Transações';
  const [year, monthStr] = key.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  return `${MONTH_NAMES[monthIdx] || ''} de ${year}`;
};

export const CATEGORIES: CategoryOption[] = [
  // Entradas
  { name: 'Salário', iconName: 'Briefcase', color: '#10B981', type: 'entrada' },
  { name: 'Freelance / Serviços', iconName: 'Laptop', color: '#059669', type: 'entrada' },
  { name: 'Investimentos & Dividendos', iconName: 'TrendingUp', color: '#3B82F6', type: 'entrada' },
  { name: 'Vendas & Negócios', iconName: 'ShoppingBag', color: '#6366F1', type: 'entrada' },
  { name: 'Presente / Bonificação', iconName: 'Gift', color: '#8B5CF6', type: 'entrada' },
  { name: 'Outras Entradas', iconName: 'PlusCircle', color: '#14B8A6', type: 'entrada' },

  // Saídas
  { name: 'Alimentação & Mercado', iconName: 'Utensils', color: '#F97316', type: 'saida' },
  { name: 'Moradia & Aluguel', iconName: 'Home', color: '#EF4444', type: 'saida' },
  { name: 'Transporte & Combustível', iconName: 'Car', color: '#EAB308', type: 'saida' },
  { name: 'Saúde & Farmácia', iconName: 'HeartPulse', color: '#EC4899', type: 'saida' },
  { name: 'Educação & Cursos', iconName: 'GraduationCap', color: '#8B5CF6', type: 'saida' },
  { name: 'Lazer & Viagens', iconName: 'Palmtree', color: '#06B6D4', type: 'saida' },
  { name: 'Contas & Boletos', iconName: 'Receipt', color: '#78716C', type: 'saida' },
  { name: 'Compras Pessoais', iconName: 'CreditCard', color: '#D946EF', type: 'saida' },
  { name: 'Outras Saídas', iconName: 'MinusCircle', color: '#9E2239', type: 'saida' },
];

export const getCategoryMeta = (categoryName: string, type: TransactionType) => {
  const match = CATEGORIES.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );
  if (match) return match;

  return {
    name: categoryName,
    iconName: type === 'entrada' ? 'TrendingUp' : 'Tag',
    color: type === 'entrada' ? '#10B981' : '#9E2239',
    type,
  };
};
