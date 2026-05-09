import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingStatus } from "@/types";
import RefreshButton from "@/components/dashboard/RefreshButton";
import QuickStatusButton from "@/components/bookings/QuickStatusButton";
import { getLang } from "@/lib/language";
import { t, tService } from "@/lib/i18n";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-teal-100 text-teal-700",
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
    .order("date", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const pending             = bookings?.filter((b) => b.status === "pending") ?? [];
  const approved            = bookings?.filter((b) => b.status === "confirmed" || b.status === "in_progress") ?? [];
  const awaitingConfirmation = bookings?.filter((b) => b.status === "pending_completion") ?? [];
  const completedAll        = bookings?.filter((b) => b.status === "completed" || b.status === "cancelled") ?? [];

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
            className="bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors"
          >
            {t("newBooking", lang)}
          </Link>
          <RefreshButton label={t("refresh", lang)} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: t("pending", lang),   value: pending.length },
          { label: t("confirmed", lang), value: approved.length },
          { label: t("completed", lang), value: bookings?.filter((b) => b.status === "completed").length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-stone-100 shadow-md p-5 text-center">
            <div className="text-3xl font-bold text-teal-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {t("pendingJobs", lang)}
          {pending.length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length > 0 ? (
          <div className="space-y-3">
            {pending.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-white rounded-xl border border-stone-100 shadow-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{cp?.full_name ?? t("cleaner", lang)}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()} {t("at", lang)} {b.time}
                      </p>
                      <p className="text-xs text-gray-400">{b.address}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[b.status as BookingStatus]}`}>
                        {STATUS_LABELS[b.status as BookingStatus]}
                      </span>
                      <p className="font-semibold text-teal-600 text-sm">₪{b.price}</p>
                      <div className="flex gap-1.5">
                        <QuickStatusButton
                          bookingId={b.id}
                          newStatus="cancelled"
                          label={t("cancelBooking", lang)}
                          loadingLabel={t("cancelling", lang)}
                          variant="red"
                        />
                      </div>
                      <Link href={`/bookings/${b.id}`} className="text-xs text-teal-500 hover:underline">
                        {t("detailsMessages", lang)}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t("noPendingJobs", lang)}</p>
        )}
      </section>

      {/* Approved */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("approvedJobs", lang)}</h2>
        {approved.length > 0 ? (
          <div className="space-y-3">
            {approved.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-white rounded-xl border border-stone-100 shadow-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{cp?.full_name ?? t("cleaner", lang)}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()} {t("at", lang)} {b.time}
                      </p>
                      <p className="text-xs text-gray-400">{b.address}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[b.status as BookingStatus]}`}>
                        {STATUS_LABELS[b.status as BookingStatus]}
                      </span>
                      <p className="font-semibold text-teal-600 text-sm">₪{b.price}</p>
                      <div className="flex gap-1.5">
                        <QuickStatusButton
                          bookingId={b.id}
                          newStatus="cancelled"
                          label={t("cancelBooking", lang)}
                          loadingLabel={t("cancelling", lang)}
                          variant="red"
                        />
                      </div>
                      <Link href={`/bookings/${b.id}`} className="text-xs text-teal-500 hover:underline">
                        {t("detailsMessages", lang)}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t("noApprovedJobs", lang)}</p>
        )}
      </section>

      {/* Confirm Completion */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {t("confirmCompletion", lang)}
          {awaitingConfirmation.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {awaitingConfirmation.length}
            </span>
          )}
        </h2>
        {awaitingConfirmation.length > 0 ? (
          <div className="space-y-3">
            {awaitingConfirmation.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{cp?.full_name ?? t("cleaner", lang)}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()} {t("at", lang)} {b.time}
                      </p>
                      <p className="text-sm text-orange-700 font-medium mt-1">
                        {t("cleanerMarkedComplete", lang)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="font-semibold text-teal-600 text-sm">₪{b.price}</p>
                      <div className="flex gap-1.5">
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
                      <Link href={`/bookings/${b.id}`} className="text-xs text-teal-500 hover:underline">
                        {t("detailsMessages", lang)}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">—</p>
        )}
      </section>

      {/* Completed */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t("completedJobs", lang)}</h2>
        {completedAll.length > 0 ? (
          <div className="space-y-3 opacity-80">
            {completedAll.map((b) => {
              const cp = b.cleaner_profile as { full_name: string } | null;
              return (
                <div key={b.id} className="bg-white rounded-xl border border-stone-100 shadow-md p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{cp?.full_name ?? t("cleaner", lang)}</p>
                    <p className="text-sm text-gray-500">
                      {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[b.status as BookingStatus]}`}>
                      {STATUS_LABELS[b.status as BookingStatus]}
                    </span>
                    <span className="font-semibold text-sm">₪{b.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t("noCompletedJobs", lang)}</p>
        )}
      </section>
    </div>
  );
}
