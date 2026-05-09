"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SERVICES = [
  "ניקיון בית",
  "ניקיון עמוק",
  "ניקיון משרד",
  "לאחר שיפוץ",
  "כניסה/יציאה מדירה",
  "ניקיון חלונות",
];

interface CleanerOption {
  id: string;
  user_id: string;
  hourly_rate: number;
  profile: { full_name: string } | null;
}

interface BookingFormProps {
  userId: string;
  preselectedCleaner: CleanerOption | null;
  cleaners: CleanerOption[];
}

export default function BookingForm({ userId, preselectedCleaner, cleaners }: BookingFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    cleaner_id: preselectedCleaner?.id ?? "",
    service_type: "",
    date: "",
    time: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCleaner = cleaners.find((c) => c.id === form.cleaner_id) ?? preselectedCleaner;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCleaner) return;

    setLoading(true);
    setError("");

    const price = selectedCleaner.hourly_rate;
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cleaner_id: selectedCleaner.user_id, price }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to create booking.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5"
    >
      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">מנקה</label>
        <select
          name="cleaner_id"
          required
          value={form.cleaner_id}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">בחר מנקה...</option>
          {cleaners.map((c) => (
            <option key={c.id} value={c.id}>
              {c.profile?.full_name ?? "Cleaner"} — ₪{c.hourly_rate}/שעה
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">סוג שירות</label>
        <select
          name="service_type"
          required
          value={form.service_type}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">בחר שירות...</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">תאריך</label>
          <input
            type="date"
            name="date"
            required
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">שעה</label>
          <input
            type="time"
            name="time"
            required
            value={form.time}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">כתובת</label>
        <input
          type="text"
          name="address"
          required
          value={form.address}
          onChange={handleChange}
          placeholder="כתובת מלאה לניקיון"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">הערות (אופציונלי)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="הוראות מיוחדות או בקשות..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      {selectedCleaner && (
        <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-700">
          מחיר משוער: <strong>₪{selectedCleaner.hourly_rate}/שעה</strong>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
      >
        {loading ? "שולח..." : "בקש הזמנה"}
      </button>
    </form>
  );
}
