export type ReportKind = 'weekly' | 'monthly' | 'annual';
export type Confrontation = 'green' | 'yellow' | 'orange' | 'red' | null;
export type Report = { id: string; body: string; title: string; kind: ReportKind; slug: string; intensity: number | null; confrontation: Confrontation };

const paths: Record<ReportKind, string> = { weekly: 'tygodniowe', monthly: 'miesieczne', annual: 'roczne' };
const emoji: Record<Exclude<Confrontation, null>, string> = { green: '🟢', yellow: '🟡', orange: '🟠', red: '🔴' };
const files = import.meta.glob('../../content/reports/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

function metadata(body: string) {
  const overall = body.match(/^\| Hybrydowe (?:– ogółem|\(przekrojowo\)) \|\s*([^|]+?)\s*\|/m)?.[1] ?? '';
  const intensity = overall.match(/\b(10|[0-9])\s*\/\s*10\b/)?.[1];
  const signal = body.match(/Bezpośrednia konfrontacja Rosja–NATO:[^\n]*(🟢|🟡|🟠|🔴)/)?.[1];
  return { intensity: intensity ? Number(intensity) : null, confrontation: ({ '🟢': 'green', '🟡': 'yellow', '🟠': 'orange', '🔴': 'red' } as Record<string, Confrontation>)[signal ?? ''] ?? null };
}

const reports = Object.entries(files).map(([file, body]) => {
  const id = file.replace(/^.*content\/reports\//, '').replace(/\.md$/, '');
  const kind = id.split('/')[1];
  return { id, body, title: body.match(/^#\s+(.+)$/m)?.[1] ?? file, kind: kind as ReportKind, slug: id.split('/').at(-1)!.toLowerCase(), ...metadata(body) };
});

export const reportUrl = (report: Report) => `/raporty/zagrozenia-hybrydowe/${paths[report.kind]}/${report.slug}`;
export const reportsByKind = (kind?: ReportKind) => reports.filter((report) => ['weekly', 'monthly', 'annual'].includes(report.kind)).filter((report) => !kind || report.kind === kind).sort((a, b) => b.id.localeCompare(a.id));
export const findReport = (kind: ReportKind, slug: string) => reports.find((report) => report.kind === kind && report.slug === slug.toLowerCase());
export const methodology = () => reports.find((report) => report.id === 'zagrozenia-hybrydowe/metodologia');
export const chartPoint = (report: Report) => ({ period: report.slug, href: reportUrl(report), intensity: report.intensity, threat: report.confrontation ? ({ green: 1, yellow: 2, orange: 3, red: 4 } as const)[report.confrontation] : null });
export const confrontationEmoji = (value: Confrontation) => value ? emoji[value] : 'n/d';
export const kindLabel: Record<ReportKind, string> = { weekly: 'Tygodniowe', monthly: 'Miesięczne', annual: 'Roczne' };
