"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingStatus } from "@/types";

interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
  isCleaner: boolean;
}

export default function BookingActions({ bookingId, status, isCleaner }: BookingActionsProps) {
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
      setError(data.error ?? "שגיאה בעדכון הסטטוס");
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold mb-4">פעולות</h2>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Cleaner actions */}
        {isCleaner && status === "pending" && (
          <>
            <button
              onClick={() => updateStatus("confirmed")}
              disabled={loading !== null}
              className="bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading === "confirmed" ? "מאשר..." : "אשר הזמנה"}
            </button>
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={loading !== null}
              className="bg-red-50 text-red-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {loading === "cancelled" ? "דוחה..." : "דחה הזמנה"}
            </button>
          </>
        )}

        {isCleaner && status === "confirmed" && (
          <button
            onClick={() => updateStatus("in_progress")}
            disabled={loading !== null}
            className="bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading === "in_progress" ? "מעדכן..." : "סמן כבתהליך"}
          </button>
        )}

        {isCleaner && status === "in_progress" && (
          <button
            onClick={() => updateStatus("completed")}
            disabled={loading !== null}
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading === "completed" ? "מסיים..." : "סמן כהושלם"}
          </button>
        )}

        {/* Client actions */}
        {!isCleaner && (status === "pending" || status === "confirmed") && (
          <button
            onClick={() => updateStatus("cancelled")}
            disabled={loading !== null}
            className="bg-red-50 text-red-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {loading === "cancelled" ? "מבטל..." : "בטל הזמנה"}
          </button>
        )}
      </div>
    </div>
  );
}
