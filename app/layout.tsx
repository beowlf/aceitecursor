import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/contexts/SidebarContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ElaboraCRM - Sistema de Gestão de Trabalhos Acadêmicos",
  description: "Sistema SaaS para gerenciamento de trabalhos acadêmicos",
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
    <html lang="pt-BR">
      <body className={inter.className}>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}






