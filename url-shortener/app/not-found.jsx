import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Link not found</h1>
      <p className="text-zinc-600">This short link does not exist or has been removed.</p>
      <Link
        href="/"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Create a short link
      </Link>
    </div>
  );
}
