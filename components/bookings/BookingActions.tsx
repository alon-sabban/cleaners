"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingStatus } from "@/types";
import { t, Lang } from "@/lib/i18n";

interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
  isCleaner: boolean;
  lang: Lang;
}

export default function BookingActions({ bookingId, status, isCleaner, lang }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: newStatus }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t("statusUpdateError", lang));
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold mb-4">{t("actions", lang)}</h2>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>
      )}

      <div className="flex flex-wrap gap-3">
        {isCleaner && status === "pending" && (
          <>
            <button
              onClick={() => updateStatus("confirmed")}
              disabled={loading !== null}
              className="bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading === "confirmed" ? t("confirming", lang) : t("confirmBooking", lang)}
            </button>
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={loading !== null}
              className="bg-red-50 text-red-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {loading === "cancelled" ? t("rejecting", lang) : t("rejectBooking", lang)}
            </button>
          </>
        )}

        {isCleaner && status === "confirmed" && (
          <button
            onClick={() => updateStatus("in_progress")}
            disabled={loading !== null}
            className="bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading === "in_progress" ? t("updating", lang) : t("markInProgress", lang)}
          </button>
        )}

        {isCleaner && status === "in_progress" && (
          <button
            onClick={() => updateStatus("completed")}
            disabled={loading !== null}
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading === "completed" ? t("completing", lang) : t("markCompleted", lang)}
          </button>
        )}

        {!isCleaner && (status === "pending" || status === "confirmed") && (
          <button
            onClick={() => updateStatus("cancelled")}
            disabled={loading !== null}
            className="bg-red-50 text-red-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {loading === "cancelled" ? t("cancelling", lang) : t("cancelBooking", lang)}
          </button>
        )}
      </div>
    </div>
  );
}
