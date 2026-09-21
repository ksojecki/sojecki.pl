# Plan wykonawczy — migracja publicznej strony do `ksojecki/sojecki.pl`

Status: **plan do realizacji**
Data: 2026-09-21

## 1. Cel

Oddzielić publiczny serwis `sojecki.pl` od prywatnej bazy wiedzy `ksojecki/knowledge_base`.

Docelowo:

- `knowledge_base` pozostaje prywatnym zapleczem: research, drafty, audyty, projekty, kontekst AI;
- `ksojecki/sojecki.pl` jest publicznym repozytorium jednej aplikacji Astro;
- Render.com publikuje wyłącznie repo `sojecki.pl`;
- blog, projekty, profil developera i raporty są sekcjami jednego serwisu;
- raporty pozostają osobnym typem treści, a nie wpisami blogowymi.

Nie tworzyć na tym etapie osobnego repo dla raportów ani pełnego monorepo z `apps/` i `packages/`, dopóki nie pojawi się druga niezależna aplikacja.

---

## 2. Docelowa architektura

### Prywatne repo

```text
ksojecki/knowledge_base
├── _context/
├── 10 Projects/
├── 20 Areas/
├── 30 Reference/
├── research / audyty / drafty
└── zaplecze redakcyjne raportów
```

### Publiczne repo

```text
ksojecki/sojecki.pl
├── src/
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   └── styles/
├── content/
│   ├── blog/
│   ├── projects/
│   └── reports/
│       └── zagrozenia-hybrydowe/
│           ├── weekly/
│           ├── monthly/
│           └── annual/
├── scripts/
├── tests/
├── public/
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── render.yaml
└── README.md
```

Nazwy katalogów wewnętrznych mogą pozostać angielskie, jeśli upraszczają kod. Publiczny routing i nawigacja mają być po polsku.

---

## 3. Routing publiczny

Obowiązujące główne ścieżki:

```text
/
/blog
/projekty
/raporty
```

Raporty:

```text
/raporty/zagrozenia-hybrydowe
/raporty/zagrozenia-hybrydowe/metodologia
/raporty/zagrozenia-hybrydowe/tygodniowe
/raporty/zagrozenia-hybrydowe/miesieczne
/raporty/zagrozenia-hybrydowe/roczne
```

Przykładowe dokumenty:

```text
/raporty/zagrozenia-hybrydowe/tygodniowe/2026-09-w03
/raporty/zagrozenia-hybrydowe/miesieczne/2026-08
/raporty/zagrozenia-hybrydowe/roczne/2025
```

Nie używać jako docelowych URL-i:

```text
/projects
/reports
/hybrid-threats
/weekly
/monthly
/annual
```

Jeżeli istnieją publiczne stare adresy, dodać przekierowania 301 do nowych polskich ścieżek.

---

## 4. Zasady realizacji

### 4.1. Małe i odwracalne etapy

Nie wykonywać migracji jako jednego dużego commita.

Każdy etap powinien:
- mieć jasno określony zakres;
- kończyć się działającym buildem;
- mieć własny test lub kontrolę;
- być możliwy do cofnięcia bez wpływu na resztę migracji.

### 4.2. Jedno źródło prawdy

Po zakończeniu migracji:
- publiczne raporty mają mieć jedno kanoniczne miejsce;
- nie utrzymywać dwóch niezależnych kopii, które mogą się rozjechać;
- `knowledge_base` ma zawierać zaplecze redakcyjne i prywatne materiały;
- `sojecki.pl` ma zawierać to, co jest publicznie publikowane.

### 4.3. Bezpieczeństwo

Nigdy nie kopiować całych katalogów z `knowledge_base` bez jawnej listy plików.

Do publicznego repo nie mogą trafić:
- `_context/`;
- prywatne notatki;
- dane rodzinne, finansowe lub zdrowotne;
- audyty przeznaczone wyłącznie do pracy wewnętrznej;
- drafty;
- `.env`;
- sekrety;
- konfiguracje zawierające dane dostępowe;
- niepowiązane projekty i materiały.

### 4.4. Minimalna architektura

