import type { GddBlock } from "@/db/schema";

const KIND_LABEL: Record<string, string> = {
  paragraph: "Rédaction",
  spec: "Spécification",
  list: "Exigences",
  formula: "Modèle mathématique",
  table: "Table de référence",
  callout: "Point d'attention",
};

export function BlockList({ blocks }: { blocks: GddBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block) => (
        <BlockCard key={block.id} block={block} />
      ))}
    </div>
  );
}

export function BlockCard({ block }: { block: GddBlock }) {
  const accent =
    block.kind === "formula"
      ? "text-igm-amber"
      : block.kind === "callout"
        ? "text-igm-rose"
        : block.kind === "spec"
          ? "text-igm-neon"
          : "text-igm-acid";

  return (
    <section className="panel p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className={`mono text-[10px] uppercase tracking-[0.18em] ${accent}`}>
          {KIND_LABEL[block.kind] ?? block.kind}
        </span>
        <span className="h-px flex-1 bg-igm-line" />
        <span className="mono text-[10px] text-igm-muted/60">
          {block.kind === "formula" ? "ALGO" : block.kind === "spec" ? "SPEC" : "DOC"}
        </span>
      </div>

      <h3 className="text-[15px] font-bold leading-snug text-igm-ink">{block.title}</h3>

      {block.body ? (
        <p
          className={`mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-igm-muted ${
            block.kind === "formula" ? "mono rounded-lg border border-igm-line bg-igm-void/70 p-4 text-[12px] text-igm-amber/90" : ""
          }`}
        >
          {block.body}
        </p>
      ) : null}

      {block.items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed text-igm-muted">
              <span className="mono mt-0.5 shrink-0 text-[11px] text-igm-neon/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {block.meta.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-igm-line">
          <table className="w-full border-collapse text-left text-[13px]">
            <tbody>
              {block.meta.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-igm-void/40" : "bg-igm-void/10"}
                >
                  <th className="w-[38%] px-3 py-2 align-top font-semibold text-igm-ink/90">
                    {row.label}
                  </th>
                  <td className="px-3 py-2 align-top text-igm-muted">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      <p className="mono text-[11px] uppercase tracking-[0.28em] text-igm-acid">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-igm-ink md:text-[32px]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-4xl text-[14px] leading-relaxed text-igm-muted">{description}</p>
      ) : null}
    </header>
  );
}

export function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="panel-flat p-4">
      <p className="mono text-[10px] uppercase tracking-[0.16em] text-igm-muted">{label}</p>
      <p className="mono mt-2 text-2xl font-bold text-igm-ink">{value}</p>
      {hint ? <p className="mt-1 text-[11px] leading-snug text-igm-muted/80">{hint}</p> : null}
    </div>
  );
}
