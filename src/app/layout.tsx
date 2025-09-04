import type { Metadata } from "next";
import { Inter, Playfair_Display, Kalam } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const kalam = Kalam({ 
  subsets: ["latin"],
  variable: "--font-kalam",
  display: "swap",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Dear Child - Memory Time Vault",
  description: "A digital time capsule for precious childhood memories",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${kalam.variable}`}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
