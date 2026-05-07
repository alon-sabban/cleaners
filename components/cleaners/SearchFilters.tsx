"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Search } from "lucide-react";

const SERVICES = [
  "ניקיון בית",
  "ניקיון עמוק",
  "ניקיון משרד",
  "לאחר שיפוץ",
  "כניסה/יציאה מדירה",
  "ניקיון חלונות",
];

function FiltersInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [service, setService] = useState(searchParams.get("service") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [maxRate, setMaxRate] = useState(searchParams.get("maxRate") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (location) params.set("location", location);
    if (maxRate) params.set("maxRate", maxRate);
    router.push(`/cleaners?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">שירות</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">כל השירותים</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">מיקום</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="עיר או אזור..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">מחיר מקסימלי (₪/שעה)</label>
          <input
            type="number"
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
            placeholder="כל מחיר"
            min={0}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
      >
        <Search size={16} /> חפש
      </button>
    </form>
  );
}

export default function SearchFilters() {
  return (
    <Suspense>
      <FiltersInner />
    </Suspense>
  );
}
