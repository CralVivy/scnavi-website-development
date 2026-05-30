/**
 * Deterministic subject-to-color mapping utility.
 * Uses a predefined dictionary of complete Tailwind class strings
 * to avoid production purging issues with dynamic class interpolation.
 */

const COLOR_PALETTE = [
  { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200',    bgAccent: 'bg-blue-500',    ring: 'ring-blue-200' },
  { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200',  bgAccent: 'bg-violet-500',  ring: 'ring-violet-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', bgAccent: 'bg-emerald-500', ring: 'ring-emerald-200' },
  { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   bgAccent: 'bg-amber-500',   ring: 'ring-amber-200' },
  { bg: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-200',    bgAccent: 'bg-rose-500',    ring: 'ring-rose-200' },
  { bg: 'bg-cyan-100',    text: 'text-cyan-700',    border: 'border-cyan-200',    bgAccent: 'bg-cyan-500',    ring: 'ring-cyan-200' },
  { bg: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-200',  bgAccent: 'bg-orange-500',  ring: 'ring-orange-200' },
  { bg: 'bg-pink-100',    text: 'text-pink-700',    border: 'border-pink-200',    bgAccent: 'bg-pink-500',    ring: 'ring-pink-200' },
  { bg: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-200',    bgAccent: 'bg-teal-500',    ring: 'ring-teal-200' },
  { bg: 'bg-indigo-100',  text: 'text-indigo-700',  border: 'border-indigo-200',  bgAccent: 'bg-indigo-500',  ring: 'ring-indigo-200' },
  { bg: 'bg-lime-100',    text: 'text-lime-700',    border: 'border-lime-200',    bgAccent: 'bg-lime-500',    ring: 'ring-lime-200' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', bgAccent: 'bg-fuchsia-500', ring: 'ring-fuchsia-200' },
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
