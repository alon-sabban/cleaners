"use client";

export default function SignOutButton() {
  return (
    <a
      href="/api/logout"
      className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
    >
      התנתק
    </a>
  );
}
