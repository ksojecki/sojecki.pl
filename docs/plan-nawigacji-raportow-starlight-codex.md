# Plan wykonania dla Codex — chronologiczne drzewo raportów w sojecki.pl

> Plan implementacyjny należy do repozytorium aplikacji `ksojecki/sojecki.pl`. Kanoniczne dane, metodologia i reguły procesu pozostają w prywatnym [knowledge_base — projekt Monitoring zagrożeń hybrydowych Rosji](https://github.com/ksojecki/knowledge_base/tree/main/10%20Projects/Monitoring%20zagro%C5%BCe%C5%84%20hybrydowych%20Rosji). Przed rozpoczęciem prac Codex powinien przeczytać [INDEX.md projektu](https://github.com/ksojecki/knowledge_base/blob/main/10%20Projects/Monitoring%20zagro%C5%BCe%C5%84%20hybrydowych%20Rosji/INDEX.md) i [workflow.md](https://github.com/ksojecki/knowledge_base/blob/main/10%20Projects/Monitoring%20zagro%C5%BCe%C5%84%20hybrydowych%20Rosji/workflow.md) w zakresie wymaganym przez zadanie. Te linki wymagają dostępu do prywatnego repo; nie kopiować jego prywatnych danych do repo publicznego.

Status: do wykonania · 2026-09-22

## Cel i ograniczenia

Doprowadź do tego, aby opublikowane raporty miały automatycznie generowaną, natywną nawigację Astro Starlight: seria → rok → miesiąc → tydzień. Raport roczny należy do roku; miesięczny do miesiąca; tygodniowy do miesiąca, w którym kończy się jego okres. Nie twórz własnego komponentu sidebaru, generatora struktury menu ani ręcznie wypisywanych pozycji każdego raportu. Nowy raport ma pojawiać się w menu po publikacji i buildzie bez zmiany konfiguracji.

Repozytoria:
- `ksojecki/knowledge_base`: kanoniczne finalne dane, walidator i przygotowanie publikacji.
- `ksojecki/sojecki.pl`: publiczne Markdown, Starlight, dashboard, routing, build i Render.

Nie zmieniaj treści merytorycznej, ocen, dat, `period`, `reportType`, metodologii ani rejestru zdarzeń. Nie uruchamiaj Astro w `knowledge_base`; nie dodawaj GitHub Actions do deploymentu. Zachowaj działający workflow Render. Przed dodaniem zadania lub nowego mechanizmu sprawdź, czy analogiczne rozwiązanie już istnieje.

## Stan początkowy — zweryfikuj w repo przed edycją

Finalne raporty źródłowe zostały przeniesione do:
```text
40 Reports/monitoring-zagrozen-hybrydowych-rosji/reports/
  YYYY/index.md                  # roczny
  YYYY/MM/index.md               # miesięczny
  YYYY/MM/YYYY-MM-WNN.md         # tygodniowy
```
W chwili sporządzenia planu jest 18 raportów (6 rocznych, 9 miesięcznych, 3 tygodniowe). W `scripts/reports-publication/publication.ts` odczyt nowego drzewa został dopisany, ale zapisywane publiczne ścieżki, linki do raportów i testy nadal mogą używać płaskiego układu `annual/monthly/weekly`. Uwaga: kod odczytu zachowuje też starszą gałąź zgodności z płaskim układem, co należy zweryfikować i docelowo usunąć po aktualizacji fixture'ów/testów. W `sojecki.pl/astro.config.mjs` sidebar nadal ma trzy sekcje z osobnym `autogenerate`.

Przed implementacją przeczytaj tylko niezbędne źródła: `INDEX.md`, `architecture.md`, `workflow.md`, `report-rules.md`, `template.md` projektu, `scripts/reports-publication/publication.ts`, `tests/reports-publication/publication.test.ts`, konfigurację Starlight oraz komponenty `ReportDashboard.astro` i `ReportArchive.astro` w `sojecki.pl`. Zweryfikuj dokumentację używanej wersji Starlight dotyczącą `autogenerate`, `index.md`, `sidebar.label`, `sidebar.order`, grup zwijanych i zachowania linku do strony indeksowej. Nie zakładaj niezweryfikowanych możliwości kliknięcia etykiety grupy.

## Docelowa struktura publicznych plików

```text
src/content/docs/raporty/zagrozenia-hybrydowe/
  index.md                       # strona serii
  metodologia.md
  2026/
    09/
      index.md                   # raport miesięczny
      2026-09-W01.md             # tygodniowy
      2026-09-W02.md
      2026-09-W03.md
    08/index.md
  2025/index.md                  # raport roczny
  2024/index.md
```

Docelowy widok: `Raporty → Monitoring zagrożeń hybrydowych Rosji → 2026 → Wrzesień → 14–20.09`; dla roku z raportem rocznym na początku grupy `Podsumowanie roczne`, dla miesiąca `Podsumowanie miesiąca` oraz tygodnie. Jeśli Starlight natywnie łączy stronę indeksową z klikalną nazwą grupy, wykorzystaj to zamiast powielania etykiety; w przeciwnym razie użyj jego standardowego, osobnego linku do `index.md`. Nazwy miesięcy mają być polskie, tygodnie mają krótkie etykiety dat, lata są grupami. Priorytet: natywny Starlight i automatyczna lista nad dokładnym wyglądem szkicu.

## Etap 1 — popraw publikator i kontrakt ścieżek w knowledge_base

1. Zidentyfikuj jedną funkcję wyznaczającą publiczny identyfikator ścieżki/URL raportu na podstawie zwalidowanego `reportType`, `period`, `periodEnd` i serii. Użyj jej do ścieżki pliku, linków względnych między raportami, odnośników wykresów i archiwów. Nie parsuj treści Markdown dla okresów ani ocen.
2. Generuj roczny do `<publicSeries>/YYYY/index.md`, miesięczny do `<publicSeries>/YYYY/MM/index.md`, tygodniowy do `<publicSeries>/YYYY/MM/YYYY-MM-WNN.md`. Ustal katalog tygodnia z `periodEnd`, a nie z prefiksu nazwy pliku; uwzględnij przekroczenie granicy miesiąca i roku.
3. Zachowaj wszystkie wymagane pola frontmatter. Dodaj jedynie metadane prezentacyjne wspierane przez Starlight, np. `sidebar: { label, order }`, do publikowanej kopii — jeśli aktualny parser frontmatter źródłowego nie wspiera zagnieżdżeń, nie dodawaj `sidebar` do źródeł. Zachowaj pełny `title` na stronie, krótki `sidebar.label` w menu. Etykiety i kolejność wyprowadzaj deterministycznie z dat i typu raportu. Unikaj ręcznej aktualizacji konfiguracji przy nowym roku/miesiącu.
4. Zachowaj bezpieczne przepisanie linków lokalnych, zwłaszcza do `metodologia.md`, także po przeniesieniu źródła. Nie publikuj draftów, audytów ani researchu. Usuń z wyjścia nieaktualne pliki płaskiej struktury bez naruszania niezwiązanej zawartości.
5. Dostosuj walidator do struktury `YYYY/MM` oraz testy: roczny, miesięczny, tygodniowy, tydzień na granicy miesiąca i roku, link do metodologii, dwa raporty z różnymi okresami, kompletność frontmatteru, prywatność i bezpieczeństwo, idempotentne ponowne przygotowanie. Usuń przestarzałe ścieżki z fixture'ów i martwą gałąź odczytu starej struktury dopiero gdy testy nowego układu przejdą.

## Etap 2 — natywne menu Starlight w sojecki.pl

1. Zastąp trzy grupy `Tygodniowe/Miesięczne/Roczne` pojedynczym `autogenerate` dla drzewa serii, pozostawiając stronę główną serii i metodologię dostępną w menu. Nie twórz komponentu nawigacji ani statycznej listy lat/miesięcy/raportów.
2. Zweryfikuj, jak używana wersja Starlight wyświetla `index.md` w automatycznie wygenerowanej grupie. Wybierz najprostsze natywne zachowanie bez duplikatów i bez gubienia linku do raportów rocznych/miesięcznych. Nie zastępuj raportu pustym indeksem tylko dla uzyskania drzewa.
3. Jeśli potrzebne, zapewnij kolejność najnowszy rok → najstarszy, najnowszy miesiąc → najstarszy, raport okresowy nad tygodniami, przez natywnie obsługiwane `sidebar.order`. Zweryfikuj w zbudowanym sidebarze rzeczywistą kolejność, a nie tylko obecność metadanych.
4. Względem nieaktualnego publicznego URL zapewnij działające przekierowania z `/raporty/zagrozenia-hybrydowe/{tygodniowe,miesieczne,roczne}/...` do nowych adresów. Uwzględnij, że bieżące odnośniki w `ReportArchive.astro` i `ReportDashboard.astro` mogą powstawać z `entry.id`; popraw je, jeśli po migracji prowadzą błędnie, używając jednego spójnego sposobu rozwiązywania publicznych URL-i. Nie zmieniaj danych liczbowych wykresów.
5. Usuń/zmień stare strony indeksowe sekcji tylko po sprawdzeniu, co je linkuje. Nie zmieniaj konfiguracji Render poza koniecznym minimum (oczekiwane: bez zmian).

## Etap 3 — uruchomienie i kontrola

- W `knowledge_base` uruchom dostępne `reports:test`, `reports:validate`, `reports:prepare` (lub odpowiadające aktualne skrypty). Nie uruchamiaj lokalnego Astro z `knowledge_base`.
- Zweryfikuj wynik publikatora: 18 raportów, brak duplikatów, właściwe ścieżki i frontmatter, działające linki lokalne, brak prywatnych plików.
- Przenieś/wygeneruj publiczne raporty do `sojecki.pl` zgodnie z istniejącym workflow; uruchom testy i build w tym repozytorium.
- Sprawdź automatyczną listę po dodaniu testowego raportu nowego miesiąca i nowego roku (bez ręcznej zmiany `astro.config.mjs`), a następnie usuń fixture demonstracyjny.
- Zweryfikuj na wygenerowanym wyniku stronę serii, raporty roczne/miesięczne/tygodniowe, sortowanie, dashboard, linki wykresów, metodologię oraz przekierowania starego URL. W przypadku niepowodzenia zatrzymaj publikację i zachowaj czytelny komunikat.
- Dopiero po pozytywnych testach commit do `sojecki.pl/main` może uruchomić Render. Sprawdź status deployu i adresy publiczne, jeśli masz odpowiedni dostęp; jeśli brak dostępu, jawnie wskaż, co zweryfikowano lokalnie, a czego nie potwierdzono na produkcji.

## Aktualizacja dokumentacji i wynik prac

Po implementacji zaktualizuj `workflow.md`, `architecture.md`, `report-rules.md`, `template.md` (tylko gdy zasady źródłowe się zmienią), `README.md` projektu i zawsze `INDEX.md`. Sprawdź spójność z aktywnym `plan-cleanup-warstwy-publikacyjnej.md`: `knowledge_base` nie może przejąć budowania UI, zaś `sojecki.pl` pozostaje jedyną aplikacją Astro. Gotowy plan przenieś do `archive/` lub oznacz jako wykonany po potwierdzeniu implementacji.

W raporcie końcowym Codex podaj: zmienione pliki w obu repozytoriach, liczbę przeniesionych raportów, przykładowe stare i nowe URL-e, wyniki testów i builda, potwierdzenie automatycznego dodawania okresów, status Render oraz ewentualne ograniczenia natywnej nawigacji Starlight.

## Definition of Done

- Kanoniczne raporty pozostają uporządkowane w `knowledge_base` i są jedynym źródłem prawdy.
- 18 raportów opublikowanych w strukturze rok/miesiąc/tydzień, z prawidłowymi danymi i linkami.
- Lewy sidebar jest generowany automatycznie z katalogów przez standardowy Starlight, bez własnego kodu nawigacji.
- Nowy miesiąc, rok i tydzień nie wymagają ręcznej aktualizacji menu.
- Raporty roczne są dostępne w grupie roku, miesięczne w grupie miesiąca; tygodnie są pod właściwym miesiącem.
- Stare adresy mają przekierowania, a dashboard, archiwa i wykresy prowadzą do nowych URL-i.
- Testy walidacji/publikacji w `knowledge_base` oraz testy/build `sojecki.pl` przechodzą; status wdrożenia jest jasno przedstawiony.
