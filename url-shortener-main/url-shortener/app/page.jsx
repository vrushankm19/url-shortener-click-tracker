import { UrlShortener } from "@/components/UrlShortener";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center sm:mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            URL Shortener
          </h1>
          <p className="mt-2 text-zinc-600">Shorten links and track clicks</p>
        </header>
        <main>
          <UrlShortener />
        </main>
      </div>
    </div>
  );
}
