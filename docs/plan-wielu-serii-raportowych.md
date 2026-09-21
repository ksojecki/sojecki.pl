# Plan implementacyjny — wiele serii raportowych na Sojecki.pl

Status: plan do realizacji  
Data: 2026-09-21  
Repozytorium aplikacji: `ksojecki/sojecki.pl`  
Zaplecze redakcyjne: `ksojecki/knowledge_base`

## 1. Cel i zakres

Umożliwić dodawanie nowych tematów raportowych przez konfigurację i zatwierdzone pliki Markdown, bez modyfikacji kodu Astro dla każdej kolejnej serii. Zachować jedną aplikację statyczną Astro + TypeScript i obecny deployment Render Static Site. Nie dodawać backendu, bazy danych, SSR, dodatkowej usługi, monorepo ani GitHub Actions.

Kluczowe wymagania:
- istniejące URL-e, treści, wykresy, metodologia i skale monitoringu zagrożeń hybrydowych pozostają bez zmian;
- serie nie muszą mieć wszystkich okresów (weekly/monthly/annual), metodologii ani wskaźników;
- zwykły raport nie dziedziczy skali konfrontacji Rosja–NATO ani intensywności 0–10;
- publiczne repo zawiera tylko zatwierdzone treści; `knowledge_base` pozostaje prywatnym zapleczem redakcyjnym;
- każdy etap kończy się działającym buildem, testem regresji i małym, odwracalnym commitem.

## 2. Stan zastany i miejsca zmian

Na dzień sporządzenia planu:
- `src/lib/reports.ts` ładuje pliki przez `import.meta.glob('../../content/reports/**/*.md', ...)`, ale `reportUrl`, `findReport`, `reportsByKind` i `methodology` są związane z jedną serią; parser wskaźników jest wyspecjalizowany;
- `src/pages/raporty/index.astro` zawiera pojedynczą kartę serii na stałe;
- trasy są umieszczone pod `src/pages/raporty/zagrozenia-hybrydowe/`;
- `src/components/SeriesCharts.astro` i `ConfrontationChip.astro` są specyficzne dla monitoringu;
- `content/reports/zagrozenia-hybrydowe/{weekly,monthly,annual}/` zawiera publiczne dokumenty i `metodologia.md`;
- `npm run verify` wykonuje Astro check, build i testy wynikowego `dist/`; Render używa `npm ci && npm run verify`.

Przed kodowaniem sprawdzić aktualną gałąź i stan repozytoriów, w tym faktyczne źródło i działający skrypt publikacji po stronie `knowledge_base`. Nie opierać synchronizacji na zgadywanej ścieżce.

## 3. Docelowy model plików

```text
content/reports/
├── zagrozenia-hybrydowe/
│   ├── config.json
│   ├── metodologia.md
│   ├── weekly/
│   ├── monthly/
│   └── annual/
└── nowy-temat/
    ├── config.json
    ├── metodologia.md        # opcjonalna
    ├── weekly/
    └── monthly/
```

Przykładowa konfiguracja:

```json
{
  "id": "nowy-temat",
  "title": "Nowy temat",
  "description": "Opis serii raportowej.",
  "periods": ["weekly", "monthly"],
  "methodology": "metodologia.md",
  "presentation": "standard"
}
```

`methodology` może być pominięta; nie tworzyć pustej strony metodologii. `presentation` dopuszcza początkowo `standard` i `hybrid-threats`. Konfiguracja identyfikuje **znany wariant prezentacji**, nie pozwala wykonywać dowolnego kodu ani podawać dynamicznych nazw komponentów. Nie deklarować ogólnego systemu wykresów, dopóki nie ma drugiego rzeczywistego przypadku użycia.

Walidować na etapie builda: unikalny identyfikator/slug, zgodność `id` z nazwą katalogu, niepusty tytuł, dozwolone typy okresów, bezpieczne nazwy ścieżek, istniejącą opcjonalną metodologię, brak kolizji URL i raportów, zgodność zawartości katalogów z deklarowanymi okresami. Nie skanować prywatnego repo podczas publicznego builda.

## 4. Implementacja etapami

### Etap 0 — inwentaryzacja i punkt odniesienia

- Zanotować obecne publiczne URL-e i liczbę raportów każdego okresu, przykładowe dane wykresów i wygląd stron.
- Sprawdzić testy w `tests/`, `src/lib/reports.ts`, wszystkie trasy i źródłowy proces publikacji `knowledge_base → sojecki.pl`.
- Uruchomić `npm ci && npm run verify` przed zmianami.
- Ustalić jawne kryteria akceptacji, unikając równoczesnej modyfikacji treści raportów.

**Kryterium:** zielony stan bazowy oraz lista adresów/danych do regresji.

### Etap 1 — model danych i konfiguracja serii

- Dodać typ `ReportSeries` i `seriesId` w `Report`; raport pozostaje modelem treści i okresu, niezależnym od wskaźników konkretnej domeny.
- Rozdzielić ogólne metadane (id, title, kind, slug, body, seriesId) od parsera wskaźników zagrożeń hybrydowych; parser zachować tylko dla tej serii.
- Dodać `config.json` istniejącej serii z prezentacją `hybrid-threats`.
- Uogólnić `reportUrl(report)`, `reportsByKind(seriesId, kind?)`, `findReport(seriesId, kind, slug)` i odczyt metodologii z kontekstu serii; aktualizować wszystkich wywołujących bez zmiany opublikowanych URL-i.
- Zapewnić jednoznaczne sortowanie i filtrowanie **w obrębie serii**, aby nie mieszać raportów identycznych okresów.

**Kryterium:** dotychczasowe raporty, adresy i wskaźniki działają identycznie; testy obejmują izolację serii.

