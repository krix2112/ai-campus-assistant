import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus FAQ Assistant",
  description: "AI-powered production-grade FAQ and campus guidance assistant for college students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
