# Sdílený Tooltip

Tooltip má jednu bublinu a jeden Floating UI výpočet pro celou aplikaci.
`Tooltip.vue` zůstává deklarací u autora: vlastní DOM anchor, model, target,
hover listenery, props/config a slot. `TooltipHost.vue` vykresluje společnou
bublinu do body. Aktivní deklarace přes Teleport vloží svůj obsah do hostu,
takže sloty zůstávají v autorském kontextu včetně provide/inject a reaktivity.
Nepoužíváme ruční render, čtení VNodes ani opětovné vykonávání slotů v hostu.

## Zapojení

UI Nuxt plugin `tooltip-host.ts` vytváří stav pro každou aplikaci / SSR request
samostatně a poskytuje jej přes injection key. Neobsahuje globální registr vlastníků.
UI modul přes hook `app:resolve` automaticky obalí aplikaci a vykreslí právě jeden
`<TooltipHost />` a `<Notifications />` mimo měnící se stránky/layouty.
Konzument je do `app/app.vue` nepřidává; stačí rozšířit UI layer.
Samotná použití `<Tooltip>` a jejich sloty se nemění.

Server vykresluje deklarace a prázdný host; targety a otevření se řeší po mountu.
Ani původně true model nevyžaduje přístup k DOM na serveru. To neznamená,
že obsah otevřeného tooltipu je dostupný ve výsledném HTML bez JavaScriptu.

## Chování

- První hover respektuje otevírací delay. Opuštění targetu před otevřením ruší požadavek.
- Při opuštění aktivního targetu zůstává bublina po dobu zavíracího delay vidět.
- Hover nad dalším targetem během této doby okamžitě přebírá stejnou bublinu:
  nový obsah a pozice, bez unmountu a bez další otevírací prodlevy.
- Časovač patří konkrétnímu vlastníkovi. Staré zavření nemůže zavřít nového vlastníka.
- `referenceTarget` je nadále reaktivní. Při změně platného targetu za otevření
  se bublina přesune bez resetu modelu. Původní listenery a čekající časovače se zruší.
  Neplatný target aktivní tooltip zavře; null/undefined používá výchozího rodiče.
- `manual` vypíná hover ovládání. Model lze nadále otevřít/zavřít programaticky.
  Současně může být vidět právě jeden tooltip: poslední požadavek vyhrává a
  předchozí vlastník dostane model false. Po zavření se předchozí tooltip sám neobnovuje.
- Props pro placement, offset, arrow, attrs a UI styly pocházejí z aktivní deklarace.
  `getComponentProps` a merge UI konfigurace zůstávají zachované.
- Zánik vlastníka ruší jeho čekající práci a případnou aktivní bublinu.
  Zánik hostu/aplikace ruší celý stav. Floating UI autoUpdate sleduje aktivní target
  a změny rozměrů obsahu, jeho cleanup řídí useFloating.

## Ověření a hranice

`shared-tooltip.spec.mjs`: první delay, předání stejného DOM elementu, změna pozice,
starý close timer, živý slot a jeho inject kontext, aktualizace obsahu,
referenceTarget za otevření (DOM element), reset targetu, manual/model arbitráž,
zánik během otevíracího delay, unmount otevřeného tooltipu a remount.
`vapor-overlay-anchors.spec.mjs` navíc ověřuje selectorový referenceTarget a SSR bez JS.
Cílené testy běží pod native Vapor parentem, Tooltip a TooltipHost jsou nadále VDOM.
Toto není důkaz jejich plně nativní Vapor kompatibility ani výkonnostní benchmark.

Prošlo 13 různých dev E2E scénářů včetně regresí Selectoru a Dialogu;
po doplnění přesunu otevřeného tooltipu zopakovány tři relevantní scénáře.
Lint nových/změněných souborů singleton implementace bez nálezů.
Produkční build v tomto kroku nebyl spuštěn.
