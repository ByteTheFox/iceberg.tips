import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import SupabaseProvider from "@/components/providers/supabase-provider";
import { QueryParamCleaner } from "@/components/providers/query-param-cleaner";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "white",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Iceberg",
  description: "Find and report businesses tip practices",
  metadataBase: new URL("https://iceberg.tips"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SupabaseProvider session={session}>
          <QueryParamCleaner />
          {children}
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
