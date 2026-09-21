export type ReportKind = 'weekly' | 'monthly' | 'annual';
export type Confrontation = 'stable' | 'tension' | 'preparations' | 'attack';
export type Report = { id: string; body: string; title: string; kind: ReportKind; slug: string; intensity: number | null; confrontation: Confrontation | null };

const paths: Record<ReportKind, string> = { weekly: 'tygodniowe', monthly: 'miesieczne', annual: 'roczne' };
export const confrontation: Record<Confrontation, { score: number; label: string; className: string }> = {
  stable: { score: 1, label: 'Stabilnie', className: 'stable' },
  tension: { score: 2, label: 'Napięcie', className: 'tension' },
  preparations: { score: 3, label: 'Przygotowania', className: 'preparations' },
  attack: { score: 4, label: 'Atak', className: 'attack' },
};
const emojiToConfrontation: Record<string, Confrontation> = { '🟢': 'stable', '🟡': 'tension', '🟠': 'preparations', '🔴': 'attack' };
const files = import.meta.glob('../../content/reports/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

function metadata(body: string) {
  const overall = body.match(/^\| Hybrydowe (?:– ogółem|\(przekrojowo\)) \|\s*([^|]+?)\s*\|/m)?.[1] ?? '';
  const intensity = overall.match(/\b(10|[0-9])\s*\/\s*10\b/)?.[1];
  const signal = body.match(/Bezpośrednia konfrontacja Rosja–NATO:[^\n]*?(🟢|🟡|🟠|🔴)/)?.[1];
  return { intensity: intensity ? Number(intensity) : null, confrontation: emojiToConfrontation[signal ?? ''] ?? null };
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
export const chartPoint = (report: Report) => ({ period: report.slug, href: reportUrl(report), intensity: report.intensity, threat: report.confrontation ? confrontation[report.confrontation].score : null });
export const kindLabel: Record<ReportKind, string> = { weekly: 'Tygodniowe', monthly: 'Miesięczne', annual: 'Roczne' };
