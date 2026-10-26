export const controlBase =
  'w-full rounded-xl border bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-soft/50 transition focus:outline-none focus:ring-4 focus:ring-brand-500/15'

export const controlTone = (invalid?: boolean) =>
  invalid
    ? 'border-red-400 focus:border-red-500'
    : 'border-sand-300 hover:border-sand-400 focus:border-brand-500'

export const controlClass = (invalid?: boolean) => `${controlBase} ${controlTone(invalid)}`
