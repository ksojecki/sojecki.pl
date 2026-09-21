# sojecki.pl

Publiczna statyczna strona dokumentacyjna Starlight dla `sojecki.pl`.

## Treść

- opublikowane raporty i pozostałe publiczne strony: `src/content/docs/`;
- blog i projekty: publiczne sekcje strony;
- research, drafty i audyty: prywatne repozytorium `ksojecki/knowledge_base` — nie należą do tego repozytorium.

## Lokalnie

Wymagany jest Node.js 22.18 lub nowszy.

```sh
npm ci
npm run dev
```

## Walidacja produkcyjna

```sh
npm run verify
```

`verify` najpierw wykonuje sprawdzenie Astro i statyczny build, a następnie testuje wynik w `dist/`.

## Build

```sh
npm run build
```

## Deployment

Render.com jest jedynym pipeline'em build i deploy:

- typ: Static Site;
- branch: `main`;
- build command: `npm ci && npm run verify`;
- publish directory: `dist`.

Repozytorium jest publiczne. Prywatny research i drafty pozostają w `ksojecki/knowledge_base`; obecność pliku w `src/content/docs/` oznacza jego publikację.
