import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Categorias | Astra Gaming",
  description: "Gerencie as categorias da Astra Gaming.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
