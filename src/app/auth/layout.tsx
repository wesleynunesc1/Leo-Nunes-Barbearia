import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticação",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
