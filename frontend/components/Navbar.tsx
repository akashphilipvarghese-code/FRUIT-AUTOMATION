"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isCustomer = pathname === "/";
  const isIndustrialist = pathname === "/industrialist";
  const isAdmin = pathname === "/admin";
  const isClearScan = pathname === "/clearscan";

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-green-400">
            🍎 FruityVision AI
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">View as:</span>
            <div className="flex gap-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isCustomer ? "bg-green-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                }`}
              >
                Customer
              </Link>
              <Link
                href="/industrialist"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isIndustrialist ? "bg-green-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                }`}
              >
                Industrialist
              </Link>
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isAdmin ? "bg-green-500 text-white" : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                }`}
              >
                Admin
              </Link>
              <Link
                href="/clearscan"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isClearScan ? "bg-[#FF8C00] text-black" : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                }`}
              >
                ClearScan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
