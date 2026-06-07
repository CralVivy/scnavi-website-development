/**
 * Deterministic subject-to-color mapping utility.
 * Uses a predefined dictionary of complete Tailwind class strings
 * to avoid production purging issues with dynamic class interpolation.
 *
 * IMPORTANT: Every class string here must be a complete, static string.
 * Never build class names by string interpolation at runtime — Tailwind
 * scans source files as plain text and cannot see dynamically constructed names.
 */

const COLOR_PALETTE = [
  {
    bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200',    bgAccent: 'bg-blue-500',    ring: 'ring-blue-200',
    darkBg: 'dark:bg-blue-500/10',    darkText: 'dark:text-blue-300',    darkBorder: 'dark:border-blue-500/20',
    gradientLight: 'from-white to-blue-100/30', gradientDark: 'dark:from-surface-container dark:to-blue-500/20',
  },
  {
    bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200',  bgAccent: 'bg-violet-500',  ring: 'ring-violet-200',
    darkBg: 'dark:bg-violet-500/10',  darkText: 'dark:text-violet-300',  darkBorder: 'dark:border-violet-500/20',
    gradientLight: 'from-white to-violet-100/30', gradientDark: 'dark:from-surface-container dark:to-violet-500/20',
  },
  {
    bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', bgAccent: 'bg-emerald-500', ring: 'ring-emerald-200',
    darkBg: 'dark:bg-emerald-500/10', darkText: 'dark:text-emerald-300', darkBorder: 'dark:border-emerald-500/20',
    gradientLight: 'from-white to-emerald-100/30', gradientDark: 'dark:from-surface-container dark:to-emerald-500/20',
  },
  {
    bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   bgAccent: 'bg-amber-500',   ring: 'ring-amber-200',
    darkBg: 'dark:bg-amber-500/10',   darkText: 'dark:text-amber-300',   darkBorder: 'dark:border-amber-500/20',
    gradientLight: 'from-white to-amber-100/30', gradientDark: 'dark:from-surface-container dark:to-amber-500/20',
  },
  {
    bg: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-200',    bgAccent: 'bg-rose-500',    ring: 'ring-rose-200',
    darkBg: 'dark:bg-rose-500/10',    darkText: 'dark:text-rose-300',    darkBorder: 'dark:border-rose-500/20',
    gradientLight: 'from-white to-rose-100/30', gradientDark: 'dark:from-surface-container dark:to-rose-500/20',
  },
  {
    bg: 'bg-cyan-100',    text: 'text-cyan-700',    border: 'border-cyan-200',    bgAccent: 'bg-cyan-500',    ring: 'ring-cyan-200',
    darkBg: 'dark:bg-cyan-500/10',    darkText: 'dark:text-cyan-300',    darkBorder: 'dark:border-cyan-500/20',
    gradientLight: 'from-white to-cyan-100/30', gradientDark: 'dark:from-surface-container dark:to-cyan-500/20',
  },
  {
    bg: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-200',  bgAccent: 'bg-orange-500',  ring: 'ring-orange-200',
    darkBg: 'dark:bg-orange-500/10',  darkText: 'dark:text-orange-300',  darkBorder: 'dark:border-orange-500/20',
    gradientLight: 'from-white to-orange-100/30', gradientDark: 'dark:from-surface-container dark:to-orange-500/20',
  },
  {
    bg: 'bg-pink-100',    text: 'text-pink-700',    border: 'border-pink-200',    bgAccent: 'bg-pink-500',    ring: 'ring-pink-200',
    darkBg: 'dark:bg-pink-500/10',    darkText: 'dark:text-pink-300',    darkBorder: 'dark:border-pink-500/20',
    gradientLight: 'from-white to-pink-100/30', gradientDark: 'dark:from-surface-container dark:to-pink-500/20',
  },
  {
    bg: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-200',    bgAccent: 'bg-teal-500',    ring: 'ring-teal-200',
    darkBg: 'dark:bg-teal-500/10',    darkText: 'dark:text-teal-300',    darkBorder: 'dark:border-teal-500/20',
    gradientLight: 'from-white to-teal-100/30', gradientDark: 'dark:from-surface-container dark:to-teal-500/20',
  },
  {
    bg: 'bg-indigo-100',  text: 'text-indigo-700',  border: 'border-indigo-200',  bgAccent: 'bg-indigo-500',  ring: 'ring-indigo-200',
    darkBg: 'dark:bg-indigo-500/10',  darkText: 'dark:text-indigo-300',  darkBorder: 'dark:border-indigo-500/20',
    gradientLight: 'from-white to-indigo-100/30', gradientDark: 'dark:from-surface-container dark:to-indigo-500/20',
  },
  {
    bg: 'bg-lime-100',    text: 'text-lime-700',    border: 'border-lime-200',    bgAccent: 'bg-lime-500',    ring: 'ring-lime-200',
    darkBg: 'dark:bg-lime-500/10',    darkText: 'dark:text-lime-300',    darkBorder: 'dark:border-lime-500/20',
    gradientLight: 'from-white to-lime-100/30', gradientDark: 'dark:from-surface-container dark:to-lime-500/20',
  },
  {
    bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', bgAccent: 'bg-fuchsia-500', ring: 'ring-fuchsia-200',
    darkBg: 'dark:bg-fuchsia-500/10', darkText: 'dark:text-fuchsia-300', darkBorder: 'dark:border-fuchsia-500/20',
    gradientLight: 'from-white to-fuchsia-100/30', gradientDark: 'dark:from-surface-container dark:to-fuchsia-500/20',
  },
];

/**
 * Simple string hash function that produces a deterministic integer from a string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns a consistent color set for a given subject name.
 * The same subject will always map to the same color.
 */
export function getColorForSubject(subjectName: string) {
  const index = hashString(subjectName.toLowerCase().trim()) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

export type SubjectColor = typeof COLOR_PALETTE[number];
