import Link from "next/link";
import { Search, Star, Shield, Clock } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "אנשי מקצוע מבוקרים",
      desc: "כל מנקה עובר בדיקת רקע ומדורג על ידי הקהילה.",
    },
    {
      icon: Star,
      title: "מדורגים ומוערכים",
      desc: "ביקורות אמיתיות מחברי קהילה אמיתיים.",
    },
    {
      icon: Clock,
      title: "הזמן תוך דקות",
      desc: "בחר את המנקה שלך, קבע זמן, אשר. סיום.",
    },
  ];

  const services = [
    "ניקיון בית",
    "ניקיון עמוק",
    "ניקיון משרד",
    "לאחר שיפוץ",
    "כניסה/יציאה מדירה",
    "ניקיון חלונות",
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            מצא מנקים אמינים<br />בקהילה שלך
          </h1>
          <p className="text-xl text-blue-100 mb-10">
            הזמן מקצועני ניקיון מבוקרים ומהימנים על ידי הקהילה. מהיר, קל, אמין.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cleaners"
              className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={20} />
              מצא מנקה
            </Link>
            <Link
              href="/register?role=cleaner"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              הצע את שירותיך
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">למה קלין מאץ'?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-blue-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">שירותים זמינים</h2>
          <p className="text-gray-600 mb-10">מה שצריך לנקות, יש לנו מישהו לזה.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((s) => (
              <Link
                key={s}
                href={`/cleaners?service=${encodeURIComponent(s)}`}
                className="bg-blue-50 text-blue-700 font-medium px-5 py-2.5 rounded-full hover:bg-blue-100 transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">מוכן להתחיל?</h2>
          <p className="text-blue-100 mb-8">
            הצטרף למאות חברי קהילה שכבר משתמשים בקלין מאץ'.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors inline-block"
          >
            צור חשבון חינמי
          </Link>
        </div>
      </section>
    </div>
  );
}
