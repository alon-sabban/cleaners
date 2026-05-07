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
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Platform overview</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Users", value: totalUsers ?? 0 },
          { label: "Total Bookings", value: totalBookings ?? 0 },
          { label: "Pending Verifications", value: pendingVerifications ?? 0 },
          { label: "Platform Health", value: "99.9%" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-blue-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Recent Bookings</h2>
        {recentBookings && recentBookings.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Service</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Price</th>
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
                    <td className="py-3 text-right font-medium">${b.price}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-sm">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
