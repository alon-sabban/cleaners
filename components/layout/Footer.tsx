import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="font-bold text-blue-600">CleanMatch</p>
          <p className="text-sm text-gray-500">Community-trusted cleaning services</p>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="/cleaners" className="hover:text-gray-900">Find Cleaners</Link>
          <Link href="/register?role=cleaner" className="hover:text-gray-900">Become a Cleaner</Link>
          <Link href="/login" className="hover:text-gray-900">Sign In</Link>
        </div>
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} CleanMatch</p>
      </div>
    </footer>
  );
}
