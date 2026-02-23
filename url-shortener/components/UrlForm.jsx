"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isValidUrl } from "@/lib/validation";

export function UrlForm({ onCreated }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create short URL");
        return;
      }

      onCreated(data);
      setUrl("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={error}
            disabled={isLoading}
            autoComplete="url"
            aria-label="Long URL"
          />
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto sm:min-w-[140px]">
          Shorten
        </Button>
      </div>
    </form>
  );
}
