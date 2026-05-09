import { createClient } from "@/lib/supabase/server";
import CleanerCard from "@/components/cleaners/CleanerCard";
import SearchFilters from "@/components/cleaners/SearchFilters";
import { CleanerProfile } from "@/types";
import { getLang } from "@/lib/language";
import { t } from "@/lib/i18n";

export default async function CleanersPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; location?: string; maxRate?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const lang = await getLang();

  let query = supabase
    .from("cleaner_profiles")
    .select("*, profile:profiles(full_name, avatar_url)")
    .eq("is_verified", true)
    .order("rating_avg", { ascending: false });

  if (params.service) {
    query = query.contains("services", [params.service]);
  }
  if (params.location) {
    query = query.ilike("location", `%${params.location}%`);
  }
  if (params.maxRate) {
    query = query.lte("hourly_rate", Number(params.maxRate));
  }

  const { data: cleaners } = await query;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t("findCleanersTitle", lang)}</h1>
      <p className="text-gray-500 mb-8">{t("findCleanersSubtitle", lang)}</p>

      <SearchFilters />

      {cleaners && cleaners.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {cleaners.map((c) => (
            <CleanerCard key={c.id} cleaner={c as unknown as CleanerProfile} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">{t("noCleanersFound", lang)}</p>
          <p className="text-sm mt-2">{t("tryChangingFilters", lang)}</p>
        </div>
      )}
    </div>
  );
}
