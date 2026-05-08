"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SERVICES = [
  "ניקיון בית",
  "ניקיון עמוק",
  "ניקיון משרד",
  "לאחר שיפוץ",
  "כניסה/יציאה מדירה",
  "ניקיון חלונות",
];

export default function CleanerSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    bio: "",
    hourly_rate: "",
    location: "",
    services: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("cleaner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setIsEdit(true);
        setForm({
          bio: data.bio ?? "",
          hourly_rate: String(data.hourly_rate),
          location: data.location,
          services: data.services ?? [],
        });
      }
    }
    loadExisting();
  }, [router]);

  function toggleService(service: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(service)
        ? f.services.filter((s) => s !== service)
        : [...f.services, service],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.services.length === 0) {
      setError("בחר לפחות שירות אחד.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase
      .from("cleaner_profiles")
      .upsert({
        user_id: user.id,
        bio: form.bio || null,
        hourly_rate: Number(form.hourly_rate),
        location: form.location,
        services: form.services,
      }, { onConflict: "user_id" });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/cleaner");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">
        {isEdit ? "עדכן את הפרופיל שלך" : "השלם את הפרופיל שלך"}
      </h1>
      <p className="text-gray-500 mb-8">
        פרטים אלו יוצגו ללקוחות המחפשים מנקה.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6"
      >
        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">מיקום</label>
          <input
            required
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="עיר או אזור, למשל: תל אביב"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            מחיר לשעה (₪)
          </label>
          <input
            type="number"
            required
            min={1}
            value={form.hourly_rate}
            onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))}
            placeholder="למשל: 80"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">שירותים מוצעים</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  form.services.includes(s)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            תיאור קצר (אופציונלי)
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            placeholder="ספר קצת על עצמך ועל הניסיון שלך..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "שומר..." : isEdit ? "עדכן פרופיל" : "שמור והמשך"}
        </button>
      </form>
    </div>
  );
}
