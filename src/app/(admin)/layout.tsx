import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
};

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
