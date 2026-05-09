import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="font-bold text-blue-600">CleanLy</p>
          <p className="text-sm text-gray-500">שירותי ניקיון מהימנים על ידי הקהילה</p>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="/cleaners" className="hover:text-gray-900">מצא מנקים</Link>
          <Link href="/register?role=cleaner" className="hover:text-gray-900">הפוך למנקה</Link>
          <Link href="/login" className="hover:text-gray-900">התחבר</Link>
        </div>
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} CleanLy</p>
      </div>
    </footer>
  );
}
