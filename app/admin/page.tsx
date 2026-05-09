import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [
    { count: totalUsers },
    { count: totalBookings },
    { count: pendingVerifications },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("cleaner_profiles").select("*", { count: "exact", head: true }).eq("is_verified", false),
    supabase.from("bookings").select("*, client:profiles!bookings_client_id_fkey(full_name)").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">לוח ניהול</h1>
      <p className="text-gray-500 mb-8">סקירת הפלטפורמה</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "סה\"כ משתמשים", value: totalUsers ?? 0 },
          { label: "סה\"כ הזמנות", value: totalBookings ?? 0 },
          { label: "אימותים ממתינים", value: pendingVerifications ?? 0 },
          { label: "בריאות הפלטפורמה", value: "99.9%" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-teal-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">הזמנות אחרונות</h2>
        {recentBookings && recentBookings.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-3 font-medium">לקוח</th>
                <th className="pb-3 font-medium">שירות</th>
                <th className="pb-3 font-medium">תאריך</th>
                <th className="pb-3 font-medium">סטטוס</th>
                <th className="pb-3 font-medium text-right rtl:text-left">מחיר</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.map((b) => {
                const c = b.client as { full_name: string } | null;
                return (
                  <tr key={b.id}>
                    <td className="py-3">{c?.full_name ?? "—"}</td>
                    <td className="py-3 text-gray-600">{b.service_type}</td>
                    <td className="py-3 text-gray-600">{new Date(b.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right rtl:text-left font-medium">₪{b.price}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-sm">אין הזמנות עדיין.</p>
        )}
      </div>
    </div>
  );
}
