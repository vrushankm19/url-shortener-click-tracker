"use client";

import { useState, useEffect } from "react";
import { UrlForm } from "@/components/UrlForm";
import { UrlTable } from "@/components/UrlTable";

export function UrlShortener() {
  const [urls, setUrls] = useState([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBaseUrl(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/urls");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) {
          setUrls(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Failed to load URLs. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Refresh the list every 5 seconds so click counts stay up to date
    const interval = setInterval(() => {
      if (cancelled) return;
      fetch("/api/urls")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch"))))
        .then((data) => {
          if (!cancelled) setUrls(data);
        })
        .catch(() => {});
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function handleCreated(newUrl) {
    setUrls((prev) => [newUrl, ...prev]);
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-medium text-zinc-800">Create short link</h2>
        <UrlForm onCreated={handleCreated} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-zinc-800">Your links</h2>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 py-12">
            <span className="text-zinc-500">Loading…</span>
          </div>
        ) : (
          <UrlTable urls={urls} baseUrl={baseUrl} />
        )}
      </section>
    </div>
  );
}