Dla obecnej skali projektu:
- jedna aplikacja Astro;
- jeden `package.json`;
- jeden build;
- jeden Render Static Site;
- bez Nx/Turborepo;
- bez backendu;
- bez bazy danych;
- bez SSR, jeśli nie pojawi się rzeczywista potrzeba.

Rozdzielić domeny logicznie w kodzie, ale nie infrastrukturalnie.

---

# 5. Strategia agentów

Obowiązuje również `_context/ai-agent-strategy.md`.

Główny agent odpowiada za:
- architekturę;
- migrację między repozytoriami;
- decyzje bezpieczeństwa;
- granicę publiczne/prywatne;
- integrację zmian;
- review;
- końcowe testy.

Jeśli środowisko wspiera subagentów, prace mechaniczne delegować do lżejszych agentów, np. Luna, jeśli jest dostępna i wystarczająca.

Dobre zadania do delegowania:
- inwentaryzacja plików;
- wyszukiwanie starych URL-i;
- mapa linków i redirectów;
- poprawa importów;
- mechaniczne przenoszenie publicznych plików;
- proste testy;
- lint/typecheck;
- kontrola linków;
- aktualizacja dokumentacji po wykonanej zmianie.

Nie delegować subagentom decyzji dotyczących:
- publikacji danych prywatnych;
- architektury całości;
- zmiany canonical source;
- merytorycznych zmian treści raportów.

Subagent powinien dostawać minimalny potrzebny kontekst.

---

# 6. Etapy realizacji

## Etap 0 — rozpoznanie stanu

### Zadania

Przejrzeć w `knowledge_base`:
- `package.json`;
- `package-lock.json`;
- `astro.config.mjs`;
- `reports.config.json`;
- `src/`;
- `scripts/reports-publication/`;
- `tests/`;
- `.github/workflows/`;
- konfigurację Render;
- publiczne raporty;
- publiczną metodologię;
- README projektu;
- aktualne dokumenty publikacyjne.

Szczególnie sprawdzić:
- `10 Projects/Monitoring zagrożeń hybrydowych Rosji/`;
- `40 Reports/monitoring-zagrozen-hybrydowych-rosji/`.

### Wynik

Krótka mapa:
- co jest aktualnie używane;
- co jest legacy;
- co jest publiczne;
- co pozostaje prywatne;
- co musi zostać przeniesione.

### Kryterium zakończenia

Agent zna faktyczne źródło raportów oraz aktualny pipeline publikacji i nie opiera migracji na archiwalnym planie.

---

## Etap 1 — przygotowanie publicznego repo

### Zadania

Jeśli repo `ksojecki/sojecki.pl` nie istnieje:
- utworzyć je jako publiczne, jeśli narzędzia i uprawnienia na to pozwalają;
- jeśli nie pozwalają, przygotować wszystko, co można wykonać bez tej operacji i wskazać jedną wymaganą czynność ręczną.

W repo:
- utworzyć bazową aplikację Astro + TypeScript;
- zachować istniejące sprawdzone zależności tylko jeśli są potrzebne;
- skonfigurować Node w wersji zgodnej z wybraną wersją Astro;
- dodać `.gitignore`;
- dodać podstawowy README.

### Test

```bash
npm ci
npm run build
```

### Kryterium zakończenia

Czysty checkout nowego repo buduje pustą lub minimalną stronę bez zależności od `knowledge_base`.

---

## Etap 2 — struktura routingu i layout

### Zadania

Przygotować:
- stronę główną `/`;
- `/blog`;
- `/projekty`;
- `/raporty`;
- indeks serii raportowej;
- polski routing raportów.

Na tym etapie używać minimalnej treści, bez migracji wszystkich raportów.

### Zasady

- nie robić dużego redesignu;
- zachować prosty, responsywny layout;
- komponenty współdzielone tworzyć dopiero, gdy pojawia się realne powtórzenie;
- unikać premature abstraction.

### Test

Zweryfikować wszystkie podstawowe trasy oraz 404.

### Kryterium zakończenia

Struktura nawigacji i URL-i jest stabilna przed migracją treści.

---

## Etap 3 — model treści

### Zadania

