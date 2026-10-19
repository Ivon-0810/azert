"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV: { group: string; items: { href: string; label: string; code?: string; icon: string }[] }[] = [
  {
    group: "Pilotage",
    items: [
      { href: "/", label: "Vision & synthèse", icon: "◆" },
      { href: "/gdd", label: "Document de conception", code: "GDD", icon: "▤" },
      { href: "/data", label: "Data model & graphe", code: "DB-03", icon: "⬡" },
      { href: "/pipeline", label: "Build .exe & CI/CD", code: "CI-13", icon: "⣿" },
    ],
  },
  {
    group: "Laboratoire",
    items: [
      { href: "/engine", label: "Match Engine — prototype", code: "ME-02", icon: "▶" },
      { href: "/squads", label: "Effectifs & newgens", code: "FO-08", icon: "☰" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 rounded-md border border-igm-line bg-igm-panel px-3 py-2 text-xs font-semibold uppercase tracking-widest text-igm-muted lg:hidden"
      >
        {open ? "Fermer" : "IGM"}
      </button>

      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-y-auto border-r border-igm-line bg-igm-abyss/95 backdrop-blur transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}
      >
        <div className="border-b border-igm-line px-6 py-7 pt-16 lg:pt-7">
          <Link href="/" className="block">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-igm-neon to-igm-acid text-sm font-black text-igm-void">
                IG
              </span>
              <span className="text-lg font-black leading-none tracking-tight">
                IGM<span className="text-igm-acid">MANAGER</span>
              </span>
            </div>
            <p className="mono mt-2 text-[10px] uppercase tracking-[0.2em] text-igm-muted">
              GDD · Architecture · Prototype
            </p>
          </Link>
        </div>

        <nav className="px-4 py-5">
          {NAV.map((group) => (
            <div key={group.group} className="mb-6">
              <p className="mono mb-2 px-2 text-[10px] uppercase tracking-[0.22em] text-igm-muted/70">
                {group.group}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                          active
                            ? "bg-igm-panel2 text-igm-ink shadow-[inset_2px_0_0_0_var(--color-igm-acid)]"
                            : "text-igm-muted hover:bg-igm-panel/60 hover:text-igm-ink"
                        }`}
                      >
                        <span className="mono w-4 text-center text-xs text-igm-neon/80">
                          {item.icon}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                        {item.code ? (
                          <span className="mono text-[10px] text-igm-muted/70">{item.code}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mx-4 mb-6 rounded-lg border border-igm-line/70 bg-igm-panel/50 p-4">
          <p className="mono text-[10px] uppercase tracking-[0.18em] text-igm-muted">
            Version du document
          </p>
          <p className="mono mt-1 text-sm text-igm-acid">v1.4 · 14 chapitres · 78 blocs</p>
          <p className="mt-3 text-[11px] leading-relaxed text-igm-muted">
            Moteur slice v0.4 déterministe. Statut : préproduction terminée, vertical slice en
            cours.
          </p>
        </div>
      </aside>
    </>
  );
}
