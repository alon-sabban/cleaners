import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { BookingStatus } from "@/types";
import RefreshButton from "@/components/dashboard/RefreshButton";
import QuickStatusButton from "@/components/bookings/QuickStatusButton";
import { getLang } from "@/lib/language";
import { t, tService } from "@/lib/i18n";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  pending_completion: "bg-orange-100 text-orange-700",
};

export default async function CleanerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lang = await getLang();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "cleaner") redirect("/dashboard/client");

  const { data: cleanerProfile } = await supabase
    .from("cleaner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, client_profile:profiles!bookings_client_id_fkey(full_name, phone)")
    .eq("cleaner_id", user.id)
    .order("date", { ascending: true });

  const pending = bookings?.filter((b) => b.status === "pending") ?? [];
  const approved = bookings?.filter((b) => b.status === "confirmed" || b.status === "in_progress") ?? [];
  const completedAll = bookings?.filter((b) => b.status === "completed" || b.status === "pending_completion" || b.status === "cancelled") ?? [];
  const totalEarnings = bookings?.filter((b) => b.status === "completed").reduce((sum, b) => sum + Number(b.price), 0) ?? 0;

  function BookingCard({ b, showActions }: { b: NonNullable<typeof bookings>[number]; showActions: boolean }) {
    const cp = b.client_profile as { full_name: string; phone: string | null } | null;
    const status = b.status as BookingStatus;
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium truncate">{cp?.full_name ?? t("client", lang)}</p>
            {cp?.phone && <p className="text-xs text-gray-400">{cp.phone}</p>}
            <p className="text-sm text-gray-500 mt-0.5">
              {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()} {t("at", lang)} {b.time}
            </p>
            <p className="text-xs text-gray-400">{b.address}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            {status === "pending_completion" ? (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                {t("awaitingClientApproval", lang)}
              </span>
            ) : status === "completed" ? (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                {t("statusCompleted", lang)}
              </span>
            ) : status === "cancelled" ? (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                {t("statusCancelled", lang)}
              </span>
            ) : null}
            <p className="font-semibold text-blue-600 text-sm">₪{b.price}</p>
            {showActions && (
              <div className="flex gap-1.5 flex-wrap justify-end">
                {status === "pending" && (
                  <>
                    <QuickStatusButton
                      bookingId={b.id}
                      newStatus="confirmed"
                      label={t("acceptJob", lang)}
                      loadingLabel={t("accepting", lang)}
                      variant="green"
                    />
                    <QuickStatusButton
                      bookingId={b.id}
                      newStatus="cancelled"
                      label={t("rejectBooking", lang)}
                      loadingLabel={t("rejecting", lang)}
                      variant="red"
                    />
                  </>
                )}
                {(status === "confirmed" || status === "in_progress") && (
                  <QuickStatusButton
                    bookingId={b.id}
                    newStatus="pending_completion"
                    label={t("markCompleted", lang)}
                    loadingLabel={t("completing", lang)}
                    variant="blue"
                  />
                )}
              </div>
            )}
            <Link href={`/bookings/${b.id}`} className="text-xs text-blue-500 hover:underline">
              {t("detailsActions", lang)}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("cleanerDashboard", lang)}</h1>
          <p className="text-gray-500">{t("welcomeBack", lang)}, {profile?.full_name}</p>
        </div>
        <RefreshButton label={t("refresh", lang)} />
      </div>

      {!cleanerProfile && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">{t("profileIncomplete", lang)}</p>
            <p className="text-amber-700 text-sm mt-0.5">{t("completeProfileDesc", lang)}</p>
          </div>
          <Link
            href="/dashboard/cleaner/setup"
            className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors shrink-0"
          >
            {t("completeProfile", lang)}
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: t("pending", lang), value: pending.length },
          { label: t("confirmed", lang), value: approved.length },
          { label: t("completed", lang), value: bookings?.filter((b) => b.status === "completed").length ?? 0 },
          { label: t("totalEarnings", lang), value: `₪${totalEarnings.toFixed(0)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-2xl font-bold text-blue-600">{value}</div>
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
            {pending.map((b) => <BookingCard key={b.id} b={b} showActions={true} />)}
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
            {approved.map((b) => <BookingCard key={b.id} b={b} showActions={true} />)}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t("noApprovedJobs", lang)}</p>
        )}
      </section>

      {/* Completed & Cancelled */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t("completedJobs", lang)}</h2>
        {completedAll.length > 0 ? (
          <div className="space-y-3 opacity-80">
            {completedAll.map((b) => <BookingCard key={b.id} b={b} showActions={false} />)}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t("noCompletedJobs", lang)}</p>
        )}
      </section>
    </div>
  );
}
