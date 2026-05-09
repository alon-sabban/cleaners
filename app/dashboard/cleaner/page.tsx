import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { BookingStatus } from "@/types";
import RefreshButton from "@/components/dashboard/RefreshButton";
import { getLang } from "@/lib/language";
import { t, tService } from "@/lib/i18n";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default async function CleanerDashboardPage() {
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
  };

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
    .order("date", { ascending: false });

  const pending = bookings?.filter((b) => b.status === "pending") ?? [];
  const confirmed = bookings?.filter((b) => b.status === "confirmed") ?? [];
  const completed = bookings?.filter((b) => b.status === "completed") ?? [];
  const totalEarnings = completed.reduce((sum, b) => sum + Number(b.price), 0);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("pending", lang), value: pending.length },
          { label: t("confirmed", lang), value: confirmed.length },
          { label: t("completed", lang), value: completed.length },
          { label: t("totalEarnings", lang), value: `₪${totalEarnings.toFixed(0)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-2xl font-bold text-blue-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* All bookings */}
      <h2 className="text-xl font-semibold mb-4">{t("allBookingRequests", lang)}</h2>
      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((b) => {
            const cp = b.client_profile as { full_name: string; phone: string | null } | null;
            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{cp?.full_name ?? t("client", lang)}</p>
                    {cp?.phone && <p className="text-sm text-gray-400">{cp.phone}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      {tService(b.service_type, lang)} · {new Date(b.date).toLocaleDateString()} {t("at", lang)} {b.time}
                    </p>
                    <p className="text-sm text-gray-400">{b.address}</p>
                    {b.notes && <p className="text-sm text-gray-500 italic mt-1">&ldquo;{b.notes}&rdquo;</p>}
                  </div>
                  <div className="text-right rtl:text-left flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[b.status as BookingStatus]}`}>
                      {STATUS_LABELS[b.status as BookingStatus]}
                    </span>
                    <p className="font-semibold text-blue-600">₪{b.price}</p>
                    <Link href={`/bookings/${b.id}`} className="text-xs text-blue-500 hover:underline">
                      {t("detailsActions", lang)}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
          {t("noBookingRequests", lang)}
        </div>
      )}
    </div>
  );
}
