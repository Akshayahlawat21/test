const base = 'animate-pulse bg-gray-200 rounded';

export default function LoadingSkeleton({ variant = 'text', count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return items.map((i) => (
      <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <div className={`${base} h-40 w-full rounded-xl`} />
        <div className={`${base} h-5 w-3/4`} />
        <div className={`${base} h-4 w-full`} />
        <div className={`${base} h-4 w-5/6`} />
      </div>
    ));
  }

  if (variant === 'avatar') {
    return items.map((i) => (
      <div key={i} className="flex items-center gap-3">
        <div className={`${base} h-10 w-10 rounded-full`} />
        <div className="space-y-2 flex-1">
          <div className={`${base} h-4 w-1/3`} />
          <div className={`${base} h-3 w-1/2`} />
        </div>
      </div>
    ));
  }

  if (variant === 'table-row') {
    return items.map((i) => (
      <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
        <div className={`${base} h-4 w-1/5`} />
        <div className={`${base} h-4 w-1/4`} />
        <div className={`${base} h-4 w-1/3`} />
        <div className={`${base} h-4 w-1/6`} />
      </div>
    ));
  }

  // text variant (default)
  return items.map((i) => (
    <div key={i} className="space-y-2">
      <div className={`${base} h-4 w-full`} />
      <div className={`${base} h-4 w-5/6`} />
      <div className={`${base} h-4 w-4/6`} />
    </div>
  ));
}
