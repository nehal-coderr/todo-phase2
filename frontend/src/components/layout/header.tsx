"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userEmail: string;
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-gray-900 transition-colors hover:text-primary-600"
        >
          TaskFlow
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 md:inline truncate max-w-[200px]">
            {userEmail}
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Sign out"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
