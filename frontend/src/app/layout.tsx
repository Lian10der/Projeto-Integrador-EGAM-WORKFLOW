import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instituto Genésio Antônio Mendes",
  description: "Sistema de gestão de projetos sociais do IGAM.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`}>
      <body style={{ margin: 0, background: '#0d1117', color: '#f0f6fc' }}>
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}