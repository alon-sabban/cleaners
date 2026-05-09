"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variant = "green" | "red" | "blue" | "amber";

const CLASSES: Record<Variant, string> = {
  green: "bg-green-600 text-white hover:bg-green-700",
  red: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  blue: "bg-teal-600 text-white hover:bg-teal-700",
  amber: "bg-amber-500 text-white hover:bg-amber-600",
};

interface Props {
  bookingId: string;
  newStatus: string;
  label: string;
  loadingLabel: string;
  variant: Variant;
}

export default function QuickStatusButton({ bookingId, newStatus, label, loadingLabel, variant }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${CLASSES[variant]}`}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
