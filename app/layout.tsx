import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/providers/UserProvider";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export const metadata: Metadata = {
  title: "Apres-Ski",
  description:
    "Collaborative ski trip planner — meals, attendance, and chalet info in one place.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Apres-Ski",
  },
  openGraph: {
    title: "Apres-Ski",
    description:
      "Collaborative ski trip planner — meals, attendance, and chalet info in one place.",
    type: "website",
    siteName: "Apres-Ski",
  },
  twitter: {
    card: "summary",
    title: "Apres-Ski",
    description:
      "Collaborative ski trip planner — meals, attendance, and chalet info in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <UserProvider>
          <AppShell>{children}</AppShell>
        </UserProvider>
      </body>
    </html>
  );
}
