import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

export default async function CleanerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "cleaner") redirect("/dashboard/client");

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">לוח בקרה למנקה</h1>
        <p className="text-gray-500">ברוך שובך, {profile?.full_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "ממתין", value: pending.length },
          { label: "מאושר", value: confirmed.length },
          { label: "הושלמו", value: completed.length },
          { label: "סה\"כ הכנסות", value: `₪${totalEarnings.toFixed(0)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-2xl font-bold text-blue-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* All bookings */}
      <h2 className="text-xl font-semibold mb-4">כל בקשות ההזמנה</h2>
      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((b) => {
            const cp = b.client_profile as { full_name: string; phone: string | null } | null;
            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{cp?.full_name ?? "Client"}</p>
                    {cp?.phone && <p className="text-sm text-gray-400">{cp.phone}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      {b.service_type} · {new Date(b.date).toLocaleDateString()} at {b.time}
                    </p>
                    <p className="text-sm text-gray-400">{b.address}</p>
                    {b.notes && <p className="text-sm text-gray-500 italic mt-1">"{b.notes}"</p>}
                  </div>
                  <div className="text-right rtl:text-left">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[b.status as BookingStatus]}`}>
                      {STATUS_LABELS[b.status as BookingStatus]}
                    </span>
                    <p className="font-semibold text-blue-600 mt-2">₪{b.price}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
          אין בקשות הזמנה עדיין.
        </div>
      )}
    </div>
  );
}
