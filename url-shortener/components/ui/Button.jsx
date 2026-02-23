export function Button({ className = "", variant = "primary", isLoading, disabled, children, ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    secondary: "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-400",
    ghost: "text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-400",
  };
  const style = variants[variant] || variants.primary;

  return (
    <button
      className={`${base} ${style} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Shortening…
        </>
      ) : (
        children
      )}
    </button>
  );
}
