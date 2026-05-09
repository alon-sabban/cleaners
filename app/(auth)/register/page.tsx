"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail } from "lucide-react";
import { getClientLang, Lang } from "@/lib/i18n";

const LABELS = {
  he: {
    title: "צור את החשבון שלך",
    subtitle: "הצטרף לקהילת קלין מאץ'",
    fullName: "שם מלא",
    fullNamePlaceholder: "שמך",
    email: "דואר אלקטרוני",
    password: "סיסמה",
    passwordPlaceholder: "לפחות 6 תווים",
    iWant: "אני רוצה…",
    findCleaner: "מצוא מנקה (לקוח)",
    offerCleaning: "להציע שירותי ניקיון (מנקה)",
    homeAddress: "כתובת בית",
    addressPlaceholder: "רחוב, עיר",
    creating: "יוצר חשבון...",
    createAccount: "צור חשבון",
    alreadyHave: "כבר יש לך חשבון?",
    signIn: "התחבר",
    checkEmail: "בדוק את האימייל שלך",
    sentLink: "שלחנו קישור אימות לכתובת:",
    clickLink: "לחץ על הקישור באימייל כדי לאשר את החשבון ולהתחיל.",
  },
  en: {
    title: "Create your account",
    subtitle: "Join the CleanMatch community",
    fullName: "Full Name",
    fullNamePlaceholder: "Your name",
    email: "Email",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    iWant: "I want to…",
    findCleaner: "Find a cleaner (client)",
    offerCleaning: "Offer cleaning services (cleaner)",
    homeAddress: "Home Address",
    addressPlaceholder: "Street, City",
    creating: "Creating account...",
    createAccount: "Create Account",
    alreadyHave: "Already have an account?",
    signIn: "Sign In",
    checkEmail: "Check your email",
    sentLink: "We sent a verification link to:",
    clickLink: "Click the link in the email to confirm your account and get started.",
  },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "cleaner" ? "cleaner" : "client";
  const [lang, setLang] = useState<Lang>("he");

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

  useEffect(() => {
    setLang(getClientLang());
  }, []);

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

    if (data.session) {
      if (form.role === "cleaner") {
        router.push("/dashboard/cleaner/setup");
      } else {
        router.push("/dashboard/client");
      }
      router.refresh();
      return;
    }

    setAwaitingEmail(true);
  }

  const L = LABELS[lang];

  if (awaitingEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">{L.checkEmail}</h1>
          <p className="text-gray-500 mb-2">{L.sentLink}</p>
          <p className="font-semibold text-gray-800 mb-6">{form.email}</p>
          <p className="text-gray-400 text-sm">{L.clickLink}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1">{L.title}</h1>
        <p className="text-gray-500 mb-6">{L.subtitle}</p>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{L.fullName}</label>
            <input
              name="full_name"
              required
              value={form.full_name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={L.fullNamePlaceholder}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{L.email}</label>
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
            <label className="block text-sm font-medium mb-1">{L.password}</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={L.passwordPlaceholder}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{L.iWant}</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="client">{L.findCleaner}</option>
              <option value="cleaner">{L.offerCleaning}</option>
            </select>
          </div>

          {form.role === "client" && (
            <div>
              <label className="block text-sm font-medium mb-1">{L.homeAddress}</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={L.addressPlaceholder}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? L.creating : L.createAccount}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          {L.alreadyHave}{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            {L.signIn}
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
