import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, CheckCircle } from "lucide-react";
import Image from "next/image";

export default async function CleanerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cleaner } = await supabase
    .from("cleaner_profiles")
    .select("*, profile:profiles(full_name, avatar_url, created_at)")
    .eq("id", id)
    .single();

  if (!cleaner) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, client_profile:profiles!reviews_client_id_fkey(full_name, avatar_url)")
    .eq("cleaner_id", cleaner.user_id)
    .order("created_at", { ascending: false })
    .limit(10);

  const profile = cleaner.profile as { full_name: string; avatar_url: string | null; created_at: string };
  const avatarUrl =
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=3b82f6&color=fff&size=128`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Image
            src={avatarUrl}
            alt={profile.full_name}
            width={96}
            height={96}
            className="rounded-2xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              {cleaner.is_verified && (
                <CheckCircle size={20} className="text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-3">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {cleaner.location}
              </span>
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                {cleaner.rating_avg > 0
                  ? `${Number(cleaner.rating_avg).toFixed(1)} (${cleaner.total_reviews} ביקורות)`
                  : "חדש"}
              </span>
            </div>
            <p className="text-gray-600">{cleaner.bio || "No bio provided."}</p>
          </div>
          <div className="text-right rtl:text-left">
            <div className="text-3xl font-bold text-blue-600">
              ₪{cleaner.hourly_rate}
              <span className="text-base font-normal text-gray-400">/שעה</span>
            </div>
            <Link
              href={`/bookings/new?cleaner=${cleaner.id}`}
              className="mt-3 inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              הזמן עכשיו
            </Link>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">שירותים מוצעים</h2>
        <div className="flex flex-wrap gap-2">
          {(cleaner.services as string[]).map((s) => (
            <span
              key={s}
              className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">
          ביקורות ({cleaner.total_reviews})
        </h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r) => {
              const cp = r.client_profile as { full_name: string } | null;
              return (
                <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{cp?.full_name ?? "Anonymous"}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">אין ביקורות עדיין.</p>
        )}
      </div>
    </div>
  );
}
