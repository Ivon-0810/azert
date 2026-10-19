import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "IGM Manager — Document de Conception & Architecture",
  description:
    "GDD exhaustif et architecture technique d'IGM Manager, simulateur de gestion de football ultra-réaliste : moteur de match 60 FPS, base de données graphe 500 000+ entités, scouting, vestiaire, Data Hub, pipeline CI/CD Windows .exe.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-[1500px] px-5 py-8 lg:px-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