Zaprojektować content collections lub równoważny prosty model dla:
- bloga;
- projektów;
- raportów tygodniowych;
- raportów miesięcznych;
- raportów rocznych.

Raport powinien mieć minimalny zestaw metadanych potrzebnych do:
- routingu;
- sortowania;
- prezentacji okresu;
- typu raportu.

Nie przenosić do frontmatter danych, które są już jednoznacznie zakodowane w nazwie pliku lub treści, chyba że upraszcza to walidację.

### Kryterium zakończenia

Jeden przykładowy raport każdego typu renderuje się poprawnie przez docelowy mechanizm.

---

## Etap 4 — migracja kodu raportów

### Zadania

Przenieść tylko potrzebne elementy:
- parser/renderowanie Markdown;
- komponenty raportów;
- wykresy;
- style tabel;
- logikę nawigacji;
- potrzebne skrypty.

Usunąć mechanizmy, które były potrzebne wyłącznie dlatego, że publikator działał wewnątrz prywatnego repo, np. jeśli po migracji nie są już potrzebne:
- skomplikowane allowlisty;
- blokady `_context`;
- kopiowanie do `src/generated`;
- manifest oddzielający publiczne od prywatnego w tym samym repo.

### Kryterium zakończenia

Raporty działają natywnie w publicznym repo, bez runtime/build-time dependency na prywatne repo.

---

## Etap 5 — migracja publicznych raportów

### Zadania

Przenieść jawnie publiczne:
- tygodniowe;
- miesięczne;
- roczne;
- publiczną metodologię.

Nie zmieniać treści merytorycznej podczas migracji, poza:
- poprawą ścieżek;
- dostosowaniem frontmatter;
- naprawą linków wewnętrznych;
- zmianami technicznymi koniecznymi do renderowania.

Nie przenosić:
- audytów;
- draftów;
- roboczych trendów;
- instrukcji agentów;
- materiałów pomocniczych.

### Test

Sprawdzić reprezentatywne:
- 1 raport tygodniowy;
- 1 miesięczny;
- 1 roczny;
- metodologię;
- linki zewnętrzne;
- tabele;
- polskie znaki;
- wykresy.

### Kryterium zakończenia

Cały publiczny zestaw raportów buduje się z nowego repo.

---

## Etap 6 — redirecty i kompatybilność

### Zadania

Jeśli poprzednia wersja serwisu używała angielskich URL-i, przygotować przekierowania:
- `/reports/*` → `/raporty/*`;
- `/projects/*` → `/projekty/*`;
- pozostałe stare ścieżki → odpowiadające nowe.

Sprawdzić sposób konfiguracji redirectów aktualnie obsługiwany przez Render Static Site.

### Kryterium zakończenia

Stare publiczne linki nie prowadzą do 404, jeśli da się jednoznacznie ustalić ich nowy odpowiednik.

---

## Etap 7 — Render.com

### Docelowy model

```text
GitHub: ksojecki/sojecki.pl
        ↓
npm ci
npm run build
        ↓
dist/
        ↓
Render Static Site
        ↓
https://sojecki.pl
```

### Zadania

Przygotować:
- `render.yaml`, jeśli upraszcza i stabilizuje konfigurację;
- build command;
- publish path;
- wersję Node;
- ewentualne redirecty.

Nie tworzyć:
- Web Service;
- stale działającego Node;
- backendu;
- bazy.

### Kryterium zakończenia

Konfiguracja deploymentu nie wymaga dostępu Render do `knowledge_base`.

---

## Etap 8 — CI

Minimalny pipeline:

```bash
npm ci
npm test
npm run build
```

Jeśli projekt korzysta z odpowiednich narzędzi, dodać:
- `astro check`;
- typecheck;
- test routingu;
- podstawową walidację linków;
- kontrolę, czy do repo/dist nie trafiły niedozwolone prywatne nazwy/katalogi.

Nie tworzyć ciężkiego pipeline'u dla małego statycznego serwisu.

### Kryterium zakończenia

PR nie może zostać uznany za gotowy, jeśli build lub podstawowe testy nie przechodzą.

---

