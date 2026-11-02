import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Lora({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Media naranja | ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi",
  description:
    "Ngôi nhà nhỏ của Celine Wang - Nơi lưu giữ những mẩu truyện dịu dàng, bản dịch và tản văn tràn ngập sắc cam ấm áp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen flex flex-col font-sans selection:bg-orange-200/50 selection:text-orange-950 dark:selection:bg-orange-900/40 dark:selection:text-orange-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
