export function Input({ className = "", error, ...props }) {
  const borderClass = error ? "border-red-500 focus:ring-red-500" : "border-zinc-300";

  return (
    <div className="w-full">
      <input
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${borderClass} ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
