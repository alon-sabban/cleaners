import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookingForm from "@/components/bookings/BookingForm";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ cleaner?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cleanerProfile } = params.cleaner
    ? await supabase
        .from("cleaner_profiles")
        .select("*, profile:profiles(full_name)")
        .eq("id", params.cleaner)
        .single()
    : { data: null };

  const { data: allCleaners } = await supabase
    .from("cleaner_profiles")
    .select("id, hourly_rate, profile:profiles(full_name)")
    .eq("is_verified", true);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Book a Cleaner</h1>
      <p className="text-gray-500 mb-8">Fill in the details below to request a booking.</p>
      <BookingForm
        userId={user.id}
        preselectedCleaner={cleanerProfile}
        cleaners={allCleaners ?? []}
      />
    </div>
  );
}
