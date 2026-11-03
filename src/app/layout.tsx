import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BgmFloatingButton } from "@/components/media/bgm-floating-button";
import { BgmProvider } from "@/components/media/bgm-context";
import { BgmModal } from "@/components/media/bgm-modal";

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/cropped-cropped-cropped-medianaranja.webp", type: "image/webp" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <head>
        <link rel="icon" type="image/webp" href="/cropped-cropped-cropped-medianaranja.webp?v=4" />
        <link rel="shortcut icon" href="/favicon.ico?v=4" />
        <link rel="apple-touch-icon" href="/cropped-cropped-cropped-medianaranja.webp?v=4" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-[#F4DFAD] selection:text-[#2B2623] bg-[#FAF5EE] dark:bg-[#1A1614] text-[#2B2623] dark:text-[#FAF5EE]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <BgmProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BgmFloatingButton />
            <BgmModal />
          </BgmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
