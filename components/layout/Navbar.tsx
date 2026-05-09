import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/language";
import { t } from "@/lib/i18n";
import SignOutButton from "@/components/auth/SignOutButton";
import LanguageToggle from "@/components/layout/LanguageToggle";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const lang = await getLang();

  let fullName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    fullName = profile?.full_name ?? null;
  }

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-teal-600">
          CleanLy
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/cleaners" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            {t("findCleaners", lang)}
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                {t("dashboard", lang)}
              </Link>
              {fullName && (
                <span className="text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg">
                  {fullName}
                </span>
              )}
              <SignOutButton label={t("signOut", lang)} />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                {t("signIn", lang)}
              </Link>
              <Link
                href="/register"
                className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                {t("getStarted", lang)}
              </Link>
            </>
          )}
          <LanguageToggle lang={lang} />
        </div>
      </div>
    </nav>
  );
}
