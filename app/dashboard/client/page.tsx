import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingStatus } from "@/types";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "ממתין",
  confirmed: "מאושר",
  in_progress: "בתהליך",
  completed: "הושלם",
  cancelled: "בוטל",
};

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, cleaner_profile:profiles!bookings_cleaner_id_fkey(full_name)")
    .eq("client_id", user.id)
    .order("date", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const upcoming = bookings?.filter((b) =>
    ["pending", "confirmed", "in_progress"].includes(b.status)
  ) ?? [];
  const past = bookings?.filter((b) =>
    ["completed", "cancelled"].includes(b.status)
  ) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">לוח הבקרה שלי</h1>
          <p className="text-gray-500">ברוך שובך, {profile?.full_name}</p>
        </div>
        <Link
          href="/bookings/new"
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          הזמנה חדשה
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "סה\"כ הזמנות", value: bookings?.length ?? 0 },
          { label: "קרובות", value: upcoming.length },
          { label: "הושלמו", value: past.filter((b) => b.status === "completed").length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-blue-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">הזמנות קרובות</h2>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cp?.full_name ?? "מנקה"}</p>
                    <p className="text-sm text-gray-500">
                      {b.service_type} · {new Date(b.date).toLocaleDateString()} at {b.time}
                    </p>
                    <p className="text-sm text-gray-400">{b.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[b.status as BookingStatus]}`}>
                      {STATUS_LABELS[b.status as BookingStatus]}
                    </span>
                    <span className="font-semibold text-blue-600">₪{b.price}</span>
                    <Link href={`/bookings/${b.id}`} className="text-xs text-blue-500 hover:underline">
                      פרטים והודעות
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
            אין הזמנות קרובות.{" "}
            <Link href="/cleaners" className="text-blue-600 hover:underline">מצא מנקה</Link>
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-xl font-semibold mb-4">הזמנות קודמות</h2>
        {past.length > 0 ? (
          <div className="space-y-3">
            {past.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between opacity-80">
                  <div>
                    <p className="font-medium">{cp?.full_name ?? "מנקה"}</p>
                    <p className="text-sm text-gray-500">
                      {b.service_type} · {new Date(b.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[b.status as BookingStatus]}`}>
                      {STATUS_LABELS[b.status as BookingStatus]}
                    </span>
                    <span className="font-semibold">₪{b.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">אין הזמנות קודמות.</p>
        )}
      </section>
    </div>
  );
}
