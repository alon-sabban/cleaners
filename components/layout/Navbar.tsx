import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          CleanMatch
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/cleaners" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            מצא מנקים
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                לוח הבקרה
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  התנתק
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                התחבר
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                התחל עכשיו
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
