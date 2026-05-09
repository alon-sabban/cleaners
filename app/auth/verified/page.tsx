import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle } from "lucide-react";

export default async function VerifiedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const isError = params.error === "true";

  let role = "client";
  if (!isError) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? "client";
    }
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">הקישור אינו תקין</h1>
          <p className="text-gray-500 mb-8">
            הקישור לאימות פג תוקף או אינו תקין. נסה להירשם מחדש.
          </p>
          <Link
            href="/register"
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block"
          >
            חזור להרשמה
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="text-green-500" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">האימייל אושר!</h1>
        <p className="text-gray-500 mb-8">
          {role === "cleaner"
            ? "ברוך הבא לקלינלי! כדי להופיע בחיפוש, השלם את פרטי הפרופיל שלך."
            : "ברוך הבא לקלינלי! אתה מוכן להתחיל."}
        </p>
        {role === "cleaner" ? (
          <Link
            href="/dashboard/cleaner/setup"
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block"
          >
            השלם את הפרופיל שלך
          </Link>
        ) : (
          <Link
            href="/cleaners"
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block"
          >
            מצא מנקה
          </Link>
        )}
      </div>
    </div>
  );
}
