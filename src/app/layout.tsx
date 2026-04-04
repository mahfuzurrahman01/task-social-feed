import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Buddy Script",
  description: "Connect with friends and share your moments",
  icons: {
    icon: "/assets/images/logo-copy.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/common.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <link rel="stylesheet" href="/assets/css/responsive.css" />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <script src="/assets/js/bootstrap.bundle.min.js" async />
      </body>
    </html>
  );
}
