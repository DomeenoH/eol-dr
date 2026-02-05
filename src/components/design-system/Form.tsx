// Form Element Styles
export const FormStyles = {
  label: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5",
  input: "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200",
  select: "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all duration-200",
  checkbox: "rounded bg-white dark:bg-slate-900/50 border-slate-300 dark:border-white/10 text-accent-blue focus:ring-accent-blue/50",
  button: {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium py-2.5 px-6 rounded-lg transition-all duration-200 disabled:opacity-50",
    danger: "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium py-2.5 px-6 rounded-lg transition-all duration-200"
  }
};