## Etap 9 — cleanup prywatnego repo

Wykonać dopiero po działającym nowym buildzie i weryfikacji treści.

### Usunąć lub przenieść z roota `knowledge_base`

Tylko elementy należące wyłącznie do publicznej strony, np.:
- Astro config;
- frontendowe `src/`;
- zależności publikacyjne;
- skrypty deploymentu;
- Render config;
- publiczne workflow CI.

### Pozostawić

- metodologia robocza;
- audyty;
- research;
- template raportu;
- instrukcje agentowe;
- materiały pomocnicze;
- projekt monitoringu.

### Dokumentacja

Zaktualizować README projektu:

```text
research / draft / audit:
ksojecki/knowledge_base

publiczna strona i opublikowane raporty:
ksojecki/sojecki.pl
```

### Kryterium zakończenia

`knowledge_base` nie zawiera już infrastruktury potrzebnej wyłącznie do hostowania publicznej strony.

---

## Etap 10 — finalna walidacja

W świeżym checkout nowego repo:

```bash
npm ci
npm test
npm run build
```

Sprawdzić co najmniej:

### Strony

- `/`;
- `/blog`;
- `/projekty`;
- `/raporty`;
- `/raporty/zagrozenia-hybrydowe`;
- metodologię;
- raport tygodniowy;
- raport miesięczny;
- raport roczny;
- 404.

### Jakość

- brak broken imports;
- brak zależności od lokalnych ścieżek `knowledge_base`;
- brak prywatnych danych;
- responsywne tabele;
- poprawne polskie znaki;
- działające linki źródłowe;
- działające wykresy;
- poprawne redirecty.

---

# 7. Zalecana strategia commitów

Przykład:

```text
chore: initialize public Astro site
feat: add Polish site routing
feat: add report content model
refactor: migrate report rendering
content: migrate public hybrid threat reports
feat: add legacy route redirects
ci: add build and validation workflow
chore: configure Render static deployment
docs: document public site architecture
chore: remove publication frontend from knowledge_base
```

Unikać mieszania migracji treści z dużymi zmianami wizualnymi.

---

# 8. Definition of Done

Migrację uznajemy za zakończoną dopiero, gdy:

- [ ] `ksojecki/sojecki.pl` istnieje jako publiczne repo;
- [ ] jedna aplikacja Astro buduje cały serwis;
- [ ] publiczne URL-e są po polsku;
- [ ] blog, projekty i raporty mają osobne sekcje;
- [ ] raporty tygodniowe, miesięczne i roczne są dostępne;
- [ ] metodologia jest publiczna;
- [ ] publiczny build nie zależy od `knowledge_base`;
- [ ] Render korzysta tylko z `sojecki.pl`;
- [ ] CI przechodzi na świeżym checkout;
- [ ] stare publiczne URL-e mają redirecty, jeśli były używane;
- [ ] nie ma prywatnych danych w repo ani `dist/`;
- [ ] `knowledge_base` zostało oczyszczone z kodu służącego wyłącznie publikacji;
- [ ] README obu stron jasno opisują odpowiedzialność repozytoriów;
- [ ] końcowy raport agenta opisuje wykonane zmiany, testy, pozostałe ryzyka i ewentualne czynności ręczne.

---

# 9. Reguły autonomii agenta

Agent ma realizować etapy kolejno i autonomicznie.

Nie zatrzymywać się po analizie ani przygotowaniu planu.

Samodzielnie podejmować decyzje, jeśli:
- są odwracalne;
- wynikają z istniejącej architektury;
- nie zwiększają ryzyka publikacji prywatnych danych;
- nie zmieniają merytorycznej treści raportów.

Zatrzymać się tylko wtedy, gdy:
1. potrzebna jest operacja kontowa lub DNS niedostępna przez narzędzia;
2. istnieje realne ryzyko ujawnienia prywatnych danych;
3. wymagana byłaby merytoryczna zmiana raportu bez podstaw;
4. pojawia się nieodwracalna decyzja, której nie można wywnioskować z repo.

W każdej innej sytuacji wykonać najlepszy rozsądny wariant, przetestować go i kontynuować.
