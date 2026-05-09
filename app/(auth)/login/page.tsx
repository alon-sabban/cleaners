"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { t, getClientLang, Lang } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("he");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLang(getClientLang());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-2xl font-bold text-teal-600">CleanLy</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{t("welcomeBack2", lang)}</h1>
        <p className="text-gray-500 mb-6">{t("loginDesc", lang)}</p>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("emailLabel", lang)}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("passwordLabel", lang)}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? t("signingIn", lang) : t("signIn", lang)}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          {t("noAccount", lang)}{" "}
          <Link href="/register" className="text-teal-600 font-medium hover:underline">
            {t("register", lang)}
          </Link>
        </p>
      </div>
    </div>
  );
}