### Etap 2 — uniwersalne trasy Astro

- Zastąpić wyspecjalizowane ścieżki trasami `src/pages/raporty/[series]/index.astro`, `[series]/metodologia.astro`, `[series]/[type]/index.astro`, `[series]/[type]/[slug].astro`.
- `getStaticPaths()` pobiera serie i faktycznie dostępne typy/raporty; nie generować archiwów dla niedeklarowanych/nieobecnych okresów.
- Dla nieznanych parametrów i brakujących raportów zapewnić zachowanie 404 właściwe dla statycznego builda.
- Nie utrzymywać równocześnie statycznych i dynamicznych tras generujących ten sam URL; usunąć stare pliki dopiero po przeniesieniu funkcjonalności i testach.
- Zostawić obecne polskie publiczne URL-e bez zmian.

**Kryterium:** wszystkie zapisane w etapie 0 adresy działają i nie występują kolizje tras.

### Etap 3 — wspólne widoki, zachowane specjalizacje

- Wydzielić wspólną prezentację nagłówka, nawigacji starszy/nowszy, metodologii, archiwum i pojedynczego raportu.
- Przenieść obecną prezentację monitoringu (status, skale, `SeriesCharts`, `ConfrontationChip`) do dedykowanego wariantu, zachowując teksty, dane i wygląd.
- Standardowy wariant wyświetla opis, najnowsze raporty, dostępne archiwa i opcjonalną metodologię, bez domyślnych wskaźników.
- Strona `/raporty` generuje karty na podstawie konfiguracji, zamiast jednej wpisanej na stałe. Nie wyświetlać nieopublikowanych serii.

**Kryterium:** dwa typy prezentacji działają z tym samym modelem i trasami; brak regresji strony monitoringu.

### Etap 4 — publikacja z prywatnego zaplecza

- Najpierw zweryfikować rzeczywisty skrypt, selekcję plików, lokalizacje i uprawnienia aktualnego procesu publikacji w `knowledge_base`.
- Rozszerzyć istniejący proces o jawnie skonfigurowane mapowanie: identyfikator serii, zatwierdzone ścieżki źródłowe, katalog docelowy i ewentualny harmonogram; zachować istniejące schedulery.
- Synchronizować **tylko** zatwierdzone raporty, publiczną metodologię i publiczną konfigurację; wykluczyć `_context/`, research, audyty, drafty, sekrety i pozostałą prywatną zawartość.
- Nie kopiować całego katalogu projektu ani całego `knowledge_base`, nie publikować plików wyłącznie dlatego, że mają rozszerzenie `.md`.
- Publikacja nowej serii ma działać przez zmianę konfiguracji i dodanie zatwierdzonych treści, bez zmian skryptu czy komponentów Astro.
- Render pozostaje wyłącznie odbiorcą publicznego repo; nie potrzebuje uprawnień do prywatnego repo.

**Kryterium:** próba publikacji pliku niezatwierdzonego zostaje zablokowana; zatwierdzony raport nowej serii pojawia się na stronie po standardowym buildzie.

### Etap 5 — próba na drugiej serii i testy

- Dodać minimalną przykładową drugą serię z 1–2 zatwierdzonymi raportami bez skal monitoringu; nie publikować fikcyjnych wydarzeń jako rzeczywistych raportów. Materiały testowe trzymać w fixtures, dopóki nie ma rzeczywistej treści do publikacji.
- Testować: listę serii, każdy typ archiwum, brak rocznego archiwum, opcjonalną metodologię, nawigację w granicach jednej serii, nieznane URL-e, kolizje slugów, niepoprawny config, linki i renderowanie Markdown.
- Porównać liczbę istniejących stron, URL-e, widoczne wartości wskaźników i punkty wykresów z etapem 0.
- Uruchomić `npm ci && npm run verify` i sprawdzić wynik `dist/` pod kątem niezamierzonych prywatnych plików.
- Wdrożyć przez dotychczasowy Render Static Site, bez GitHub Actions; zweryfikować kluczowe publiczne trasy po deployu.

**Kryterium:** druga seria działa bez modyfikacji kodu Astro, a wszystkie dotychczasowe raporty i wykresy pozostają dostępne i niezmienione.

## 5. Zasady wykonania i commity

Realizować etapy po kolei, małymi commitami, np. `refactor: introduce report series model`, `feat: add dynamic report routes`, `refactor: extract shared report views`, `feat: support multiple publication series`, `test: cover multi-series publication`. Nie łączyć migracji treści z refaktoryzacją routingu. Przy zmianie istniejącego źródłowego procesu publikacji aktualizować dokumentację w `knowledge_base` po weryfikacji faktycznej implementacji.

Jeśli środowisko pozwala na subagentów, mechaniczne zadania i testy można delegować lżejszym modelom; główny agent odpowiada za architekturę, granicę publiczne/prywatne i integrację. Nie traktować planu jako zgody na automatyczną publikację materiałów roboczych.

## 6. Definition of Done

- [ ] Dodanie nowego tematu wymaga tylko konfiguracji i zatwierdzonych plików, bez zmian Astro ani skryptu publikacji.
- [ ] Każda seria ma izolowane raporty, nawigację, metodologię i opcjonalne wskaźniki.
- [ ] Wszystkie dotychczasowe URL-e, dane wykresów i format monitoringu działają bez regresji.
- [ ] Publiczna strona nie otrzymuje prywatnych danych z `knowledge_base`.
- [ ] Jedna aplikacja Astro, jeden statyczny build i dotychczasowy Render Static Site.
- [ ] `npm ci && npm run verify` przechodzi; testy obejmują co najmniej dwie serie.
- [ ] README opisuje procedurę dodawania serii i granicę publikacji.
