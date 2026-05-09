"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export default function RefreshButton({ label }: { label: string }) {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  function handleRefresh() {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 1000);
  }

  return (
    <button
      onClick={handleRefresh}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
    >
      <RefreshCw size={14} className={spinning ? "animate-spin" : ""} />
      {label}
    </button>
  );
}
