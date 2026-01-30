/**
 * Theme - Centralização de estilos Tailwind reutilizáveis
 * 
 * Garante:
 * - Consistência visual
 * - Alto contraste (texto sempre visível)
 * - DRY (Don't Repeat Yourself)
 */

/**
 * Classes para inputs
 * Alto contraste garantido (bg-white, text-gray-900)
 */
export const inputStyles = {
  base: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 focus:text-gray-900 placeholder-gray-400 transition-colors',
  error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
  disabled: 'bg-gray-100 cursor-not-allowed opacity-60',
};

/**
 * Classes para botões
 */
export const buttonStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed',
  icon: 'p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors',
};

/**
 * Classes para cards
 */
export const cardStyles = {
  base: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden',
  header: 'bg-gradient-to-br from-indigo-100 to-purple-100',
  content: 'p-6',
};

/**
 * Classes para textos
 * Alto contraste garantido
 */
export const textStyles = {
  title: 'text-3xl md:text-4xl font-bold text-gray-800',
  subtitle: 'text-gray-600',
  heading: 'text-xl font-bold text-gray-900',
  body: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  error: 'text-sm text-red-600',
};

/**
 * Classes para estados
 */
export const stateStyles = {
  loading: 'animate-pulse bg-gray-300 rounded',
  empty: 'text-center py-16 bg-gray-50 rounded-lg',
  error: 'bg-red-50 border border-red-200 rounded-lg p-6',
};

/**
 * Classes para containers
 */
export const containerStyles = {
  page: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  section: 'mb-8',
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
};

/**
 * Helper para combinar classes
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
