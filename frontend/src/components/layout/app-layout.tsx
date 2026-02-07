"use client";

import { Header } from "./header";

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail: string;
}

export function AppLayout({ children, userEmail }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header userEmail={userEmail} />
      <main className="mx-auto w-full max-w-[960px] flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
