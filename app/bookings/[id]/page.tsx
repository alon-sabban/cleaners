import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { MapPin, Calendar, Clock, Star } from "lucide-react";
import BookingActions from "@/components/bookings/BookingActions";
import ChatWindow from "@/components/messaging/ChatWindow";
import { BookingStatus } from "@/types";
import Image from "next/image";
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

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const lang = await getLang();

  const STATUS_LABELS: Record<BookingStatus, string> = {
    pending: t("statusPendingApproval", lang),
    confirmed: t("statusConfirmed", lang),
    in_progress: t("statusInProgress", lang),
    completed: t("statusCompleted", lang),
    cancelled: t("statusCancelled", lang),
    pending_completion: t("statusPendingCompletion", lang),
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      client_profile:profiles!bookings_client_id_fkey(id, full_name, phone, avatar_url),
      cleaner_profile:profiles!bookings_cleaner_id_fkey(id, full_name, phone, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (!booking) notFound();

  if (booking.client_id !== user.id && booking.cleaner_id !== user.id) {
    redirect("/dashboard");
  }

  const isCleaner = booking.cleaner_id === user.id;
  const otherPerson = isCleaner
    ? (booking.client_profile as { id: string; full_name: string; phone: string | null; avatar_url: string | null })
    : (booking.cleaner_profile as { id: string; full_name: string; phone: string | null; avatar_url: string | null });

  const avatarUrl =
    otherPerson?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(otherPerson?.full_name ?? "")}&background=3b82f6&color=fff&size=80`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">{t("bookingDetails", lang)}</h1>
          <p className="text-gray-400 text-sm">#{id.slice(0, 8).toUpperCase()}</p>
        </div>
        <span className={`text-sm font-semibold px-4 py-2 rounded-full ${STATUS_COLORS[booking.status as BookingStatus]}`}>
          {STATUS_LABELS[booking.status as BookingStatus]}
        </span>
      </div>

      {/* Booking details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-lg">{tService(booking.service_type, lang)}</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            {new Date(booking.date).toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            {booking.time}
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin size={16} className="text-blue-500" />
            {booking.address}
          </div>
        </div>
        {booking.notes && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 italic">
            &ldquo;{booking.notes}&rdquo;
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-gray-500 text-sm">{t("price", lang)}</span>
          <span className="text-2xl font-bold text-blue-600">₪{booking.price}</span>
        </div>
      </div>

      {/* Other person card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold mb-4">
          {isCleaner ? t("clientDetails", lang) : t("cleanerDetails", lang)}
        </h2>
        <div className="flex items-center gap-4">
          <Image
            src={avatarUrl}
            alt={otherPerson?.full_name ?? ""}
            width={56}
            height={56}
            className="rounded-xl object-cover"
          />
          <div>
            <p className="font-semibold">{otherPerson?.full_name}</p>
            {otherPerson?.phone && (
              <p className="text-sm text-gray-500">{otherPerson.phone}</p>
            )}
          </div>
          {!isCleaner && (
            <div className="mr-auto flex items-center gap-1 text-yellow-500">
              <Star size={14} className="fill-yellow-400" />
              <span className="text-sm text-gray-600">{t("verifiedCleaner", lang)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {(booking.status !== "completed" && booking.status !== "cancelled" && booking.status !== "pending_completion") ||
       (!isCleaner && booking.status === "pending_completion") ? (
        <BookingActions
          bookingId={id}
          status={booking.status as BookingStatus}
          isCleaner={isCleaner}
          lang={lang}
        />
      ) : null}

      {/* Chat */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold mb-4">{t("messagesTitle", lang)}</h2>
        <ChatWindow bookingId={id} currentUserId={user.id} lang={lang} />
      </div>
    </div>
  );
}
