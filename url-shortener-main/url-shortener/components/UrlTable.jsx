"use client";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function UrlTable({ urls, baseUrl }) {
  function copyShortUrl(shortCode) {
    const shortUrl = `${baseUrl}/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
  }

  if (urls.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 py-12 text-center text-zinc-500">
        <p>No short links yet. Create one above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-medium text-zinc-700">Original URL</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Short link</th>
              <th className="px-4 py-3 text-center font-medium text-zinc-700">Clicks</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((row) => {
              const shortUrl = `${baseUrl}/${row.shortCode}`;
              return (
                <tr key={row.id} className="border-b border-zinc-100 last:border-0">
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-600 sm:max-w-xs">
                    <a
                      href={row.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-emerald-600"
                      title={row.originalUrl}
                    >
                      {row.originalUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        {shortUrl}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyShortUrl(row.shortCode)}
                        className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                        title="Copy short URL"
                        aria-label="Copy short URL"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-zinc-600">{row.clicks}</td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(row.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
