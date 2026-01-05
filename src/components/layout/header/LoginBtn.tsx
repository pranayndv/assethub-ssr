"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LoginBtn() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <Link
      href="/login"
      className="
        px-5 py-2 rounded-md
        text-white text-sm font-medium
        bg-black border-2 border-gray-300
        hover:opacity-90 transition-all shadow-md
      "
    >
      Login
    </Link>
  );
}
