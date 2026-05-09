"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

export default function LanguageToggle({ lang }: { lang: Lang }) {
  const router = useRouter();

  function toggle() {
    const next = lang === "he" ? "en" : "he";
    document.cookie = `lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg"
    >
      {lang === "he" ? "EN" : "עב"}
    </button>
  );
}
