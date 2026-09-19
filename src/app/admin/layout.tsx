import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

// The root layout locks the body height for the app shells; the admin scrolls on its own.
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>;
}
