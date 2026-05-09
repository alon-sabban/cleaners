import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, CheckCircle } from "lucide-react";
import { CleanerProfile } from "@/types";

export default function CleanerCard({ cleaner }: { cleaner: CleanerProfile & { profile?: { full_name: string; avatar_url: string | null } } }) {
  const name = cleaner.profile?.full_name ?? "Cleaner";
  const avatar =
    cleaner.profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=80`;

  return (
    <Link
      href={`/cleaners/${cleaner.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
    >
      <div className="flex items-start gap-4">
        <Image
          src={avatar}
          alt={name}
          width={56}
          height={56}
          className="rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold truncate">{name}</span>
            {cleaner.is_verified && (
              <CheckCircle size={15} className="text-teal-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {cleaner.location}
            </span>
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              {cleaner.rating_avg > 0
                ? `${Number(cleaner.rating_avg).toFixed(1)} (${cleaner.total_reviews})`
                : "חדש"}
            </span>
          </div>
        </div>
        <div className="text-right rtl:text-left shrink-0">
          <span className="text-lg font-bold text-teal-600">₪{cleaner.hourly_rate}</span>
          <span className="text-xs text-gray-400">/שעה</span>
        </div>
      </div>

      {cleaner.services?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(cleaner.services as string[]).slice(0, 3).map((s) => (
            <span
              key={s}
              className="bg-teal-50 text-teal-600 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {s}
            </span>
          ))}
          {cleaner.services.length > 3 && (
            <span className="text-xs text-gray-400 px-2 py-1">
              +{cleaner.services.length - 3} עוד
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
