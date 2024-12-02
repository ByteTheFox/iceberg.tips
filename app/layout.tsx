import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Inter } from "next/font/google";
import { HeaderWrapper } from "@/components/header-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Iceberg",
  description: "Know where your tips go",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="w-full min-h-screen bg-background flex flex-col">
          <HeaderWrapper />
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
