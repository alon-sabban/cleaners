import Link from "next/link";
import { Search, Star, Shield, Clock } from "lucide-react";
import { getLang } from "@/lib/language";
import { t } from "@/lib/i18n";

export default async function HomePage() {
  const lang = await getLang();

  const features = [
    {
      icon: Shield,
      title: t("feature1Title", lang),
      desc: t("feature1Desc", lang),
    },
    {
      icon: Star,
      title: t("feature2Title", lang),
      desc: t("feature2Desc", lang),
    },
    {
      icon: Clock,
      title: t("feature3Title", lang),
      desc: t("feature3Desc", lang),
    },
  ];

  const services =
    lang === "en"
      ? [
          { label: "Home Cleaning", he: "ניקיון בית" },
          { label: "Deep Cleaning", he: "ניקיון עמוק" },
          { label: "Office Cleaning", he: "ניקיון משרד" },
          { label: "Post-Renovation", he: "לאחר שיפוץ" },
          { label: "Move In/Out", he: "כניסה/יציאה מדירה" },
          { label: "Window Cleaning", he: "ניקיון חלונות" },
        ]
      : [
          { label: "ניקיון בית", he: "ניקיון בית" },
          { label: "ניקיון עמוק", he: "ניקיון עמוק" },
          { label: "ניקיון משרד", he: "ניקיון משרד" },
          { label: "לאחר שיפוץ", he: "לאחר שיפוץ" },
          { label: "כניסה/יציאה מדירה", he: "כניסה/יציאה מדירה" },
          { label: "ניקיון חלונות", he: "ניקיון חלונות" },
        ];

  const [heroLine1, heroLine2] = t("heroTitle", lang).split("\n");

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 text-white py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #fbbf24 0%, transparent 50%), radial-gradient(circle at 80% 20%, #34d399 0%, transparent 50%)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-block bg-white/10 text-teal-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            {lang === "he" ? "⭐ פלטפורמת הניקיון המובילה בישראל" : "⭐ Israel's trusted cleaning marketplace"}
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            {heroLine1}<br />{heroLine2}
          </h1>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("heroSubtitle", lang)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cleaners"
              className="bg-white text-teal-700 font-semibold px-8 py-4 rounded-xl hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Search size={20} />
              {t("findCleaners", lang)}
            </Link>
            <Link
              href="/register?role=cleaner"
              className="border-2 border-white/70 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white transition-all"
            >
              {t("offerServices", lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">{t("whyCleanLy", lang)}</h2>
          <p className="text-gray-500 text-center mb-12">{lang === "he" ? "מה שמייחד אותנו" : "What sets us apart"}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-center border border-stone-100">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-teal-100">
                  <Icon className="text-teal-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">{t("availableServices", lang)}</h2>
          <p className="text-gray-500 mb-10">{t("servicesSubtitle", lang)}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((s) => (
              <Link
                key={s.he}
                href={`/cleaners?service=${encodeURIComponent(s.he)}`}
                className="bg-teal-50 text-teal-700 font-medium px-5 py-2.5 rounded-full hover:bg-teal-100 hover:shadow-sm transition-all border border-teal-100"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-600 to-teal-800 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{t("readyToStart", lang)}</h2>
          <p className="text-teal-100 mb-8 leading-relaxed">{t("ctaDesc", lang)}</p>
          <Link
            href="/register"
            className="bg-white text-teal-700 font-semibold px-8 py-4 rounded-xl hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-block"
          >
            {t("createFreeAccount", lang)}
          </Link>
        </div>
      </section>
    </div>
  );
}
