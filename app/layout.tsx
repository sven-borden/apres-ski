import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { UserProvider } from "@/components/providers/UserProvider";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AppShell } from "@/components/layout/AppShell";

const msClarity = process.env.NEXT_PUBLIC_MS_CLARITY_PROJECT_ID;

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
    <html lang="fr" suppressHydrationWarning>
      <head>
        {msClarity && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${msClarity}");`}
          </Script>
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        <LocaleProvider>
          <UserProvider>
            <AppShell>{children}</AppShell>
          </UserProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
