"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "cleaner" ? "cleaner" : "client";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: defaultRole,
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role: form.role, address: form.address },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Email confirmation disabled — user is immediately logged in
    if (data.session) {
      if (form.role === "cleaner") {
        router.push("/dashboard/cleaner/setup");
      } else {
        router.push("/dashboard/client");
      }
      router.refresh();
      return;
    }

    // Email confirmation required
    setAwaitingEmail(true);
  }

  if (awaitingEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">בדוק את האימייל שלך</h1>
          <p className="text-gray-500 mb-2">שלחנו קישור אימות לכתובת:</p>
          <p className="font-semibold text-gray-800 mb-6">{form.email}</p>
          <p className="text-gray-400 text-sm">
            לחץ על הקישור באימייל כדי לאשר את החשבון ולהתחיל.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">צור את החשבון שלך</h1>
        <p className="text-gray-500 mb-6">הצטרף לקהילת קלין מאץ&apos;</p>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">שם מלא</label>
            <input
              name="full_name"
              required
              value={form.full_name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="שמך"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">דואר אלקטרוני</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">סיסמה</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="לפחות 6 תווים"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">אני רוצה…</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="client">מצוא מנקה (לקוח)</option>
              <option value="cleaner">להציע שירותי ניקיון (מנקה)</option>
            </select>
          </div>

          {form.role === "client" && (
            <div>
              <label className="block text-sm font-medium mb-1">כתובת בית</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="רחוב, עיר"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "יוצר חשבון..." : "צור חשבון"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            התחבר
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
