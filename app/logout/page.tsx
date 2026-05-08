"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  useEffect(() => {
    createClient()
      .auth.signOut()
      .finally(() => {
        window.location.href = "/";
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">מתנתק...</p>
    </div>
  );
}
