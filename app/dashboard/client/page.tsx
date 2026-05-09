import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingStatus } from "@/types";
import RefreshButton from "@/components/dashboard/RefreshButton";
import QuickStatusButton from "@/components/bookings/QuickStatusButton";
import { getLang } from "@/lib/language";
import { t, tService } from "@/lib/i18n";
import { CheckCircle } from "lucide-react";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  pending_completion: "bg-orange-100 text-orange-700",
};

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lang = await getLang();

  const STATUS_LABELS: Record<BookingStatus, string> = {
    pending: t("statusPending", lang),
    confirmed: t("statusConfirmed", lang),
    in_progress: t("statusInProgress", lang),
    completed: t("statusCompleted", lang),
    cancelled: t("statusCancelled", lang),
    pending_completion: t("statusPendingCompletion", lang),
  };

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

  const needsApproval = bookings?.filter((b) => b.status === "pending_completion") ?? [];
  const upcoming = bookings?.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status)) ?? [];
  const past = bookings?.filter((b) => ["completed", "cancelled"].includes(b.status)) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("myDashboard", lang)}</h1>
          <p className="text-gray-500">{t("welcomeBack", lang)}, {profile?.full_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/bookings/new"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            {t("newBooking", lang)}
          </Link>
          <RefreshButton label={t("refresh", lang)} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: t("totalBookings", lang), value: bookings?.length ?? 0 },
          { label: t("upcoming", lang), value: upcoming.length },
          { label: t("completed", lang), value: past.filter((b) => b.status === "completed").length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-blue-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Needs Your Approval */}
      {needsApproval.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-700">
            <CheckCircle size={20} />
            {t("needsApproval", lang)}
          </h2>
          <div className="space-y-3">
            {needsApproval.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{cp?.full_name ?? t("cleaner", lang)}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()} {t("at", lang)} {b.time}
                      </p>
                      <p className="text-sm text-orange-700 mt-2 font-medium">
                        {t("cleanerMarkedComplete", lang)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="font-semibold text-blue-600">₪{b.price}</p>
                      <div className="flex gap-2">
                        <QuickStatusButton
                          bookingId={b.id}
                          newStatus="completed"
                          label={t("approveCompletion", lang)}
                          loadingLabel={t("approvingCompletion", lang)}
                          variant="green"
                        />
                        <QuickStatusButton
                          bookingId={b.id}
                          newStatus="confirmed"
                          label={t("markIncomplete", lang)}
                          loadingLabel="..."
                          variant="red"
                        />
                      </div>
                      <Link href={`/bookings/${b.id}`} className="text-xs text-blue-500 hover:underline">
                        {t("detailsMessages", lang)}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("upcomingBookings", lang)}</h2>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cp?.full_name ?? t("cleaner", lang)}</p>
                    <p className="text-sm text-gray-500">
                      {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()} {t("at", lang)} {b.time}
                    </p>
                    <p className="text-sm text-gray-400">{b.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[b.status as BookingStatus]}`}>
                      {STATUS_LABELS[b.status as BookingStatus]}
                    </span>
                    <span className="font-semibold text-blue-600">₪{b.price}</span>
                    <Link href={`/bookings/${b.id}`} className="text-xs text-blue-500 hover:underline">
                      {t("detailsMessages", lang)}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
            {t("noUpcomingBookings", lang)}{" "}
            <Link href="/cleaners" className="text-blue-600 hover:underline">{t("findCleaner", lang)}</Link>
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t("pastBookings", lang)}</h2>
        {past.length > 0 ? (
          <div className="space-y-3">
            {past.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between opacity-80">
                  <div>
                    <p className="font-medium">{cp?.full_name ?? t("cleaner", lang)}</p>
                    <p className="text-sm text-gray-500">
                      {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()}
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
          <p className="text-gray-400 text-sm">{t("noPastBookings", lang)}</p>
        )}
      </section>
    </div>
  );
}
