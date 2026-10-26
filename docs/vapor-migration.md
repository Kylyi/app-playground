# Migrace UI a Utilities na Vapor

Pracovní checklist, aktualizováno 2026-10-25; starší záznamy níže popisují jednotlivé etapy. Hlavní místo pro průběžné odškrtávání.
Podklady: audit zdrojů UI/Utilities, [Nuxt pilot](research/nuxt-vapor.md),
[Selector a initRef](research/selector-vapor.md), [testování](testing.md).

Aktuální runtime: Nuxt 4.6.1, matched Vue 3.6.0-rc.11 a Test Utils 4.3.3.
Větve `2.3-vapor` nyní zahrnují UI `2.3` po `47fbf0c5` a Utilities po `88ea6b3`.
Lokální migrace je zachovaná; přibyly upstream opravy Table/Pivot, externí Tree
drop callback, container breakpoint tlačítek, segmentovaný ButtonGroup a číselné
řazení textových hodnot. Nuxt aplikační root zůstává odložený. Výkonnostní čísla
níže zahrnují čerstvé měření z 2026-10-25 s opravenými VDOM direktivami.
Upgrade uzavírá F07 a I02. Počáteční Tree data jsou synchronní bez async setup;
vlastní asynchronní hledání má deterministický pending stav a ochranu proti
zastaralým výsledkům. Samostatný `createVaporApp` konzument ověřuje kritické
nativní cesty. UI NuxtLink větve nahrazuje nativní UILink a runtime ikony mají
nativní datovou cestu (I03). H05 zůstává otevřené kvůli aplikačnímu Nuxt rootu
a zbylým framework VDOM helperům v bundle; externí audit je dokončený,
B08 čeká na rollout konzumentů a odstranění jejich legacy volání.
HY01 a G09 jsou uzavřené; oba produkční typechecky mají nula diagnostik.
Inventář zahrnuje 242 SFC / 63 rodin včetně nové rodiny Link a dokončené Icon.
Závěrečný kontraktní a lokální externí audit je dokončený. Podmínkou
uzavření celé migrace zůstává aplikační/framework hranice H05 a rollout
konzumentů B08/H04. Měření G10 je dokončené: čtyři compiler/parent varianty,
nové měření po synchronizaci a oprava viewportového startu odstranily dočasné řádky.
Oba renderery zrychlily, menší nativní režie zůstává změřená.
Retence runtime ikon pod nativním parentem je opravená, cleanup kontroly procházejí;
výkon a gzip inventář se dále porovnávají proti stejnému optimalizovanému VDOM kódu.
Viz [měření výkonu](research/vapor-performance.md); nejde o tvrzení plošného zrychlení.
Viz [závěrečný kontraktní audit](research/vapor-final-contract-audit.md).
Aktuální důkazy a cleanup rozhodnutí jsou v [nativním auditu](research/native-vapor-audit.md)
a [validačním záznamu kroků 1–4](testing.md).
Navazující [hloubkový audit](research/vapor-review.md) je dokončený: revize
241 SFC / 62 rodin a veřejných kontraktů, 883 úspěšných produkčních E2E
(2 existující CDP capability skips), 153 úspěšných kontrol po finálním cleanupu,
317 unit testů a kontrola screenshotů pomocí GPT Luna. Nejde o důkaz všech
volitelných kombinací API ani o individuální nativní mount všech 241 importů;
Tento starší záznam předchází dokončení nativních UI odkazů a runtime ikon;
Aktuální navazující audit a ověření jsou výše; starší počty zůstávají
historickým záznamem tohoto checkpointu.

## Cíl a význam stavů

Zachovat veřejné chování UI, `getComponentProps`, UI config a ergonomii store-owned
modelů. Cílem je připravit celou UI knihovnu pro plnohodnotný nativní Vapor mode,
včetně slotů, dynamického obsahu, programatického vykreslování a měření.
Funkčnost přes interop je pouze mezikrok; neznamená dokončenou migraci.
Dočasné VDOM hranice lze přepsat až na konci migrace, ale každá musí mít otevřený
navazující úkol. Nativní použití UI nesmí vyžadovat VDOM runtime ani interop;
ověření čistě Vapor bundle je povinný poslední krok H05, nikoliv podmínka každého
dílčího PR. Volitelná kompatibilita pro VDOM konzumenty nesmí být závislostí
nativní cesty.

- `[x]` znamená dokončenou konkrétní práci s ověřením, ne automaticky celou komponentu.
- `[ ]` znamená zbývající práci nebo dosud neprovedené ověření.
- Při dokončení doplnit test/příkaz a případnou zbývající interop hranici.
- Nález při textovém hledání je podnět k revizi. Například `useSlots`, `defineModel`,
  `defineOptions`, `unrefElement` na DOM refu ani typ `VNodeProps` nejsou samy o sobě chyba.
- Inventář je výchozí seznam celé knihovny. Runtime audit každé větve zatím hotový není;
  nové nálezy přidávat do příslušného bodu, nikoliv automaticky přepisovat vše se shodným názvem API.

## A. Hotový základ

- [x] A01 — Released Nuxt 4.6.1, matched Vue 3.6.0-rc.11 runtime/compiler,
  aktivní Vapor compiler a interop. Preview pilot je historicky v research/nuxt-vapor.md.
  Historical rc.7 → rc.9 upgrade on 2026-09-29 fixed native fallback-slot disposal (I04).
  The root dependency, all Vue overrides and lockfile stay on the same release.
- [x] A02 — SSR zapnuté; pilot ověřuje server HTML bez JavaScriptu i následnou hydrataci.
- [x] A03 — Sjednocené verze a Vite deduplikace Vue balíčků; opraven konflikt sdílených sentinelů.
- [x] A04 — Playwright, unit testy, axe a ESLint guardrail pro Vapor; projektové code standards.
- [x] A05 — Nový `initRef`: two-way, one-way/lokální model, fallback, `null`, `undefined`, `initWith`.
- [x] A06 — Technický převod tehdejších 41 produkčních volání `initRef` bez `instance`
  a doplnění `update:*` deklarací. Form, List, Tree, TreeDms, Pivot, QueryBuilder,
  Menu a dřívější Selector pilot. Správnost rozdělení konfigurace/modelů tím není
  uzavřená; revize a odstranění nadbytečných eventů jsou v B09.
- [x] A07 — Zachované `getComponentProps`/`getComponentMergedProps`; izolované objektové defaulty z configu.
- [x] A08 — Selector pilot: nativní Vapor SFC s VDOM potomky, explicitní `element`/`controlElement`,
  podmíněné forwarding sloty, opravené ořezávání menu a autofocus při pomalejším kliknutí.

Poslední ověření A05–A08: 15 unit testů (`init-ref`, `component-props`, `store-models`)
a 10 Playwright testů nad produkčním buildem. To není test celé knihovny.
Komponenty s markerem v UI jsou nyní `Selector.vue` a `Pivot.vue`; Pivot má migrované
modely, ale chybí mu ucelené ověření nativního renderování a interakcí.

## B. Modely, emit a vlastnictví stavu

- [x] B01 — `Inputs/functions/useInputUtils.ts`: `initRef` místo implicitního `useVModel`,
  explicitní emit ve všech osmi inputech; doplněné clear/model eventy včetně TextArea.
  Editable draft zůstává oddělený kvůli debounce/emit-on-blur. Ověřené masky, `emptyValue`,
  clear, lokální/one-way model, parent update/reset a předávání focus/blur/clear.
  Ověření: 49 unit testů prošlo (`useInputUtils` + `init-ref`), jeden test DatePicker
  stránkování roků selhává také s původním helperem. Produkční build a 10 Selector/Vapor
  E2E scénářů prošly; další E2E test centrování Dialogu selhal. Lint změn bez chyb.
  Nativní Vapor inputy, DOM a lifecycle jsou stále C01/E/F/G; tento bod je necertifikuje.
- [x] B02 — `Inputs/FileInput/functions/useFileInput.ts`: explicitní emit pro
  `filesAdded`/`filesRemoved`, zapojený v FileInput i FileInputSimple.
  Ověření: čtyři unit testy pro single/multi přidání, odebrání, file-dialog change/reset
  a DOM drop; lint změněných souborů bez nálezů. DOM kontrakt drop zóny zůstává C01;
  toto není ověření celé komponenty v nativním Vaporu.
- [x] B03 — `Utilities/useRefReset.ts`: odstraněné získávání instance a `emitName`,
  nově `onSyncToOrigin(value)` po zápisu do zdroje. Pět stávajících volajících
  `emitName` nepoužívalo, jejich zápis zůstává stejný. Externí konzumenti s `emitName`
  musí přejít např. na `onSyncToOrigin: value => emit('update:modelValue', value)`.
  Zachované aliasy syncToParent/syncFromParent a autoSyncFromParent.
  Ověření: tři unit testy bez komponentové instance (callback, reset/baseline,
  objekty/pole, transformace, setModel a auto-sync); lint bez nálezů.
- [x] B04 — `useArk`/`useZod` používají unikátní ID s volitelným diagnostickým `name`,
  bez komponentové instance. Existující Ark volající předávají čitelné názvy explicitně.
  Cleanup používá přímo Vue `onUnmounted` a odstraňuje i lokální visibility záznam;
  VueUse `tryOnUnmounted` v aktuální verzi kontroluje VDOM instanci a Vapor cleanup vynechal.
  `useFiles()` má unikátní výchozí klíč pro každé volání; explicitní `name` zůstává
  přesným registry klíčem (konzument odpovídá za jeho unikátnost).
  `useZodOld` odstraněn na přání uživatele, bez produkčních volajících, včetně API odkazu.
  Při runtime testu opraveno proxyování Zod 4 schématu přes `markRaw`; stav zůstává reaktivní.
  Ověření: dva nové Playwright scénáře `/vapor-scopes` pro SSR, hydrataci, souběžné
  Vapor vlastníky, sdílený scope, soubory, cleanup a remount; všech 12 cílených
  produkčních E2E testů prošlo. Lint bez chyb (dva existující warningy).
  Doplněn `/vapor-form`: skutečné Form/TextInput, ArkType, vnořené Vapor komponenty,
  string/object `validation-path`, izolace `base`/`billing`, reset, submit payload
  a opakovaný remount. Tři nové E2E scénáře prošly v dev i produkci; společně
  s `/vapor-scopes` prošlo všech pět cílených produkčních scénářů.
  Stejný scénář doplněn pro Zod na `/vapor-form-zod`; společná parametrizovaná
  sada pro ArkType i Zod prošla v dev i produkci (6/6).
  ID registrací jsou interní a dočasná, nejsou určena pro stabilní DOM ID či persistence.
- [x] B05 — Table: explicitní stabilní storage key bez názvu rodičovské instance.
  Odstraněn `table-get-storage-key.ts`; `storageKey` se používá beze změny.
  Bez klíče nebo s `null` je stav lokální. Interní `useId()` není persistence klíč
  a vzniká jednou v setupu, nikoliv ve watcheru.
  **Migrace konzumentů:** u tabulek, které spoléhaly na automatický klíč, je nutné
  předat původní název rodiče (`name` nebo `__name`) jako `storage-key`. Jinak se
  jejich uložená nastavení přestanou načítat; data v localStorage se nemažou.
  Jediné zdejší použití Table (`issue-28.vue`) nyní explicitně zachovává `issue-28`.
  Externí konzumenty je nutné upravit před aktualizací UI. Pro nové tabulky volit
  stabilní doménový klíč; stejné klíče znamenají záměrné sdílení nastavení.
  Zapnutí/vypnutí persistence vyžaduje remount (volba úložiště probíhá v setupu).
  Ověřeno dvěma Playwright scénáři v dev i produkci: skutečný Table store pod Vapor
  vlastníkem, původní uložená data, izolace klíčů, lokální stav, remount/reload,
  SSR bez JavaScriptu a hydratace bez chyb. Cílený lint bez chyb i warningů.
- [x] B06 — Audit nepoužitých `getCurrentInstance` v UI, Utilities a aplikaci.
  V aktuálním stavu není žádné volání s nepoužitým výsledkem; nic nebylo odstraněno.
  Původní příklady byly chybně označené: `useScrollerScroll` emituje `scrolled`,
  `useListKeyboard` emituje `submit` a `useQueryBuilderColumnFilters` emituje
  `update:columnFilter` / `remove:columnFilter`. Jejich převod je samostatný B10.
  Dalších osm produkčních volání zůstává pro DOM/sloty: `InputLabel` (C01),
  `Menu`, `Tooltip`, tooltip `element-functions`, `useDialogLayout` (C02),
  `ScrollArea` (C04), `Tabs` (D01), `useDialog` (D02).
  Diagnostické volání ve `VaporProbe` je záměrné. Utilities už nemají přímé
  volání; kompatibilitní typy a předaná instance v legacy `initRef` patří do B08.
  Ověření: prohledání zdrojů a kontrola použití všech výsledků; bez změny runtime kódu.
- [x] B07 — Při migraci dalších SFC ověřit zbývající synchronizace `defineModel` ↔ store,
  `useVModel`, `syncRef` a mutace vnořených objektů. Nezavádět dva vlastníky jednoho modelu
  a nečekat, že lokální změna `initRef` změní samotné props.
- [ ] B08 — Po vyřešení externích konzumentů Utilities odstranit legacy overload/test/soubor
  `init-ref-legacy.ts`. Nyní je úmyslně ponechán pro zpětnou kompatibilitu.
  - [x] B08a — Lokální externí audit: 23 966 souborů / 36 projektů,
    115 explicitních instance volání v sedmi projektech. Legacy adapter se
    ponechává do jejich migrace. Přesné callsites, další kontrakty a rozsah
    rollout práce jsou v [závěrečném auditu](research/vapor-final-contract-audit.md).


- [x] B09 — **Oddělit konfiguraci od měnitelného stavu.**
  Revidovat všechna použití `initRef` v List, Tree, TreeDms, Form, Pivot,
  QueryBuilder, Menu a Selector; stejnou zásadu použít i v input helperech.
  U každé hodnoty určit vlastníka a oprávněné zápisy podle veřejného kontraktu
  a volajících. Historické použití `initRef` ani existující setter není důkaz,
  že komponenta smí hodnotu měnit.
  - Konfigurace od parenta (např. List `itemKey`, `itemLabel`): readonly reaktivní
    getter/ref, který sleduje props a zachová fallback/config defaulty; bez lokálního
    přepisování a bez `update:*` eventu. Nesmí vzniknout jednorázová kopie props.
  - Stav, který komponenta smí měnit (např. výběr nebo hledaný text): zachovat `initRef`
    a odpovídající update eventy. Čistě interní stav bez veřejného bindingu patří do lokálního refu.
  - Odstranit neopodstatněné eventy z emit typů i deklarací vlastníků; upravit dotčené
    konzumenty a testy. Zejména `store-models.spec.ts` nesmí nadále vyžadovat writable
    konfiguraci jen proto, že ji tak testoval mechanický převod.
  - Hotovo znamená: všechny revidované hodnoty mají určené vlastnictví, konfigurace
    reaguje na změny parenta bez update emisí a skutečné modely stále správně fungují
    v controlled/one-way/local režimu včetně resetů. Doložit cílenými testy.
  Dokončeno: 23 readonly konfiguračních hodnot, 19 zachovaných modelů; odstraněny
  neopodstatněné update eventy a upraven binding loading v SelectorMenu.
  List odvozuje search/sort konfiguraci bez mutace parenta a reaguje na změny klíčů;
  Tree přepočítává uzly při změně mapování. Podrobná klasifikace a hranice auditu:
  [vlastnictví stavu](research/store-state-ownership.md).
  Ověření: 22 cílených unit testů a 16 produkčních E2E scénářů prošlo.
  Cílený lint bez chyb, tři existující warningy ve Form/List store.

- [x] B10 — Nahradit zbývající implicitní emity explicitními callbacky:
  - `useScrollerScroll`: `scrolled` z HorizontalScroller i VerticalScroller.
  - `useQueryBuilderColumnFilters`: update/remove z QueryBuilder i QueryBuilderInline.
  - `useListKeyboard`: určit vlastníka `submit` pro obě cesty volání (`ListContent`
    a veřejné `List.handleKey` přes `listGetExposed`); zachovat Ctrl/Meta+Enter
    i injektovaný `formSubmit`, bez duplicitního submitu.
  Ověřit payloady a doručení eventů bez implicitní instance. Samotný převod emitů
  neuzavírá DOM/lifecycle závislosti těchto helperů ani migraci celých komponent.
  Hotovo: `useScrollerScroll(onScrolled)`, `useQueryBuilderColumnFilters(props, emit)`
  a povinný `onSubmit` v `useListKeyboard`. `ListContent` předává vlastní submit
  přes List; veřejné `List.handleKey` používá callback vlastníka přes `listGetExposed`.
  Po Ctrl/Meta+Enter se handler vrací hned po submitu, bez následné navigace a
  možného rekurzivního opakování při nevybrané položce.
  Externí přímí volající helperů musí doplnit tyto callbacky; veřejné eventy komponent
  zůstávají stejné. Zbývajících osm `getCurrentInstance` řeší DOM/slotové kroky C–D.
  Ověření: tři unit testy, nový browser scénář v dev i produkci s nativním Vapor scroll
  vlastníkem a skutečným Listem, sedm produkčních regresních scénářů Selectoru.
  Cílený lint bez chyb; deset existujících warningů v dotčených souborech.

## C. DOM reference a veřejné kontrakty

Pilotní konvence: přímo DOM template ref; pokud ho parent skutečně potřebuje,
explicitní `defineExpose({ element })`. Pro ovládání preferovat existující `focus`,
`blur`, scroll API. Neexposovat automaticky root každé komponenty a nevracet se
k obecnému procházení interních instancí. U wrapperů určit, který element API znamená.

- [x] C01 — `useInputUtils`, `useFileInput`, `InputLabel`: DOM input/control refs a label měření;
  odstranit hledání rootu/předků přes `vnode`. Ověřit focus, floating label, prepend a layout.
  `useInputMask` deklaruje input/textarea DOM ref; `useInputUtils` ho používá přímo,
  bez `unrefElement` a nepodloženého přetypování. FileInput drop zone používá již
  existující veřejné `Field.element`, bez nového expose API.
  `InputLabel` už neměří prepend přes instanci. Regular wrapper vlastní DOM ref
  prependu a sleduje jeho šířku přes ResizeObserver s cleanupem při unmountu.
  Label začíná ve druhém grid sloupci; `--prependWidth` kompenzuje jeho pozici
  pouze při focusu nebo floating stavu. Prázdný `stackLabel=false` zůstává vedle
  prependu. Původní zjednodušení na první sloupec tuto větev rozbilo a bylo opraveno.
  Regresní `input-prepend.spec.mjs` selhal před opravou o 64 px a po opravě prošel
  v dev: focus, vyplnění, vymazání, změna šířky, skrytí/obnovení a reload.
  Dva nové E2E scénáře prošly v dev i produkci: native Vapor input/textarea API,
  label focus/alignment, změna prependu, remount, oba FileInputy a SSR bez JS.
  Společně se Selectorem prošlo 9 produkčních scénářů. Unit sada: 48 úspěchů,
  jeden již známý nesouvisející pád DatePicker stránkování roků (viz B01).
  Cílený lint bez chyb, dva existující warningy v `useInputMask`.
  Dodatečná oprava non-stacked labelu: tři dev scénáře prošly; produkční opakování
  nebylo spuštěno kvůli již obsazenému portu 3021. Dřívějších 9 produkčních průchodů
  výše předchází této opravě a nedokládá větev `stackLabel=false`.
  Tento krok neoznačuje celé input komponenty za Vapor-ready; lifecycle a zbývající
  wrapper/component refy jsou nadále E/F/G.
- [x] C02 — `Menu/useMenu`, `Dialog/useDialogLayout`, `Tooltip` a jeho `element-functions`:
  explicitní trigger/kotva/host místo `instance.vnode.el.parentNode`.
  Prověřit i top-level `getCurrentInstance` v tooltip helperu a zda se helper používá.
  - [x] C02a — Dialog: vlastní skrytý DOM anchor mimo Teleport; `useDialogLayout`
    dostává explicitní getter hostu místo komponentové instance. Výchozí parent trigger
    i scoped `target` zůstávají zachované. Změny `target`, `trigger` a `manual`
    odpojí původní listener; watcher ho odpojí také při zániku vlastníka.
    Přímí externí volající helperu musí doplnit třetí argument `getHost`.
    Ověření: tři nové Chromium E2E scénáře v dev a sedm regresních scénářů Selectoru;
    native Vapor owner, přepnutí targetu/eventu,
    manual režim, cleanup/remount, skutečný Dialog s Teleportem a SSR bez JavaScriptu.
    MenuProxy nyní hydratuje stejnou Dialog větev jako server a podle breakpointu se
    přepne až po mountu. Nový anchor odhalil původně skrytý nesoulad Dialog/Menu;
    sedm regresních testů nejprve selhalo na hydration mismatch, po opravě prošlo.
    Ověřeno také přepnutí mobil → desktop → mobil a výběr v obou typech overlaye.
    Cílený lint bez nálezů. Produkční build v tomto kroku nebyl spuštěn.
    Dialog SFC zůstává VDOM; nativní převod celé komponenty ani programatické
    `useDialog` tím nejsou uzavřené. Komponentové target refs řeší C04.
  - [x] C02b — Menu a Tooltip používají vlastní skrytý DOM anchor mimo Teleport.
    `useMenu` přijímá `getHost` a `onHide` místo instance. Refresh zachovává target
    i referenceTarget a listener se odpojuje podle původního targetu/eventu, včetně
    změny manual režimu a unmountu. Veřejné `hide` eventy zůstávají zachované.
    Tooltip přepojuje hover listenery při změně referenceTarget/manual; cleanup
    ruší i čekající timeouty a pomocné hover třídy.
    Tooltip `element-functions.ts` nemá v repozitáři žádné externí volající.
    Exporty ponechány pro konzumenty; odstraněna neplatná instance na úrovni modulu,
    `getTargetElement(target, fallback?)` má nyní explicitní volitelný DOM fallback.
    Komponentové targety přes `unrefElement` nadále patří do C04.
    Ověření: dva nové dev E2E scénáře skutečných VDOM Menu/Tooltip pod Vapor parentem,
    SSR bez JS, default parent, retarget, trigger/manual změny, hide event,
    opožděný hover, unmount/remount. Dalších deset regresních testů Selectoru,
    Dialogu a mobilního přepínání prošlo (celkem 12 dev E2E).
    Celé komponenty nejsou označeny jako native Vapor.
    Cílený lint bez chyb, šest existujících warningů v legacy `element-functions.ts`.
    Produkční build v tomto kroku nebyl spuštěn.
  Sdílený Tooltip (navazující uživatelské rozšíření): jeden root host a Floating UI,
  deklarace drží sloty a target. Předání mezi vlastníky během hide delay zachovává
  bublinu bez další show prodlevy; dynamický referenceTarget ji přesune bez zavření.
  Zachovaný config/slot kontext, manual modely mají pravidlo poslední požadavek vyhrává.
  Integrace konzumenta nově vyžaduje jeden TooltipHost v rootu aplikace.
  Podrobnosti a ověření: [sdílený Tooltip](research/shared-tooltip.md).
- [x] C03 — `$hide` přijímá explicitní DOM `target` místo `instance`.
  Bez targetu zavírá poslední odpovídající overlay; předané null/undefined nebo DOM
  mimo overlay nic nezavře. `all` má před targetem přednost. Zachováno filtrování typu,
  DOM pořadí, ignore u all/latest a přednost ignoreUntilEl před ignore v all režimu.
  Helper je bezpečný při SSR a používá typovaný DOM hide kontrakt bez ts-expect-error.
  Opravena nekonzistence persistent Dialogu: helper nyní předává výchozí force=false,
  takže se neaktivuje implicitní force=true z Dialog.hide. Pro vynucení použít force:true.
  Audit nenašel interní volající s instance; externí konzumenti musí předat vlastní DOM ref.
  ListSearch používá @click="$hide()", aby MouseEvent.target nebyl interpretován jako options.
  Stejný explicitní způsob volání používat v externích event handlerech.
  Ověření: dva nové dev E2E scénáře, přímé volání z native Vapor ownera se skutečnými
  VDOM Dialog/Menu, explicitní cíle, latest/all/type, ignore a hranice ignoreUntilEl,
  persistent/force, opakované otevření/zavření a SSR bez JS. Prošlo i deset regresních
  scénářů Selectoru a Dialogu (celkem 12 dev E2E). Cílený lint bez nálezů.
  Produkční build neproběhl.
- [x] C04 — `useFloatingUIUtils`, `useOverflow`, `ScrollArea`: rozlišit DOM refs od
  komponentových refs; zachovat výpočet rozměrů, overflow a nalezení okolního overlaye.
  - [x] C04a — ScrollArea hledá okolní menu/dialog přes vlastní scrollArea DOM ref,
    bez instance/vnode. Obsah vybírá vyloučením konkrétních scrollbar lišt, nikoli
    odříznutím posledních dvou potomků ještě před inicializací. PerfectScrollbar
    instance je shallowRef; unmount ruší init/scroll timeouty a čekající update frame.
    Ověření: dva dev E2E scénáře pod Vapor parentem, odložená inicializace i immediate,
    resize obsahu, dynamický potomek, scrollToBottom, unmount/remount a SSR bez JS.
    Cílený lint bez nálezů. ScrollArea stále VDOM; VueUse/PerfectScrollbar native
    kompatibilita zůstává F01/F03. Produkční build v tomto kroku neproběhl.
  - [x] C04b — `useFloatingUIUtils.getElement` a Menu/Dialog/Tooltip props mají
    společný typ `FloatingTarget`: DOM element, scoped selektor, ref, getter nebo
    komponenta s veřejným `element` (včetně ref/getter hodnoty).
    Getterův výsledek prochází stejným resolverem; neplatné výsledky vracejí null.
    Explicitní element má přednost i když je dočasně null — nepřepíná se na root.
    Veřejné `$el` zůstává omezený adapter pro stávající VDOM konzumenty (např.
    MonthSelector/YearSelector); interní instance se neprocházejí. Odstranění tohoto
    adapteru patří k migraci zbývajících rodin, ne k tomuto kroku.
    Menu sleduje výsledné DOM targety, takže zachytí výměnu exposovaného elementu
    uvnitř téže komponenty. Tooltip/Dialog již používají reaktivní watchEffect.
    DOM resolver nepřijímá libovolné virtuální objekty; virtuální Menu nadále používá
    svou existující virtualConfig/virtualDimensions cestu.
    Ověření: dva dev E2E scénáře s native Vapor target komponentou (vnitřní button
    odlišný od rootu), otevřený tooltip, výměna elementu, komponentový i selectorový
    getter, staré listenery, unmount/remount a SSR bez JS. Overlaye stále VDOM.
    Prošlo také 12 regresních scénářů Selectoru, Dialogu a Tooltipu (celkem 14 dev E2E).
    Cílený lint bez nálezů; produkční build v tomto kroku neproběhl.
  - [x] C04c — useOverflow má jediný vstup v Utilities; UI reexport byl odstraněn.
    Přímé importy useOverflow/getScrollbarWidth/IOverflowOptions směřují do Utilities.
    Threshold z UI je dostupný i přes Utilities.
    onOverflow přijímá explicitní DOM element/ref/getter, nikoliv komponentovou instanci;
    komponentový target předávat např. getterem na veřejné element.
    Každá registrace má vlastní cache a ResizeObserver s cleanupem při výměně targetu
    nebo zániku scope. Ruční refresh zachovává vynucené oznámení, načítá target po nextTick
    a ignoruje chybějící/odpojené elementy i zaniklý scope. DOM gettery se při SSR nevolají.
    Stejně jako dříve změna samotného obsahu bez změny rozměrů sledovaného elementu
    může vyžadovat explicitní refresh; nejde o MutationObserver.
    Ověření: dva dev E2E scénáře Nuxt autoimportu pod native Vapor vlastníkem,
    shodné výsledky nezávislých registrací, resize, threshold, rozdíly rozměrů,
    opakovaný refresh, odstranění/remount DOM a zánik vlastníka s čekajícím refreshem,
    SSR bez JS. Nuxt autoimport odkazuje přímo na Utilities. Lint bez nálezů;
    produkční build nebyl spuštěn.
- [x] C05 — List: `ListNoData`, `ListRowItem`, `useListKeyboard`, `useListDragAndDrop`.
  Nahradit nepodložené `unrefElement(componentRef)` a `as HTMLElement`; ověřit scroll root,
  move handle, virtual scroller a aktualizaci refů po výměně řádků.
  - [x] C05a — ListNoData měří explicitní DOM ref v obou větvích prázdného stavu
    (původní bannerEl nebyl připojený v šabloně), reaguje na výšku i šířku.
    VirtualScroller zveřejňuje element; useListKeyboard jej používá místo
    unrefElement(componentRef) a načítá aktuální řádek po nextTick.
    Ověření: dva dev E2E scénáře /vapor-list-dom (resize prázdného stavu,
    klávesnicový scroll ve virtualizovaném seznamu, odstranění/obnovení scrolleru,
    SSR bez JS) a stávající /vapor-events — celkem 3 prošlé scénáře.
    Vlastník je native Vapor, List a VirtualScroller zůstávají VDOM přes interop.
    Cílený lint bez chyb a nových varování; existující varování ve starších souborech
    ponechána. Produkční build nebyl spuštěn.
  - [x] C05b — ListRowItem / ListMoveHandle / useListDragAndDrop: scroller a interní
    handle používají veřejný element, dynamický řádek a moveHandleTarget společný
    resolver DOM targetů (včetně explicitního element u Vapor komponent).
    Draggable se registruje jednou při mountu, po nextTick kvůli parent scroller refu.
    Root a handle jsou stabilní po dobu života řádku; změna vyžaduje remount.
    Start predicate ověřuje aktuální reorderable/disabled bez nové registrace.
    Cleanup ruší draggable, samostatný PointerSensor,
    ghost, scroll listener a čekající animation frames; zrušení nepotvrzuje přesun.
    Aktivní drag vytváří jednou useListStore v lifecycle Listu. Řádky získávají
    createDraggable ze storu; samostatný injection key není potřeba. Helper dostává
    refs a callback explicitně a nevolá zpětně useListStore. Virtualizační
    unmount zdroje ponechá probíhající session; po dropu se odpojená registrace zničí.
    Unmount Listu, výměna scrolleru či odstranění zdroje z dat tah zruší.
    Regrese: odscrollování o 6000 px, ověřený unmount zdroje při zachovaném ghostu,
    dokončení přesunu za stou položku a zrušení Listu s již odmountovaným zdrojem.
    Po této opravě prošlo všech 9 dev E2E scénářů dragování, List DOM a submit cest.
    Stav dragování se nastavuje při skutečném startu pro interní i vlastní handle.
    Drop target se ukládá synchronně, vizuální animace běží v RAF; rychlé puštění
    nečeká na vizuální aktualizaci. DOM hledání je omezené na vlastní seznam.
    Ověření: /vapor-list-drag — přesun v obou režimech scrolleru, vlastní native Vapor
    rowComponent, změna konfigurace rootu/handle přes remount, unmount při tahu,
    remount a SSR bez JS. Test povolení mění reorderable bez remountu handle.
    Lint bez chyb a nových varování.
    List a VirtualScroller stále VDOM interop, nikoliv dokončená native migrace rodiny.
    Produkční build nebyl spuštěn.
- [x] C06 — Tree: `TreeNode`, `TreeDropIndicator`, `useTreeDragAndDrop`;
  QueryBuilder: `QueryBuilderInline`, `QueryBuilderRow`. Audit skutečných typů refů,
  drag targetů a cleanupu při remountu.
  - [x] C06a — QueryBuilderItem/Group zveřejňují vlastní DOM element;
    QueryBuilderRow používá explicitní element místo unrefElement(componentRef).
    Zánik řádku během tahu a pointercancel uklidí klon, senzory a autoscroll
    bez potvrzení přesunu. I drop bez platného cíle resetuje draggedItem.
    Inline přidávání načítá aktuální DOM target až při opožděném otevření editoru;
    pending timer se ruší při unmountu, stejně v QueryBuilderGroupInline.
    Ověření: tři dev E2E /vapor-query-builder-dom scénáře — přesun, unmount při tahu,
    remount, SSR bez JS, otevření inline editoru a syntetický touchcancel.
    Native Vapor vlastník, QueryBuilder a editor stále VDOM interop.
    Lint bez chyb a nových varování; produkční build ani typecheck nebyly spuštěny.
  - [x] C06b — TreeNode používá explicitní element custom rootu; registrace vzniká
    při mountu a povolení DnD se kontroluje při začátku tahu. Store vlastní jednu
    správu aktivního tahu, která přežije odstranění zdrojového uzlu virtualizací.
    Scroll listener i autoscroll míří na element VirtualScrolleru. Unmount/Escape
    uklidí klon, senzory, listenery, RAF a hover-expand timer bez přesunu.
    TreeDropIndicator pracuje s nativními elementy. Viditelné uzly jsou computed
    i pro SSR; synchronní setup používá onServerPrefetch pro dokončení inicializace.
    Ověření: šest dev E2E /vapor-tree-drag scénářů — place/parent, Escape,
    unmount/remount, SSR bez JS, drop po odscrollování zdroje v 1 000 uzlech
    a odezva po dropu; rozbalení/sbalení po přidání prvního dítěte dropem. Regresní test reprodukoval 5,8s blokování UI: async
    flattenTreeNodes publikovalo metadata po každém uzlu. Metadata se nyní
    připraví mimo reaktivní stav a zveřejní jedním zápisem po průchodu.
    Publikovaná mapa je reactive: useModel lokální objekt sám hluboce neobalí,
    ale přepnutí isCollapsed musí aktualizovat viditelné uzly.
    Test kontroluje správné pořadí i následnou interakci do 1,5 s.
    Sestavení hierarchie indexuje děti podle cesty rodiče jedním průchodem;
    neprohledává všechny uzly pro každého rodiče. Zachovává pořadí a identity
    objektů. Izolovaná kontrola 1 000 kořenů: 1 002 000 → 2 000 čtení metadat.
    Lint bez chyb; stávající brace-style varování ve flatten-tree-nodes zůstává. Tree/VirtualScroller zůstávají VDOM interop,
    fixture má native Vapor vlastníka i custom root uzlu. Produkční build ani
    typecheck nebyly spuštěny.
- [x] C07 — Zbývající template refs/VueUse DOM vstupy projít v každé migrované rodině
  z inventáře; ověřit `v-if`, více rootů, Teleport a zánik elementu.
  - [x] C07a — TextInput, IconInput, ColorInput a YearMonthSelector používají pro
    kotvy menu explicitní element z InputWrapper/Field místo unrefElement(componentRef).
    Typ TextInput wrapper ref odpovídá komponentě. Zachované nativní border targety
    pickerů a mount lifecycle bez dalších watcherů.
    Ověření: dva nové dev E2E /vapor-input-anchors scénáře — otevření a poloha všech
    čtyř menu, remount s otevřeným pickerem, SSR bez JS; dva stávající input DOM
    regresní scénáře také prošly. Cílený lint čistý. Fixture má native Vapor vlastníka,
    vstupy a jejich wrappery zůstávají VDOM interop. Produkční build ani typecheck
    nebyly spuštěny.
  - [x] C07b — Table/Pivot: komponentové scroll/header refs, resize a autofit.
    DOM část upravena: HorizontalScroller a VirtualScrollerVertical/Grid expose element;
    Table autofit/scroll sync/resize používají explicitní viewport, Pivot scroll sync
    explicitní scroller refs a nativní hlavičky. Odstraněno hledání scrolleru přes $el
    a CSS třídu. Custom scrollerComponent musí zveřejnit element vedle scroll API.
    Pivot nyní čeká na počáteční transformaci dat před renderem/hydratací.
    Inicializace se uvolní i při performance warning, aby uživatel mohl výpočet
    potvrdit; další reakce na data zůstávají ve watcheru. Duplicita obsahu opravena.
    Klientské otevření zobrazuje počáteční XL loading až do dokončení fetch i
    transformace; SSR/hydratace dál čekají na immediate inicializaci. Loading slot
    dostává isInitialLoad, během načítání se nezobrazuje prázdný stav.
    Resize v Table/Pivot ruší listenery i globální styly při pointercancel,
    unmountu hlavičky a vyprázdnění root refu bez uložení rozpracované šířky.
    Ověření: E2E /vapor-table-pivot-dom — scroll sync, resize/justify po hydrataci
    a remountu, SSR bez JS, jediný obsah po hydrataci, zrušení resize a Run anyway.
    C07b uzavírá explicitní DOM reference, nikoli převod všech komponent do Vaporu.
    Omezení smíšeného renderování zachycené při C07b je samostatně ověřené
    na rc.9 v I01 níže. Při původním C07b nebyly produkční build ani typecheck
    spuštěny.
  - [x] C07c — TreeDms, MenuConfirmation, ElementMovement a zbývající DOM vstupy;
    odlišit nativní refs od komponentových, ověřit lifecycle a SSR.
    - [x] ElementMove a ElementResize jsou nativní Vapor komponenty.
      useElementMovement přijímá pouze nativní HTMLElement/ref/getter; resize měří
      aktuální DOM ref. Odstraněn setup-time snapshot refu a zbytečný async import.
      Pointer lifecycle, RAF sampling a zrušení gest zajišťuje Dragdoll.
      Helper přijímá moveHandle/resizeHandles jako nativní ref/getter; Menu předává
      explicitně zveřejněný element hlavičky. Rozměry a limity stále počítá UI.
      Při release se dopočítá poslední pozice, při zániku se senzor i draggable zruší.
      E2E ověřuje přesun, resize, unmount během obou gest, remount a SSR bez JS.
      Ukázka /vapor-element-movement je v navigaci.
    - [x] CornerResize/useCornerAdjustment: nativní Vapor, DOM ref pro handles,
      Dragdoll PointerSensor/RAF místo vlastních mouse/touch listenerů. Zachované
      směry, step, inverted a limity; release dopočítá poslední hodnotu, zánik scope
      ruší aktivní gesto a obnovuje user-select. E2E zahrnuje SSR a unmount během tahu.
      Ukázka /vapor-corner-resize je v navigaci.
    - [x] TreeDms externí drop: TreeDmsDropZone je nativní Vapor a useDropZone
      pracuje přímo s DOM refem Tree. Dragover hit-test je dávkovaný přes useRafTask;
      drop načte složku z release souřadnic před vyčištěním dragMeta. Scope cleanup
      ruší čekající RAF i hover-expand timer. Zbytek TreeDms zůstává VDOM interop.
      E2E /vapor-tree-dms-drop ověřuje soubor do složky, remount, SSR a navigaci.
      Známé SSR varování virtual scrolleru min-height (36px vs 0px) zůstává k prověření;
      test ověřuje serverový obsah, nikoli absenci hydration warnings.
    - [x] MenuConfirmation je nativní Vapor. Focus používá explicitní Btn.focus()
      místo unrefElement(componentRef). Btn vlastní dynamický button/NuxtLink kořen;
      lokální DOM direktiva zveřejňuje element bez pomocného markeru a bez $el.
      getElement() nyní vrací nativní element (dříve instanci resolveru); interní
      konzumenti starého návratového typu nebyli nalezeni. Resolver a jeho picker
      byly odstraněny. NuxtLink zůstává v běžném režimu včetně prefetch;
      deklarované replace se nově předává routeru. Konfigurace přes
      getComponentProps/getComponentMergedProps, presety a sloty zůstávají.
      MenuProxy nadále používá VDOM interop pro Menu a Dialog. Btn přešel v D05x
      na nativní Vapor. Ukázka
      /vapor-button (+ loading) ověřuje submit, loading, sloty, styly, odkazy,
      přepnutí kořene, remount a focus z Vapor rodiče i lokalizovaný SSR.
      E2E /vapor-menu-confirmation: desktop Menu, mobilní Dialog, autofocus,
      Enter, druhý krok, hide/reset, remount, focus odkazu, SSR a lokalizovaná navigace.
    C07c uzavírá DOM kontrakty těchto komponent, nikoli převod všech závislostí
    na Vapor. Otevřené ověření hydratace Tree/TreeDms eviduje HY01 níže.

## D. Sloty, VNodes a dynamické komponenty

- [x] D01 — Zachované skládání `<Tabs><Tab name="alpha">…</Tab></Tabs>`.
  `Tab` registruje reaktivní metadata a explicitní DOM kotvu u nejbližšího
  vlastníka přes provide/inject; `items` ani pojmenované obsahové sloty nejsou
  potřeba. `useTabsUtils` nečte ani nevykonává sloty a nepracuje s VNodes.
  Pořadí navigace sleduje DOM pořadí deklarací, včetně keyed Vapor přesunů.
  Bez v-model je aktivní první Tab; explicitní neplatný model neměníme.
  Deklarace se renderují před navigací i na serveru, navigace je vizuálně nahoře.
  Vykonává se pouze obsah aktivního panelu; neaktivní deklarace registrují metadata.
  Vlastní navigation slot dál dostává ui/tabs, default slot Tab nabízí scoped tab.
  Příklad /vapor-tabs?mode=basic obsahuje doslovné vnořené Tab bez modelu
  a další vnořené Tabs pro kontrolu izolace providerů. Varianty bez query a
  mode=plain/filtered pokrývají v-for, změny props/pořadí, v-if odebrání/přidání,
  cache, vlastní navigaci/fallback, remount, ui styly a SSR/hydrataci.
  Všechny čtyři varianty jsou v lokalizované navigaci.
  - [x] D01a — Tabs, Tab, TabPanel i TabsNavigation jsou nativní Vapor.
    Každý Tab drží nativní KeepAlive svého deklarativního TabPanel; společný
    registr řídí LRU napříč panely a promítá include/exclude nad Tab_<name>
    do retence. Zachováno max, identita/stav, aktivace/deaktivace a cleanup
    při odebrání deklarace, vyřazení z cache a unmountu vlastníka.
    Pojmenované VDOM kopie komponent ani ruční h/render/appContext nejsou potřeba.
    Ověření na Vue 3.6.0-rc.7: skutečné mount/activate/deactivate/unmount hooky,
    LRU vyřazení, reactive inject, lazy obsah, vnořené providery a SSR.
    Btn v navigaci je od D05x nativní Vapor; celý H05 tím stále není uzavřený.
  - [x] D01b — Přístupnost Tabs (2026-10-12, RC.11). Pojmenovaný tablist,
    stabilní propojené tab/tabpanel ID, jediný roving tab stop, přeskočení disabled
    položek, Left/Right s wrap, Home/End a manuální Enter/Space aktivace.
    activationMode=automatic zapíná výběr při focusu; default je manual.
    Tab přechází do aktivního panelu, Shift+Tab se vrací na vybranou položku.
    Po mountu se veřejný wrapper navigace přesune před panely; deklarace se
    nadále registrují první pro shodné SSR/hydratační hodnoty.
    Odebrání aktivní deklarace vybere další enabled položku a obnoví focus;
    disposal celého vlastníka model nemění. Cache a scoped sloty jsou zachované.
    Vlastní navigace používá TabsNavigation; label slot binduje poskytnuté btnProps.
    /vapor-tabs?mode=keyboard/automatic ověřuje klávesnici, overflow, dynamické
    změny, ID, SSR a lokalizované odkazy. Axe doplňuje skutečné focus testy.
- [x] D02 — useDialog spravuje owner-scoped záznamy pro explicitní DialogHost;
  bez getCurrentInstance/VNode root, h/render a ručního appContext. Volající musí
  pod vlastníkem vykreslit `<DialogHost :dialogs>` z vráceného seznamu. Před změnou
  nebyl v aplikaci ani vrstvách žádný zbývající volající; externí konzumenti musí
  doplnit host. elRef je nyní explicitní target dialogu, nikoli cíl renderování.
  createDialog zachovává props/children a vrací close() respektující beforeHideFnc.
  Legacy children jsou VDOM render funkce nebo komponenty; pro nativní obsah je
  deklarativní slot hostu. Host i Dialog zůstávají VDOM interop hranice.
  /vapor-programmatic-dialog ověřuje reactive inject, default/named scoped sloty,
  více dialogů, close guard, onHide jednou, Escape, disposal/remount, SSR a navigaci.
- [x] D03 — Historická mezifáze, nahrazena D07 (2026-09-29):
  `ui.store.ts/setTempComponent` byl ponechán jako explicitní VDOM
  interop hranice. Jediným interním volajícím je `useRenderTemporaryTableCell`
  pro autofit sloupců. Přijímá VDOM komponenty/render funkce; slotRenderFnc
  musí vracet VNodes, nativní Vapor sloty nejsou podporované. Odpojený root
  dědí appContext, nikoli lokální provide volajícího vlastníka.
  Cleanup zůstává volatelný a nově poskytuje vlastní `element`; měření už nehledá
  globální #tempComponent. Každý požadavek má nezávislý, skrytý inertní DOM root,
  SSR vrací no-op handle. Měření uklízí v finally, opakovaný cleanup je bezpečný.
  /vapor-table-measurement ověřuje souběžné šířky, VDOM slot z Vapor vlastníka,
  hlavičku/text/checkbox, cleanup při chybě, opakování, SSR a lokalizovanou navigaci.
  D03 uzavírá pouze opravu izolace a cleanupu měření. Povinný nativní převod
  měřicí cesty sleduje D07; převod celé Table nadále patří do G03 a inventáře.
- [x] D04 — `Inputs/FileInput/FilePreview2.vue`: nativní Vapor s deklarativním
  Dialog místo `useDialog`/`h`. Příklad /vapor-file-preview pokrývá opakované
  otevření/Escape, výměnu obrázku, přechod na video/dokument, odebrání otevřeného
  preview, SSR a lokalizovaný odkaz. Původně ověřený cleanup blob URL už není
  v aktuální staged verzi komponenty; regresní test revokace nyní selhává.
  Stav lifecycle lokálních URL zůstává otevřený, deklarativní render je převedený.
  Dialog, Btn, Separator, CircleProgress a NuxtLink zůstávají interop závislosti.
  Startup warning z useViewport odhalený tímto příkladem řeší F08.
- [x] D05 — Forwarding slotů ve všech wrapperech: fallback se nesmí potlačit prázdným
  předaným slotem. Ověřit scoped props, podmíněné sloty a změny jejich přítomnosti.
  Pouhá kontrola existence slotu nevyžaduje přepis. Tree už předává content pouze
  při přítomném node slotu; default label je pokrytý klientským testem.
  - [x] D05a — DynamicInput je nativní Vapor; prepend/append předává jen při
    existenci slotu a zachovává scoped props (clear/focus). Props a attrs předává
    explicitně dynamickému vstupu pomocí mergeProps, bez automatického fallthrough
    na DOM kořen (placeholder původně způsoboval hydration mismatch).
    Veřejné focus/select používá explicitně typovaný exposed kontrakt.
    /vapor-dynamic-input ověřuje nepřítomné/podmíněné sloty, scoped callbacky,
    string → number, model, focus/select, remount, SSR attrs a lokalizovanou navigaci.
    Regrese editorů Table/Pivot je v vapor-table-focus.spec.mjs.
    TextInput/NumberInput a jejich potomci zůstávají VDOM závislosti; širší D05
    a kompatibilita celého component-map API v D06 nejsou tímto uzavřené.
  - [x] D05b — MenuProxy je nativní Vapor s explicitním předáváním props/attrs.
    title slot zachovává scoped hide; header-right je podmíněný a Menu ho
    propouští do MenuHeader. Desktopové Menu i mobilní Dialog zachovávají
    výchozí title po odebrání vlastních slotů. Veřejný expose kontrakt je
    IMenuProxyExpose; Selector už nepoužívá InstanceType nad Vapor komponentou.
    /vapor-menu-proxy ověřuje title/header/default hide, změny slotů za běhu,
    header-right v obou větvích, model, SSR a lokalizovanou navigaci.
    Regrese: MenuConfirmation a otevření/search focus Selectoru.
    Menu a Dialog samotné zůstávají VDOM; širší D05 je stále otevřený.
  - [x] D05c — DurationInput je nativní Vapor s explicitním předáváním props/attrs.
    label/prepend jsou podmíněné; prepend/append zachovávají scoped focus/clear.
    Vlastní append doplňuje vestavěný výběr jednotky. isTouched čte aktuální
    NumberInput ref; focus/blur události se předávají přes wrapper.
    /vapor-duration-input ověřuje zachování milisekund při změně jednotky,
    editaci a prázdnou hodnotu, scoped callbacky, obnovu výchozího labelu,
    readonly, focus/select/blur/isTouched, remount, SSR a lokalizovanou navigaci.
    NumberInput a Menu zůstávají VDOM závislosti; širší D05 je stále otevřený.
  - [x] D05d — SearchInput je nativní Vapor s explicitním předáváním props/attrs.
    defineModel synchronizuje následné změny od rodiče bez druhého update emitu;
    prepend/append zachovávají scoped focus/clear. Podmíněný tooltip slot vrací
    textový fallback po odebrání; prepend vrací výchozí ikonu vyhledávání.
    ISearchInputExpose nahrazuje InstanceType ve store a selection helperu List.
    /vapor-search-input ověřuje model, počet update/clear/enter událostí,
    veřejné focus/select/blur/clear(false), scoped callbacky, fallbacky, remount,
    SSR attrs a lokalizovanou navigaci. Regrese pokrývá List a search focus Selectoru.
    TextInput a jeho potomci zůstávají VDOM; širší D05 je stále otevřený.
  - [x] D05e — FileInput je nativní Vapor s explicitním předáváním attrs do Field.
    Výchozí a empty slot zachovávají scoped openFileDialog/isOverDropZone;
    výchozí slot navíc removeFile. Po odebrání vlastních slotů se vrací
    FileInputInner a podmíněný FileInputEmpty.
    /vapor-file-input a ?multi=true ověřují skutečný file chooser (accept/multiple),
    nahrazení vs. přidání souborů, scoped odebrání, počty událostí,
    drag state/drop přes Field.element, remount bez zdvojených handlerů,
    obnovu fallbacků, SSR a oba lokalizované navigační odkazy.
    FileInputInner navazuje v D05f; Field a preview zůstávají VDOM.
  - [x] D05f — FileInputInner je nativní Vapor; add slot zachovává vlastní obsah
    i výchozí FileInputAdd po odebrání slotu. Render souborů, remove callback,
    single click a podmínky readonly/disabled zůstávají zachované.
    /vapor-file-input-inner ověřuje dynamický fallback, aktualizaci seznamu,
    počet otevření dialogu, režimy editace, SSR a lokalizovanou navigaci.
    Regrese /vapor-file-input ověřuje chooser/drop/remount v single i multi režimu
    přes nový Vapor řetězec. FilePreview a FileInputAdd zůstávají VDOM závislosti;
    širší D05 je stále otevřený.
  - [x] D05g — FileInputSimple a FileInputSimpleInner jsou nativní Vapor.
    Wrapper předává attrs do Field a useFieldUtils dostává explicitní
    Field.controlElement místo implicitního DOM z instance vnitřního scrolleru.
    Blur se předává ven; vnitřní click obsluhuje chooser jednou a zastavuje
    bubbling do rodiče. Obě větve předávají readonly/disabled chipům;
    přílohové tlačítko je v aktuální verzi disabled pro readonly/disabled vstup.
    /vapor-file-input-simple ověřuje focus bez chooseru, focus/blur události,
    skutečný chooser, odstranění souboru, readonly/disabled kliky, přepnutí
    scrolleru, remount, SSR a lokalizovanou navigaci.
    Lokální nevyužívaný placeholder Chip byl přejmenován na PlaygroundChip,
    aby nepřepisoval knihovní chip. Field, FileChip a ScrollArea zůstávají VDOM;
    širší D05 je stále otevřený.
  - [x] D05h — FileChip, FileInputAdd a FileInputEmpty jsou nativní Vapor.
    FileChip inicializuje číselné formátování v setupu; getFileLabel přijímá
    formatter explicitně a popisek je computed. FileInputAdd předává attrs
    explicitně do Btn, aby se click při Vapor fallthrough nespouštěl dvakrát.
    /vapor-file-chip ověřuje reaktivní název/velikost, skutečné stažení lokálního
    souboru a cleanup odkazu, remove, readonly/disabled, potlačení bubblingu,
    SSR a lokalizovanou navigaci. Regrese zahrnuje oba FileInput wrappery
    a fallback FileInputInner. FilePreview navazuje v D05i, FileStringPreview v D05j;
    širší D05 je stále otevřený.
  - [x] D05i — FilePreview je nativní Vapor. Lokální obrázek používá useObjectUrl
    s aktivací po mountu; URL se uvolní při výměně, noPreview a unmountu.
    noDownloadButton nyní platí i pro uložený IFile; upload stavy FileModel
    zůstávají viditelné. FilePreview2 se v tomto kroku nemění.
    /vapor-upload-preview ověřuje načtení remote/blob obrázku, výměnu a přesné
    počty cleanupů, remount, upload progress/chybu/dokončení, download toggle,
    skutečné stažení, remove, SSR a lokalizovanou navigaci. Regrese pokrývá
    FileInput a FileInputInner. ProgressBar zůstává VDOM; širší D05 je otevřený.
  - [x] D05j — FileStringPreview je nativní Vapor. Deklarativní MenuConfirmation,
    reaktivní ikona/obrázek a přepínače actions/editable zůstávají zachované.
    Neúčinné external/to atributy na div a jejich nereaktivní FILES_HOST URL
    byly odstraněny; download nadále obsluhuje existující tlačítko.
    /vapor-file-string-preview ověřuje desktop/mobile potvrzení (Escape/Enter),
    remove emit, výměnu obrázku za dokument, download s novým názvem,
    actions/editable, unmount otevřeného potvrzení a remount, SSR a navigaci.
    MenuConfirmation je v aktuálním checkoutu také Vapor; širší D05 je stále otevřený.
  - [x] D05k — IconPicker je nativní Vapor se zachovanými search/content fallbacky.
    Readonly nyní blokuje změnu modelu; krátký dotaz vyčistí výsledky a odpověď
    pro už změněný dotaz se nepoužije. Search response má explicitní typ.
    /vapor-icon-picker ověřuje podmíněné sloty a jejich obnovu, obousměrný search,
    výběr/readonly, odstranění prefixu ikony, prázdné výsledky, opožděnou odpověď,
    noSearch, remount, SSR a lokalizovanou navigaci. Browser test řídí Iconify
    search odpovědi; nezávisí na živých výsledcích služby. Regrese zahrnuje SearchInput.
    IconPickerIcon tvoří úzkou VDOM hranici pro @nuxt/icon, jehož h() jinak
    mutuje neměnné Vapor sloty. ScrollArea a TextInput zůstávají VDOM; D05 je otevřený.
  - [x] D05l — IconInput je nativní Vapor s explicitním předáním attrs
    do InputWrapper. Pro náhled sdílí VDOM IconPickerIcon s volitelnou velikostí;
    Nuxt Icon interop chyba se tím nepřenáší do inputu. Clear tlačítko volá
    sdílené clear(), takže zachovává model i clear emit.
    /vapor-icon-input ověřuje desktop/mobile hledání a výběr, zavření pickeru,
    externí model, focus/select/blur/clear, readonly, remount, SSR a navigaci.
    Test řídí Iconify odpovědi; regrese zahrnuje samostatný IconPicker.
    InputWrapper zůstává VDOM a širší D05 je stále otevřený.
  - [x] D05m — NumberInput je nativní Vapor s explicitním předáním attrs do
    InputWrapper a podmíněnými label/hint sloty. Append slot vzniká jen pro
    skutečný obsah (step/clear/vlastní slot); prázdný slot způsoboval hydration
    mismatch v YearSelector. Scoped prepend/append API,
    maskování, paste a krokování zůstávají zachované. INumberInputExpose
    nahrazuje InstanceType v YearSelector a ověřuje veřejný kontrakt komponenty.
    /vapor-number-input ověřuje českou desetinnou čárku, paste, step 0.5,
    scoped focus/clear, obnovu labelu/hintu, externí model, readonly,
    focus/select/blur, remount, SSR a lokalizovanou navigaci. Regrese zahrnuje
    DurationInput, DynamicInput a YearSelector. NumberInputStep a InputWrapper
    zůstávají VDOM; širší D05 je stále otevřený.
  - [x] D05n — NumberInputStep je nativní Vapor bez nepoužívaných komponentových
    refů. Pointercancel zastaví opakování a scope disposal odstraní globální
    release listenery i při odpojení drženého tlačítka. /vapor-number-input
    navíc ověřuje opakované desetinné kroky, pointer/touch cancel, odpojení
    během držení, úklid listenerů a remount. Regrese NumberInput, DurationInput,
    DynamicInput a YearSelector zahrnuje SSR a lokalizovanou navigaci.
    InputWrapper zůstává VDOM; širší D05 je stále otevřený.
  - [x] D05o — TextInput je nativní Vapor s explicitním předáním props/attrs
    do InputWrapper a podmíněnými label/hint sloty. ITextInputExpose deklaruje
    veřejné focus/select/blur/clear, getInputElement, isTouched a sync API.
    /vapor-text-input ověřuje model, label/hint fallbacky a scoped sloty,
    přepnutí viditelnosti hesla, enter/clear eventy, tooltip podle focusu,
    readonly, remount, SSR a lokalizovanou navigaci. Regrese zahrnuje
    SearchInput, IconPicker, DynamicInput a DOM API/alignment inputů.
    InputWrapper a Menu zůstávají VDOM; širší D05 je stále otevřený.
  - [x] D05p — TextArea je nativní Vapor s explicitním předáním props/attrs
    do InputWrapper a podmíněnými label/menu sloty. Autogrow pracuje nad DOM
    refem; ITextAreaExpose deklaruje focus/select/blur/clear, isTouched,
    getInputElement a updateMask nad aktuální maskou. /vapor-text-area ověřuje
    růst/zmenšování, scoped label/prepend/append/hint, inner/menu sloty,
    tooltip, readonly, externí model, remount, updateMask, SSR a navigaci.
    Varianta ?autogrow=false ověřuje pevné rows a resize-y. Regrese zahrnuje
    TextInput a input DOM API. InputWrapper a Menu zůstávají VDOM; D05 je otevřený.
  - [x] D05q — Společná dávka CurrencyInput, ColorInput, ColorPicker a RangeInput
    převedená na nativní Vapor. Oba inputy předávají explicitně props/attrs
    a podmíněný label slot; veřejná input API mají vlastní expose kontrakty.
    CurrencyInput nevytváří prázdný step append při readonly/disabled.
    ColorPicker odkládá browser-only kapátko za mount kvůli hydrataci; bílá
    a černá nyní používají konzistentní rgba(...) a zachovají opacity controls.
    /vapor-currency-input ověřuje desetinnou masku, krokování, polohu měny,
    scoped focus/clear, readonly, veřejné API a remount. /vapor-color-inputs
    ověřuje preview, RGBA/Tailwind výběr, průhlednost přes RangeInput/NumberInput,
    range krok klávesnicí, scoped sloty, transformTw na blur a remount pickeru.
    Varianta ?mode=tw, SSR i lokalizovaná navigace jsou ověřené; mobilní test
    vybírá barvu přes Dialog. Regrese zahrnuje sdílenou masku a kotvy menu.
    InputWrapper/Menu/Dialog zůstávají VDOM; širší D05 je otevřený.
  - [x] D05r — Společná dávka DateInput, TimeInput, TimeInputPicker,
    InputClearBtn, InputHintContainer a InputErrorContainer je nativní Vapor.
    Date/Time předávají explicitně props/attrs, podmíněné label/append sloty
    a mají typované expose API. TimeInput obnovuje shortcuts fallback; picker
    používá explicitní computed modely a správný prevent-next-is-am-change emit.
    InputClearBtn kotví potvrzení na DOM tlačítka jako sourozence, aby nevznikal
    hydration mismatch ve VDOM Btn slotu. TextInput, TextArea, NumberInput,
    ColorInput a IconInput poslouchají clear místo click; potvrzení se už
    nepřeskakuje ani neztrácí. /vapor-date-time-inputs ověřuje datum, kalendář,
    24h/12h lokalizaci, shortcuts, scoped sloty, readonly, remount a mobilní
    hodiny/minuty. /vapor-input-feedback ověřuje potvrzení/zrušení a jeden
    clear emit v pěti inputech, funkční hint, fallback, error přechody a remount.
    Obě ukázky mají ověřené SSR a lokalizovanou navigaci. V rodině Inputs
    zůstává jediný VDOM SFC IconPickerIcon jako @nuxt/icon hranice; sdílené
    závislosti Btn/InputWrapper/Menu/Dialog/Collapse/DatePicker a širší D05
    zůstávají otevřené.
  - [x] D05s — InputWrapper, jeho tři layouty a InputLabel jsou nativní Vapor.
    Dávka zahrnuje také Field.vue: VDOM slot mezi nativním FileInput a wrapperem
    při návratu na výchozí obsah selhával na insertBefore. Field má typovaný
    wrapper ref a předává label jen při existujícím slotu; FieldWithFormatter zůstává VDOM.
    InputWrapper explicitně rozlišuje vlastní a výchozí label. Proměnné stylů
    jsou dočasně na těle layoutu, aby dev hydratace kořene nevstupovala do VDOM
    rodiče přes resolveCssVars/normalizeBlock. Toto umístění zužuje jejich CSS
    dědičnost; I02 vyžaduje návrat na původní root před uzavřením migrace.
    Tooltip TextInput/TextArea je ve stabilním menu slotu mimo vyměňovaný layout;
    při přepnutí se neduplikuje a zachovává focus/blur chování. Control explicitně
    dědí kurzor wrapperu, včetně WebKitu; readonly/disabled mají vlastní stavy.
    /vapor-input-layouts pokrývá regular/inline/label-inside, resize a odpojení
    prependu, focus/select API, styly, readonly/disabled/loading a remount.
    Navigace nabízí také ?mode=inline a ?mode=label-inside; SSR a lokalizované
    odkazy se ověřují automaticky. Ověření: 21 běhů layout/TextInput/TextArea
    v Chromiu, Firefoxu a WebKitu; 15 regresí date/time/number/currency/color/year,
    12 regresí Field/file/anchor/feedback/text a 2 FileInputSimple prošly.
    Lint čistý; typecheck má stejných 185 diagnostik jako před dávkou.
    VDOM závislosti mimo tuto dávku a D05 zbývají.
  - [x] D05t — Společná dávka deseti prezentačních komponent je nativní Vapor:
    FieldWithFormatter, ValueFormatter, Heading, Separator, Skeleton, Loader,
    LoaderBlock, LoaderInline, ProgressBar a CircleProgress. Loader volí variantu
    přes computed, takže změna prop nově skutečně přepne block/inline SVG.
    ValueFormatter zachovává výchozí i previousValue scoped slot a vlastní
    formatter; FieldWithFormatter uzavírá migraci obou SFC rodiny Field.
    /vapor-presentation-primitives ověřuje reaktivní progress a jeho skutečný
    poměr, label funkci, sloty, UI overrides, varianty, attrs, remount, SSR a
    lokalizovanou navigaci. Všech 6 běhů prošlo v Chromiu, Firefoxu a WebKitu.
    Regrese upload progressu a YearSelectoru prošly. Čtyři nedragové scénáře
    QueryBuilderu prošly; dva pointer drag testy selhaly stejnou geometrií i při
    kontrolním návratu Separatoru na VDOM, takže nejde o regresi této dávky.
    Lint je čistý a typecheck zůstává na stejných 185 existujících diagnostikách.
  - [x] D05u — Mechanická dávka deseti leaf komponent je nativní Vapor: Badge,
    Burger, ButtonGroup, Item, KeyboardShortcut, Checkmark, Close, Indeterminate,
    RadioButton a Radio. Komponenty už používaly deklarativní sloty a explicitní
    modely/DOM refy; kromě srovnání brace stylu Burgeru nebyl potřeba produkční
    refaktor. /vapor-leaf-primitives ověřuje modely, dynamické pojmenované sloty,
    dynamický HTML tag, pointer-dependent shortcut, SVG styly a ref, disabled a
    readonly stavy, remount, SSR a lokalizovanou navigaci. Všech 6 běhů prošlo
    v Chromiu, Firefoxu a WebKitu; dalších 14 regresí Badge, Form, confirmation
    a Button konzumentů prošlo. Lint je čistý a typecheck zůstává na stejných
    185 existujících diagnostikách. Následná oprava uzavřela také MovementElement:
    SSR a hydratace začínají deterministickým `--delay: 0ms`, náhodný interval
    0–2000 ms se nastaví v onMounted. Rodina Movement je tím celá nativní Vapor.
  - [x] D05v — Sedm jednoduchých stavových a pomocných komponent je nativní Vapor:
    FormErrors, PageWrapperLoading, SelectorChip, TableLoading,
    TableTooManyRowsInfo, TableLayout a TableRowGroup. TableTooManyRowsInfo už
    navíc nevykresluje zatoulaný znak za šablonou. /vapor-status-primitives
    ověřuje loading, zavření upozornění, remount, SSR a lokalizovanou navigaci;
    všech 6 běhů prošlo v Chromiu, Firefoxu a WebKitu. Selector a Form regrese
    prošly a Table/Pivot testy potvrdily finální stav po vrácení nebezpečných
    izolovaných markerů. Podmíněné storeové části List/Pivot/Tree a Banner
    zůstávají VDOM, protože převod před jejich rodiči v reálných scénářích
    rozbil aktualizaci drag/loading stavu, unmount nebo slotové akce. Lint je
    čistý a typecheck má stejných 185 existujících diagnostik.
  - [x] D05w — Čtyři další pomocné komponenty jsou nativní Vapor: DrawerTitle,
    DraggableItem, QueryBuilderItemDataTypeShortcut a TableLayoutMeta.
    DraggableItem nahrazuje nefunkční Vapor DOM property binding explicitním
    element refem, nastaví kontrakt `get-item` po mountu a při unmountu ho uklidí.
    /vapor-action-primitives ověřuje drawer model a sloty, dynamický HTML tag,
    DOM kontrakt, reaktivní metadata, remount, SSR a lokalizovanou navigaci;
    všech 6 běhů prošlo v Chromiu, Firefoxu a WebKitu. Osm Table/Pivot regresí
    také prošlo. Tehdejší blokery CRUD tlačítek, Btn a ChipArchived řeší
    navazující D05x. Lint je čistý a typecheck zůstává na stejné výchozí sadě
    diagnostik.
  - [x] D05x — Btn, ChipArchived a čtyři CRUD akční komponenty jsou nativní
    Vapor: CrudBtnAdd, CrudBtnSave, CrudBtnArchive a CrudBtnDelete. Btn používá
    explicitní HTML větve pro button a anchor, nativní Vapor ripple a router
    navigaci se zachovaným replace, target, external a download chováním.
    Tehdejší VDOM adaptér IconRenderer později nahradilo nativní CSS
    vykreslování. Tehdejší runtime omezení nyní řeší dokončené I03 níže.
    Potvrzovací menu CRUD
    komponent jsou sourozenci tlačítka s explicitním target/reference targetem,
    takže sloty nepřecházejí přes dynamický hydration cursor a menu stále kotví
    k reálnému DOM tlačítku. /vapor-button a rozšířený /vapor-action-primitives
    ověřují root přepnutí, navigaci, Iconify, přímé i potvrzované CRUD akce,
    focus, remount, SSR a lokalizované odkazy; 12 běhů prošlo v Chromiu, Firefoxu
    a WebKitu. Dalších 28 regresí pro MenuConfirmation, ripple, Form, leaf
    primitives, Selector a Table/Pivot prošlo v Chromiu.
  - [x] D05y — Rodiny Button a Crud jsou celé nativní Vapor. Přibyly
    BtnConfirmation, CopyBtn, CrudBtnCancel, CrudEditBtn a CrudBtns.
    BtnConfirmation drží oba timeouty explicitně a při zániku scope je ruší i
    resetuje model; CopyBtn čeká s detekcí Clipboard API do mountu, takže server
    a první klientský render zůstávají shodné. CrudBtns předává dětem pouze
    deklarované props, používá správné fallback labely, obsluhuje skutečný
    `archive` event a vykresluje i restore větev. Breakpoint pro scoped loaderType
    čte až po mountu, aby hydratoval serverové `block` bez textového mismatch.
    Rozšířený /vapor-action-primitives ověřuje Clipboard stav, edit/cancel přes
    skutečný Form store, save/delete/archive/restore, scoped sloty, potvrzení,
    timeout cleanup, remount a SSR. Všech 6 běhů prošlo v Chromiu, Firefoxu a
    WebKitu; dalších 15 regresí Btn, MenuConfirmation, ripple, Form a TextInput
    prošlo v Chromiu.
  - [x] D05z — Checkbox, Toggle, Confirmation a Marquee jsou nativní Vapor.
    Checkbox a Toggle používají explicitní template refy pro veřejné focus API;
    skrytý checkbox zapisuje checked a indeterminate jako DOM properties.
    Nový /vapor-control-primitives ověřuje scalar, array, tristate a string modely,
    keyboard/click pořadí, readonly větve, sloty, Confirmation close event a
    Marquee repeat/vertical/reverse, včetně remountu, SSR a lokalizované navigace.
    Všech 6 cílených běhů prošlo v Chromiu, Firefoxu a WebKitu. List a 13
    Table/Pivot regresí prošlo v Chromiu; známé QueryBuilder drag scénáře zůstávají
    mimo tuto změnu. Lint je čistý a typecheck má stejných 181 diagnostik jako
    D05y, bez přidané diagnostiky.
  - [x] D05aa — V jedné dávce převedeno 18 jednoduchých listových SFC:
    ListLoading, ListNoData, ListRowGroup, ListMoveHandle; TreeLoading a
    TreeNoData; TableFilterChips, TableHeaderFreezeBtn a TableTotalRows;
    PivotHeader, PivotColumnFilters, PivotFilters,
    PivotLoading, PivotCollapseBtn, PivotPerformanceWarning a PivotRowHeaderCell;
    QueryBuilderMoveHandler a QueryBuilderBooleanInput. ListMoveHandle má
    explicitní veřejný DOM kontrakt místo InstanceType, který nativní Vapor SFC
    neposkytuje. /vapor-control-primitives nově ověřuje boolean model, remove
    event a move handle v Chromiu, Firefoxu a WebKitu. Dalších 21 Chromium regresí
    ověřuje List, Table/Pivot, Table store/focus, Tree SSR, List drag a QueryBuilder
    SSR. Otevřený HY01 nadále selhává při počáteční hydrataci Tree; nové
    TreeLoading/TreeNoData se v této chybové větvi nevykreslují. TableEmpty a
    PivotEmpty v této dávce zůstaly VDOM kvůli ztrátě obsahového slotu nad VDOM
    Bannerem; TableEmpty přešlo samostatným ověřením v D05ag. Lint je čistý a typecheck
    zůstává na shodné sadě 181 diagnostik jako D05z.
  - [x] D05ab — Dalších 12 listových SFC je nativní Vapor: ListDropIndicator,
    TreeCollapseBtn, PivotRowItem, PivotValueItem, PivotRowItemCell,
    PivotValueItemCell, PivotValueHeader, PivotValueHeaderCell,
    PivotFilterMenuItem, TableTotalsCell, TableHeaderColumnSorting a
    TableHeaderColumnFilteringItem. PivotValueHeader synchronizuje vlastní
    template ref do store a při dispose jej čistí. /vapor-table-pivot-dom nově
    ověřuje totals v server HTML a oddělené row/cell click, Space a Enter eventy.
    Devět cílených běhů prošlo v Chromiu, Firefoxu a WebKitu; celý Table/Pivot
    soubor má 10/10 a filter focus 4/4 v Chromiu. List drag má 6 průchozích
    lifecycle scénářů a dříve evidovanou chybu geometrie virtuálního indicatoru.
    PivotRowHeader byl vrácen na VDOM, protože jeho v-for pointerdown v nativním
    rendereru nespustil resize. QueryBuilderRowInline zůstal VDOM, protože
    existující runtime-vapor normalizeBlock chyba na QueryBuilder stránce
    přetrvává i bez jeho markeru a brání spolehlivému ověření této komponenty.
    Lint je čistý a typecheck zůstává na stejné sadě 181 diagnostik jako D05aa.
  - [x] D05ac — Dalších 9 SFC je nativní Vapor: TableExportBtn,
    TableAutofitBtn, TableSearch, TableTotals, TableHeaderFilterBtnTooltip,
    PivotFilterBtn, PivotTop, PivotExportBtn a MenuHeader. Table/Pivot fixture
    nyní skutečně vykresluje search, export a autofit; SSR kontroluje tyto prvky,
    totals i PivotTop a interakční test ověřuje search model, autofit a otevření
    export menu přes hranice rendererů. Cílené Table/Pivot, filter focus,
    MenuConfirmation a pohyblivé Menu scénáře prošly v Chromiu, Firefoxu a
    WebKitu. WebKit test po úklidu pohybu čte standardní inline CSS deklaraci
    přes getPropertyValue, protože nepřítomný JS alias style.userSelect vrací
    jako undefined; stejný výsledek byl reprodukován i s VDOM MenuHeader.
    TreeSearch a TreeActions zůstaly VDOM a nejsou součástí dávky. Jejich
    dočasné označení odkrylo již evidované HY01 nextSibling chyby a nefunkční
    drag v současném Tree scénáři i po návratu obou markerů. Lint je čistý a
    typecheck zůstává na přesně stejné sadě 181 diagnostik jako D05ab.
  - [x] D05ad — Dalších 6 SFC je nativní Vapor: MenuOverlay, MenuArrow,
    PageTitle, PivotFilterMenuComparator, TableBottom a
    TableTopRemoveFiltersBtn. /vapor-presentation-primitives nově ověřuje
    PageTitle včetně prepend, append a below slotů, remountu a SSR. Rozšířený
    Table/Pivot scénář otevírá menu pro odstranění filtrů; existující focus test
    ověřuje veřejné API comparatoru a menu testy pokrývají overlay, arrow,
    desktop/mobile větve, Escape a SSR. Celkem 37 cílených běhů prošlo v
    Chromiu, Firefoxu a WebKitu. InputBlock zůstal VDOM, protože nativní rodič
    při hydrataci ztratil scoped readonly slot do VDOM MiniCard. Notifications
    zůstaly VDOM kvůli veřejné DOM metodě hide na kořeni TransitionGroup.
    MonthSelectorGrid zůstal VDOM, protože click callback tlačítek uvnitř v-for
    se pod nativním rendererem nevyvolal ani po čistém restartu serveru. Lint je
    čistý a typecheck zůstává na přesně stejné sadě 181 diagnostik jako D05ac.
  - [x] D05ae — Dalších 10 SFC je nativní Vapor: všech 5 komponent DatePicker,
    všechny 3 komponenty Collapse a TableTop s TableToolbar. CollapseContent
    používá explicitní template ref. Date/time scénář nově prochází přepnutím
    kalendáře na měsíce a roky a následným výběrem dne; presentation fixture
    ověřuje otevření, zavření, remount a SSR Collapse. Dotyková regrese zároveň
    odkryla chybějící click po preventDefault na pointerdown v testovaném
    WebKitu. Následná revize odstranila pointerup fallback i timer: DateInput,
    TimeInput a ColorInput ruší pouze dotykový focus na mousedown a otevírají
    picker na click. Vlastní label ruší i nativní předání focusu; klávesnicový
    focus se neodvozuje z posledního dotyku. Automatický refocus při blur/clear
    respektuje přechod z myši na dotyk; explicitní focus API zůstává dostupné.
    TimePicker ponechává vnitřní pole editovatelná. Kontrakt ověřuje
    picker-touch-focus.spec.mjs.
    Původní cílená sada 30 testů prošla v Chromiu, Firefoxu a WebKitu.
    Revize dotykového focusu prošla 49 E2E běhy ve třech enginech; nativní
    scrollovací gesto je ověřené v Chromiu přes CDP (další 2 varianty skip).
    Všech 21 unit testů helperu prošlo. Zbývajících 24 komponentových unit
    testů ve stejné sadě nelze spustit bez Vapor interopu v jejich mount harnessu.
    Lint je čistý a typecheck zůstává na přesně stejné sadě 181 diagnostik jako
    D05ad.
  - [x] D05af — Pět samostatných rodin je kompletně nativní Vapor: Banner,
    Breadcrumbs, MainBar, Navigation a Section. Presentation fixture ověřuje
    odkazy a append/right sloty Breadcrumbs, title/subtitle a čtyři sloty
    MainBar, DOM a sticky stav Navigation, title/subtitle/content/loading
    Section a model, dismiss, counter, remount i SSR Banneru. Banner zůstává
    jediný SFC; Transition bez appear zachová SSR obsah a běžné enter/leave
    animace. Badge poskytuje explicitní getRootElement pro bounce animaci.
    Pivot warning čeká před click kontrolou na data-ready, aby netestoval
    nehydratované serverové tlačítko. Banner revize prošla 9 interaktivními a
    SSR běhy ve třech enginech a 5 širšími Chromium regresními scénáři pro
    Pivot, Table, Form a dialogové akce. Lint je čistý a typecheck zůstává na
    stejné sadě 181 diagnostik jako D05ae.
  - [x] D05ag — Batch 20 dalších SFC: DraggableContainer, Drawer, List,
    ListSearch, SelectorInner, SelectorMenu, VerticalScrollPicker,
    YearMonthSelector, PageWrapper, PageDrawer, TablePagination,
    TableFilterChip, TableOptionsDialog, TableQueryBuilderBtn,
    PivotFilterMenuValue, TableCell, TableEmpty, TableHeader, TableHeaderCell a
    TableHeaderFilterBtn. DragAndDrop, Drawer, Page, Selector, ScrollPicker a
    YearMonthSelector jsou tím kompletní; List je 7/9, Table 29/39 a Pivot 20/25.
    DraggableContainer zapisuje veřejné DOM metody po mountu a při dispose je
    odstraňuje. Drawer předává attrs explicitně kořeni v Teleportu; DOM refs
    používají useTemplateRef, programaticky přiřazovaný referenceEl zůstává
    shallowRef. Nové scénáře ověřují reorder/no-drop, Drawer a Page modely,
    Table pagination/filter chip/query-builder dialog/options/empty stav a
    YearMonthSelector. Firefox prošel všech 35 relevantních testů; po čistém
    restartu prošlo všech 18 tabulkových Chromium testů. WebKit prošel funkčními
    kontrolami, ale jeho dev runtime hlásí u ResizeObserveru nedoručenou
    notifikaci jako pageerror v List/Selector měřicích scénářích.
    Form, FormControls, ListContent, PivotContent a TableQueryBuilder byly po
    izolaci vráceny na VDOM: FormControls hydratuje native Btn fragment chybně,
    ListContent ztrácí scoped row a inline TableQueryBuilder opakovaně padá na
    čtení `nodes`. Konkrétní Table resize repro pro I01 po převodu hlavičky
    prochází, obecné omezení Vapor → VDOM cleanupu zůstává otevřené. Lint je
    čistý a typecheck odpovídá stejné sadě 181 diagnostik jako D05af.
  - [x] D05ah — Batch 20 SFC převedl celý QueryBuilder řetězec (9 zbývajících
    komponent), Tree, TreeActions, TreeDropIndicator, TreeNode, TreeSearch a
    TreeSelectCheckbox, oba editory sloupcového filtru, TableQueryBuilder,
    PivotContent a VirtualScrollerVertical. QueryBuilder je tím 12/12 a
    VirtualScroller 2/2; Tree má 9/9 nativních SFC, Table 32/39 a Pivot 21/25.
    QueryBuilder drag test nejdřív posune responsive cílový řádek do viewportu
    a porovnává ukazatel s produkčním ořezem na viditelnou hranu. Nová
    lokalizovaná Tree varianta ověřuje search, collapse/expand all a vícenásobný
    checkboxový výběr. Chromium prošlo QueryBuilder, Tree a 18 Table/Pivot
    scénáři, Firefox celou QueryBuilder/Tree i 18testovou Table/Pivot sadou.
    WebKit prošel všemi hierarchickými QueryBuilder scénáři s delším limitem pro
    hydrataci dev fixture a také všemi funkčními Table/Pivot kontrolami; sedm
    testů hlásí pouze známý `ResizeObserver loop completed with undelivered
    notifications` pageerror. HY01 zůstává očekávaná hydration odchylka Tree.
  - [x] D05ai — Poslední rendererový batch převedl 34 SFC v rodinách Card,
    Dialog, Form, InputBlock, Inputs, List, Menu, MonthSelector, Notification,
    Pivot, ScrollArea, Table, Tooltip a TreeDms; zahrnuje také sdílený
    IconRenderer. PivotEmpty jako čistě šablonová komponenta dostal explicitní
    script-setup Vapor marker. Kontrola všech 233 komponentových `.vue` souborů
    nyní nehlásí žádný SFC bez Vapor kompilace a v komponentách nezůstává
    createReusableTemplate. Programatický DialogHost drží pouze izolovaný
    kompatibilní adaptér pro uživatelský legacy render-function obsah.
    QueryBuilder má vlastní RAF autoscroll obou os a během scrollu hledá nejbližší
    platný drop target. Selector a MenuProxy zachovávají opakovaný autofocus i
    přepnutí mobile/desktop. Finální Chromium průřez prošel 31/31 scénářů a po
    opravě stabilního `name` filtračního inputu dalších 20/20 QueryBuilder,
    Table a Pivot scénářů;
    Firefox prošel 3/3 citlivé scénáře a WebKit ve stejných 3/3 splnil funkční
    assertions. Selector test ve WebKitu následně zachytil pouze známou dev
    diagnostiku `ResizeObserver loop completed with undelivered notifications`.
    Lint je čistý a typecheck zůstává na stejné sadě 181 diagnostik jako D05ah.
- [x] D06 — Typy a API přijímající komponenty (`component-map`, rowComponent, dynamické editory):
  ověřit Vapor typy, props, sloty a expose refy. Samotný import typu VNode není runtime blocker.
- [x] D07 — Native Table measurement (2026-09-29). `TableMeasurement.vue`
  renders hidden, inert native Vapor cells inside the owning Table; requests
  are scoped to that owner and slots are forwarded declaratively. Local
  provide/inject, inherited styles and the row/column/value/index/customData
  slot contract remain available. UI class/style callbacks receive their
  normal row/column arguments. Text, checkbox, header and display-component
  fallbacks use native templates.
  `useRenderTemporaryTableCell` queues independent requests, measures their
  explicit DOM refs after rendering and removes them in `finally`. Disposal
  cancels pending work without changing column widths; stretch redistribution
  and deferred scroller updates stop when the Table is removed. SSR performs no DOM work.
  `TableColumn.autoFit` receives explicit measurement callbacks captured in
  setup. Toolbar/exposed fitColumns, forced initial autofit and resize-handle
  double-click use that same path. The detached VDOM renderer and
  `ui.store.setTempComponent` were removed, with no compatibility renderer left.
  The native-only unit fixture mounts with `createVaporApp` without the interop
  plugin (2 tests). Production Chromium passed 22 functional checks across
  measurement and Table/Pivot DOM suites; I04 was a separate expected
  failure at this checkpoint and is now resolved below. Firefox passed all 4
  measurement checks. WebKit passed all functional assertions, but 2 of its 4
  tests failed the final error check on the existing
  `ResizeObserver loop completed with undelivered notifications` diagnostic.
  Coverage includes changed slot content, concurrent widths, error cleanup,
  cancellation/remount, SSR, hydration and both localized navigation links.
  Consumer migration: use the exposed `Table.fitColumns` API; direct callers
  of `TableColumn.autoFit` must supply `measurements` rather than `slotRenderFnc`.
  Full UI bundle independence remains H05; visible row-slot lifecycle is covered by I04.

## E. Lifecycle, direktivy a události

- [x] E01 — Vlastní virtualizační engine byl nahrazen TanStack Virtual.
  VirtualScroller.vue je nativní Vapor a obsahuje virtualizer řádků i sloupců
  s původním vertikálním výchozím chováním. Pro dvě osy se v Table nastavuje
  scrollerConfig.virtualizeColumns: true. Grid wrapper, jeho registrace i samostatný
  typ props byly odstraněny; props jsou společné v IVirtualScrollerProps.
  Původní pole výšek, prefixové součty, ruční overscan a vlastní ResizeObserver
  byly odstraněny. TanStack měří DOM refs až po vložení elementů; měření nulové
  výšky před vložením ve Vapor jinak chybně kompenzovalo scroll.
  initialRect určuje omezený SSR výřez; initialRowsRenderCount nyní znamená přesný
  počet řádků, nikoliv dřívější počet + 1. Bez JS jsou vidět data, po mountu
  virtualizer sleduje skutečné rozměry. Statický kořen odděluje stylovaný viewport
  od VDOM vlastníka; veřejné atributy a element ref míří na viewport. Bez patchů Vue.
  Zachováno API scroll/clear/rerender/measure/renderOnlyVisible; pro dvě osy nabízí
  scrollToColumn a scrollToCell. Table synchronizuje X zápisem scrollLeft, takže
  nepřepisuje Y starou hodnotou z VueUse. Kartový layout dostává všechny sloupce.
  /vapor-table-fetch-more: opožděné stránky, skip/lastRow, veto, žádné souběžné
  requesty, zachování scrollu, výšky buněk, EOF, vyhledávání a reload.
  fullscreen=true: 20 z 1 000 řádků × 80 sloupců; automatické doplnění viewportu,
  nové doplnění po zvětšení okna, obě osy a všech 50 stránek bez duplicit.
  /vapor-virtual-grid: 1 000 × 80, recyklace obou os, vzdálená buňka, resize,
  zarovnání hlavičky, remount a SSR bez JS. /vapor-virtual-scroller dále ověřuje
  malé seznamy, změny výšek, dvě instance, clear/append a kompatibilní API.
  - [x] E01a — Veřejné API VirtualScrollerVertical a typy Tree (2026-10-12).
    Pět no-op metod je nahrazených implementací nad TanStack Virtual. Range
    extractor zachytává reaktivní konfiguraci, aby změna clear/range invalidovala
    memoizaci i bez změny scrollTop. Clear odstraní také sticky řádky v obou
    scrollerech. updateRowHeight měří připojený vlastní řádek synchronně;
    fetchMore zachovává změřené výšky. RAF notifikace jsou owner-scoped a validní
    scroll event obsahuje i klíč 0; noScrollEmit potlačuje také explicitní event.
    Tree používá ITreeScrollerConfig nad IVirtualScrollerProps<ITreeNode<T>>,
    typovaný exposed ref a vlastní rows/rowKey=id. Staré virtualizerOptions se
    pro Tree nahradí main-scroller options; overscan je objekt v pixelech.
    Odstraněné jsou Vertical stuby, any scroller ref a Tree row casty.
    /vapor-scroller-contracts a mode=sticky pokrývají API, SSR, lifecycle a
    konfiguraci Tree; Table mode=vertical doplňuje autofit/remount konzumenta.
  Tree i TreeNode jsou od D05ah nativní; odchylku jejich počáteční hydratace
  nadále sleduje HY01. Samostatný sticky VirtualScrollerVertical pro Pivot je
  od D05ah také nativní Vapor.
- [x] E02 — Registrace listenerů bez VNode lifecycle:
  - [x] HorizontalScroller a VerticalScroller jsou nativní Vapor. Wheel listener
    se váže v setup přes explicitní DOM ref; resize měření používá useRafTask
    s cleanupem. Oba scrolery vystavují element, scroll, measure a rozměry.
    useScrollerScroll řídí držení šipek přes RAF s časově škálovanou rychlostí,
    zastaví při pointerup/pointercancel/blur/dispose. Scrolled sleduje každou změnu
    pozice správné osy; isOverflown nyní skutečně odráží přetečení dané osy.
    /vapor-scrollers ověřuje počáteční a řízený model, relativní scroll, wheel,
    držení šipek/cancel, změnu rozměrů, odpojení listenerů, remount a SSR/hydrataci.
    Šipky používají nativní Btn od D05x.
  - [x] YearSelector je nativní Vapor. Wheel listener je registrován v setup nad
    useTemplateRef<HTMLDivElement> menu obsahu; otevírání míří na explicitní
    NumberInput.getInputElement(). Opakování změny roku má scope cleanup a končí
    při pointerup/pointercancel/blur, zavření menu i sync(). Sync používá model ref,
    nikoli původní prop. NumberInput je nativní od D05m a Btn od D05x; Menu
    zůstává VDOM závislostí.
    /vapor-year-selector: desktop/mobile, ruční zadání, externí model, předchozí/další
    rok, wheel bez změny vybraného data, výběr, Escape/reset, hold/cancel/close,
    odpojení listeneru po unmount, remount, SSR a hydratace.
- [x] E03 — TableRow, TableHeaderColumnFiltering a PivotFilterMenu používají
  explicitní ref/focus API místo @vue:mounted a čtení VNode instance.
  Editor buňky zaměří vlastní DOM control po aktualizaci DOM a umístí kurzor na
  konec textu; funguje i nativní input jako root vlastního editoru. DynamicInput
  předává select() svému vstupu. Filtry mají registry refů podle stabilního ID,
  zaměřují nově přidanou podmínku i jedinou existující podmínku po otevření.
  Pivot už nepoužívá index jako klíč filtru. Odložený focus se při unmount ruší.
  TableContent vyhodnocuje klávesy podle event.target uvnitř vlastní tabulky;
  sdílený activeElement po autofocusu mohl zůstat neaktuální a ignorovat Escape.
  /vapor-table-focus ověřuje opakovanou editaci přes VDOM TextInput i native Vapor
  editor přes dvojklik, pozici kurzoru, výběr textu, Escape, skutečná menu Table/Pivot, přidání druhé podmínky,
  opětovné otevření, SSR bez JS a lokalizovanou navigaci.
  Jde o odstranění lifecycle blokátorů; DynamicInput je od D05a nativní Vapor,
  zatímco TableRow a filtry zůstávají VDOM komponentami pod testovaným Vapor
  vlastníkem.
- [x] E04 — `ripple.directive.ts`: společná DOM logika s VDOM `vRipple` a nativní
  funkční `vRippleVapor`. Vapor čte aktuální binding při kliknutí bez watcheru;
  VDOM aktualizuje binding přes updated. Obě varianty odpojují listener a odstraňují
  rozpracované animace při dispose; disabled native control nereaguje ani na
  syntetický click. `Chip.vue` převeden na Vapor, Btn nadále používá VDOM adaptér.
  Ukázka /vapor-ripple ověřuje false→true→false, animaci, disabled, remove bez
  propagace, přepnutí Chip na odkaz, přímý unmount/remount, SSR a hydrataci.
  Fixture importuje UI Chip explicitně: aplikační app/components/Chip.vue jej
  jinak překrývá. Audit UI/Utilities nenašel další registrované/importované direktivy
  třetích stran; lokální VDOM vRoot v Btn; měření virtualizovaných řádků vlastní TanStack
  mají samostatné DOM lifecycle kontrakty.
  Cleanup vnořeného VDOM potomka při odstranění Vapor wrapperu má samostatnou
  rc.9 regresi I01; původní Table resize repro po převodu TableHeader na Vapor
  prochází jako nativní kontrola.
- [x] E05 — Audit delegovaných událostí a `.stop`/`stopPropagation`:
  Checkbox, Radio, Toggle, clear/remove tlačítka, DatePicker, QueryBuilder, DnD, Tree.
  Ověřit, že zastavení na předkovi neodřízne handler potomka; přímé listenery jen tam,
  kde je vyžaduje konkrétní tok. Neodstraňovat plošně `.stop`. Checkbox a Toggle
  mají od D05z ověřené click a keyboard přechody pod nativním Vapor vlastníkem;
  ostatní uvedené toky jsou ověřené v závěrečném rodinném auditu.
- [x] E06 — Focus/blur/click/pointer pořadí: uchovat opravu Selectoru a pokrýt i touch/pen,
  návrat focusu po zavření, Escape/Enter a listener cleanup. Nepřidávat timeout jako
  náhradu za určení vlastníka focusu.

## F. Závislosti a Nuxt integrace

- [x] F01 — VueUse: ověřit konkrétní používané composables pod nativním Vapor ownerem
  (DOM refs, modely/emits, provide/inject, lifecycle, focus a click-outside).
  Test v komponentě s VDOM potomkem není důkaz kompatibility toho potomka.
- [x] F02 — useInputMask používá přímo IMask s explicitním input/textarea refem
  a cleanupem přes onScopeDispose. Odstraněna vazba na VDOM lifecycle vue-imask;
  headless formátování drží SSR a hodnotu mezi výměnami DOM refu. Nativní Vapor
  příklad /vapor-input-mask ověřuje psaní, kurzor, radix, nulu/clear, remount inputu
  i owneru a přímý callback na odpojeném elementu. Unit/SSR testy pokrývají
  neúplné patterny, izolaci sdílených masek, typed refs a scope cleanup.
  Ověřeny také VDOM NumberInput/CurrencyInput/DateInput a input/textarea DOM regrese.
  Celá rodina Inputs tím není převedená. Širší useInputUtils.spec.ts v tomto
  kroku po opravě prostředí F06 procházel; aktuální stav po převodu SFC řeší F09.
- [x] F03 — Floating UI a scroll knihovny (`@floating-ui/vue`, TanStack virtual,
  perfect-scrollbar): ověřit element refs, resize, Teleport, scroll, cleanup a SSR.
- [x] F04 — DnD závislosti (sortablejs, dragdoll, eventti, mezr): ověřit použité integrační
  cesty, registry DOM elementů, pořadí událostí a cleanup.
- [x] F05 — Nuxt autoimporty, registrace komponent, generované defaulty a typy ověřit při
  konzumaci UI → Utilities jako reusable layers. Nezavést importy zpět do aplikace.
- [x] F06 — Vitest používá ESM Vue/renderery/test-utils se sdílenou reaktivitou;
  Node/CJS vstup Vue preview neexportuje Vapor API. Client prostředí happy-dom
  má explicitní NODE_ENV=test, aby Nuxt production define nevypínal dev setup-ref
  unwrapping a stuby. tests/unit/vapor-runtime.spec.ts mountuje zkompilovaný Vapor
  přes createVaporApp a ověřuje model/scoped slot přes VDOM test-utils owner.
  Delegované události vyžadují připojení do document; VTU owner má DOM kořen,
  protože jeho VNode traversal neumí přímo kořenovou Vapor instanci.
  V tomto kroku kompletní Vitest sada: 28 souborů / 138 testů prošlo. Bez patchů závislostí
  a změny jejich verzí; layout, hydrataci a interakce dál ověřuje Playwright.
- [x] F07 — Released integration upgrade (2026-10-11): Nuxt 4.6.1 in the app,
  UI and Utilities; matched Vue 3.6.0-rc.11 overrides and Test Utils 4.3.3.
  Removed the preview URL, obsolete Vitest environment alias, redundant test.env,
  unused vue-imask dependency and missing script/generator targets. Retained
  ESM aliases, client test-mode define, inlined Vue consumers and deduplication
  after regression trials showed they are still needed. Typed route targets use
  `{ path }` for arbitrary localized paths and generic router types in reusable
  UI. Template-only helper imports are explicit: the newer Vapor compiler emits
  prop lookups that Nuxt's VDOM template autoimport addon does not recognize.
  Validation: 306 unit tests; 250 functional production Chromium cases across
  the broad sweep and targeted repairs, plus one existing Tree HY01 expected
  failure; 57 functional development cases across three browser engines, plus
  one HY01 expected failure per engine. Final build and both repaired suites
  pass; affected lint passes and typecheck retains the same 39 baseline diagnostics.
  See [runtime/cleanup record](research/nuxt-vapor.md).

- [x] F08 — useViewport při inicializaci UI store z Nuxt pluginu používá
  onNuxtReady místo komponentového onMounted. Odhad z client hints/cookies/device
  zůstává stabilní během SSR a hydratace; skutečné rozměry se načtou až poté.
  /vapor-viewport ověřuje SSR prioritu hints/cookies, aktualizaci rozměrů po
  hydrataci, resize cookies, reload a absenci lifecycle/hydration varování.
  width/height zůstávají odhadem pro inicializaci layoutu, ne živým resize API.

- [x] F09 — Native input component unit mounts (2026-09-29).
  The 24 older component tests have moved from `useInputUtils.spec.ts` to
  `input-components.spec.ts`. They mount through `createVaporApp`, a compiled
  native host and native versions of the original layout/button/day-cell stubs,
  without an interop plugin. The prior VDOM test-utils mounts failed on both
  rc.7 and rc.9 before reaching their component assertions.
  The 25 native cases cover local and controlled models, numeric paste,
  currency beforeinput, textarea emissions, localized date editing and calendar
  navigation/disabled dates. One added case checks that accepting a numeric
  edit does not emit again. Uncontrolled tests install no model listener; their
  one-way ownership contract is tested separately from controlled emissions.
  Calendar assertions wait for actual native leave transitions to remove old
  grids. The 23 shared-helper tests remain in `useInputUtils.spec.ts`; they use
  plain VDOM hosts to verify that reusable helper's existing VDOM contract,
  without mounting native components through test-utils. The full suite passes:
  51 files / 302 tests with `--maxWorkers=2` (the unrestricted run hit Nuxt
  setup-hook timeouts). Affected lint passes; typecheck retains the same 42
  baseline diagnostics. Full validation is recorded under native input component
  unit tests in `docs/testing.md`.

## G. Převod komponent a regresní ověření

Úplný seznam rodin je v [inventáři komponent](vapor-components.md). Rodinu odškrtnout
teprve po kontrole všech jejích SFC a závislostí; složitější rodiny rozdělit na dílčí úkoly.

- [x] G01 — Dokončit nativní řetězec Selector → Field/InputWrapper/InputLabel →
  SelectorInner/SelectorMenu → List/SearchInput/TextInput → menu/scroll komponenty.
- [x] G02 — Samostatně ověřit Pivot: modely, filtry, dynamické editory,
  virtualizaci, závislosti a worker remounty. Podrobné SSR a nativní ověření
  je v závěrečném kontraktním auditu a testovacím záznamu.
- [x] G03 — Dokončit závěrečný kontraktní audit všech rodin podle inventáře.
  Všech 63 rodin má nativní vlastní SFC; samostatný konzument kompiluje všech
  242 komponent jako Vapor. Nativní UI odkazy a runtime ikony I03 jsou ověřené.
  Inventář neznamená pokrytí každé volitelné větve. H05 stále zahrnuje aplikační
  Nuxt root a zbylé framework VDOM helpery.
- [x] G04 — Pro každou rodinu ověřit významné scénáře pod Vapor ownerem; doplnit interop
  test tam, kde hranice zůstává součástí podporovaného API.
- [x] G05 — SSR bez JS a hydratace: stejné počáteční hodnoty, ID, slot fallback, Teleport,
  žádné runtime chyby/hydration mismatch. Prověřit browser-only API i stav mezi SSR requesty.
- [x] G06 — Formuláře: controlled/one-way/local, null/undefined, validace, reset, submit,
  async loading, multi-select, clear a zakázané/readonly ovládání.
- [x] G07 — Overlay/layout: nested menu/dialog, mobilní přepnutí MenuProxy, focus trap,
  návrat focusu, resize/scroll, dlouhé seznamy, poslední řádek, virtualizace a DnD.
- [x] G08 — Sloty a dynamika: slot data, v-if, remount, výměna komponent, asynchronní obsah.
- [x] G09 — Chromium + Firefox + WebKit pro klíčové interakce; touch/mobilní
  viewport, klávesnice a scoped axe kontroly. Toto kolo má 303/303 cold dev
  a 36/36 samostatných nativních případů bez skipped/expected-failure anotací.
  Kompletní produkční ověření a konkrétní rozsah jsou v docs/testing.md.
  Nejde o certifikaci všech volitelných větví nebo celé accessibility.
- [x] G10 — Stejná data/scénáře pro mount/update, paměť, scroll a bundle.
  Čerstvé kolo 2026-10-25 ponechává pouze opakovatelnou opravu Tree; Pivot a Table zůstávají beze změny.
  Opravené VDOM kontroly vybírají správné directive lifecycle adaptéry; starší
  VDOM procenta jsou nahrazená. Stejných 2 000 záznamů a výchozí nastavení:
  1 280 vzorků, 120 SSR/hydratací, 60 DOM parity kontrol a 12 interakcí direktiv.
  Dvě Tree, jedna Pivot a dvě Table hypotézy jsou vrácené. Regrese: 481 passed / 2 staré CDP
  skipy v 31 souborech, nativní konzument 111/111; bez retry/flaky případů.
  Cleanup má 30 remountů na rodinu/variantu a stabilní DOM/listenery.
  Výkon je nadále smíšený proti stejnému optimalizovanému VDOM kódu; Nuxt root
  zůstává odložený. [Metoda, omezení a výsledky](research/vapor-performance.md).

Konkrétní důkazy pro uzavřené auditní body B–G jsou ve
[závěrečném kontraktním záznamu](research/vapor-final-contract-audit.md#coverage-of-the-remaining-audit-gates)
a v [testování](testing.md). Pokrytí významných scénářů není certifikací všech
volitelných kombinací veřejného API.

## H. Uzavření migrace

- [x] H01 — U každé rodiny evidovat finální režim a zbývající interop závislosti;
  žádnou výjimku nevydávat za plně nativní podporu. Každá dočasná VDOM hranice
  musí mít konkrétní otevřený úkol k odstranění z nativní cesty; bez jeho
  dokončení není rodina ani celá migrace uzavřená.
- [x] H02 — Rozšířit guardrail o konkrétní opakované regrese, nikoliv plošný zákaz
  neproblematických API; projít zbývající interní instance/VDOM přístupy.
- [x] H03 — Doplnit příklady a kontrakty pro konzumenty knihovny: initRef ownership,
  update deklarace, DOM/focus API, config a dynamické komponenty.
- [ ] H04 — Vyřešit B08 a případné staré adaptery; odstranit pouze nepotřebné compatibility cesty.
- [ ] H05 — Povinně prokázat plnohodnotné nativní použití UI bez VDOM runtime
  a interopu bundle analýzou a samostatným čistě Vapor scénářem. Dokončit
  nativní cesty všech rodin z inventáře, programatické vykreslování, slotové
  kontrakty, měření Table (D07) i závislosti dosud vyžadující interop.
  Testy pouze pod Vapor vlastníkem s VDOM potomky tento bod neuzavírají.
  Nevyřešená nutná VDOM závislost je blokátor dokončení, nikoliv finální výjimka.
  Samostatný konzument nyní používá createVaporApp bez interopu a zahrnuje všech
  242 UI SFC v grafu. Kritické nativní scénáře jsou v tests/native-e2e.
  Bundle neobsahuje VDOM renderer ani implementaci interopu, ale ponechává
  createVNode a NuxtLink render funkce z framework služeb. Původní prázdný Chip
  probe nahrazují pozitivní `?family=links` a `?family=icons` scénáře. Vlastní UI
  nemá VDOM render importy a nativní bundle nemá Nuxt/Iconify icon renderer.
  I03 a UI routing větve jsou hotové; aplikační Nuxt root zůstává další etapa.
  Viz [rozsah důkazů a hranice bundle](research/native-vapor-audit.md).
- [x] H06 — Před uzavřením migrace projít dočasné workaroundy: pomocné DOM wrappery,
  adaptéry rendererů, náhradní lifecycle cesty a výjimky přidané během převodu.
  U každého znovu ověřit potřebnost, odstranit nepotřebné řešení a pokrýt původní
  problém regresním testem. Přetrvávající omezení doložit minimální reprodukcí,
  konkrétní podmínkou odstranění a u chyby závislosti odkazem na upstream issue;
  samotné označení komponenty jako Vapor tento bod neuzavírá.
  The temporary `div.contents` in VirtualScroller is removed on Nuxt 4.6.1 /
  Vue RC.11. Native and VDOM-root consumers cover SSR/hydration, attributes,
  public element/focus/scroll APIs, layout and remounting. Row measurement now
  uses TanStack's animation-frame ResizeObserver delivery to avoid a reproduced
  WebKit growth/shrink loop; restoring the old wrapper did not fix that loop.
  The current audit also removes DialogHost's VDOM wrapper, asynchronous Tree
  and Pivot setup, unowned global UI listeners and Menu callbacks. Required
  frame delivery, input layout, Tooltip targets, test-runtime settings and
  legacy compatibility are recorded with reasons in the
  [cleanup audit](research/native-vapor-audit.md). Native UI links and runtime
  icons now include their own cleanup and bundle audit. The deferred Nuxt
  application root and external consumer rollout remain separate work.

## Doporučené pořadí

B09 a B10 jsou hotové. Dále C (DOM smlouvy), průběžně B07/B08 → E (lifecycle/direktivy/events) →
D (slot/render architektura) → G (jednotlivé rodiny).
F a regresní scénáře ověřovat průběžně. Pořadí není další schválený implementační úkol;
vybíráme vždy konkrétní bod a po jeho dokončení aktualizujeme tento checklist.

## Upstream pravidla

[Vue 3.6 RC release notes](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1)
uvádějí chybějící veřejné instance properties v komponentových refs, omezení
`getCurrentInstance`, nepodporované `@vue:*`, jiný kontrakt direktiv, rizika
inspekčního vykonávání slotů a delegovaných událostí. Render funkce vyžadují VDOM
interop. Konkrétní návrhy refaktorů výše jsou naše aplikační řešení, ne předepsané
migrační API Vue týmu. Omezení znovu ověřit při změně připnuté verze.

### Poznámka k diagnostice Nuxt autoimportů

Ve Vapor fixture lokální ref pojmenovaný `size` kolidoval s autoimportem lodash
`size`: klientský transform vytvořil při přiřazení v šabloně neplatnou levou
stranu (`condition ? local : imported = $event`). Fixture používá `contentSize`.
Tuto kolizi je potřeba došetřit v F05; přejmenování není obecná oprava transformu.

### Synchronizace 2.3 (2026-10-11)

UI `2.3` do `a8c76e10` a Utilities `2.3` do `0fae53d` jsou začleněné
do větví `2.3-vapor`. Playground nemá samostatnou větev `2.3`.
Převzaté funkční změny:

- Input `variant="cell"`, velikost XS, commit při blur/Enter a zrušení draftu
  přes Escape; přesná čísla v NumberInput, ARIA popisy chyb a hintů, předané
  chyby a opravy formátování. Explicitní emit, touch/focus kontrakt a podmíněné
  sloty z Vapor větve zůstávají zachované.
- Asynchronní uložení celého řádku Table, pending/error stav a opakování
  odmítnutého uložení; výběr sloupců, zarovnání a bezpečné měření názvů polí.
  Sloty dál proudí deklarativně; `renderSlot`, `createReusableTemplate` ani
  VNode mounted hooky z VDOM větve se nevracejí.
- Tree znovu používá nezměněné uzly a metadata. Hledání má vlastní collapse
  stav a nemění uložené nastavení. `canBeDragged` a umístění v `canBeDropped`
  zachovávají zákaz přesunu i při virtualizaci; Vapor DOM API a zrušení aktivního
  dragu při dispose zůstávají zachované. Viditelnost je cached computed s reuse
  shodných výsledků: queued watcher z `2.3` nechával při SSR prázdné řádky.
- Scroller měří změny obsahu, horizontální wheel respektuje skutečnou vzdálenost
  a vnořené svislé scrollování, VerticalScroller používá nativní wheel.
  Osy, explicitní callbacky a RAF cleanup zůstávají zachované.
- PageDrawer, preview URL podle `filesHost`, Escape handler overlayů a společná
  poloha myši v klientských souřadnicích.

Regrese jsou zachované i tam, kde je `2.3` odstranila. Nové lokalizované
varianty jsou `/vapor-number-input?mode=cell`, `?mode=exact`,
`/vapor-table-edit?mode=row-save` a `/vapor-tree-drag?mode=restricted`.
Sdílený helper má navíc test commit Enter → blur bez dvojího emit a test Escape.
Table focus regrese teď ověřuje aktuální dvojklik a kurzor na konci textu;
DOM focus pokrývá i vlastní editor s nativním inputem jako root. Scroll callback
fixture explicitně ověřuje obě osy. List měří drop indicator mimo auto-scroll
zónu celého ghostu. Tooltip odděluje změnu fixture od outside pointer pressu,
který má bublinu zavřít; samostatná regrese ověřuje běžný klik a opětovné otevření.
Celkem prošlo 304 unit testů v 52 souborech: první běh s dvěma workery měl
čtyři Nuxt setup timeouty; všech 20 dotčených testů prošlo s jedním workerem.
Affected source lint prochází s 16 warningy; typecheck má 39 výchozích diagnostik
oproti 42 před synchronizací (opraveny dva typy ve Tree fixture a explicitní
osa scroll callbacku ve fixture).
Samostatný lint UI manifestu má 21 původních chyb pořadí klíčů a duplicitní
`sortablejs`; nový dependency řádek nepřidává další chybu.
37 dotčených production Chromium suites pokrývá 143 případů: 141 funkčních
prošlo v širokém běhu a cílených opravách, 2 jsou původní HY01 expected failures.
Poslední rebuild prošel všemi 33 cílenými případy (31 funkčních + 2 HY01).
Ověřeny jsou i lokalizované odkazy nových variant a SSR bez JavaScriptu.

Inventář ověřený ze zdrojů: 241/241 UI SFC má Vapor marker; 56/61 rodin je
v inventáři odškrtnutých. To není uzavření migrace: zbývají I02 (root CSS
variables), I03 (dynamické ikony), HY01 (Tree/empty-slot hydratace), otevřené
rodiny a audity závislostí/kontraktů. H05 stále vyžaduje samostatné ověření
čistě Vapor scénáře a bundle bez VDOM runtime/interop.

### Sloučení 2.3 (2026-09-28)

UI 2.3 do `cba5b39a` a Utilities 2.3 do `ca64af3` jsou sloučené do 2.3-vapor.
Pro další synchronizace s 2.3 platí:

- VueUse `useMounted` (a další helpery čekající na `getCurrentInstance`) se ve
  Vapor komponentě nikdy nepřepne; používat `ref(false)` + `onMounted`.
- Vapor potomek VDOM rodiče může po jeho re-renderu znovu vyhodnotit čtení props,
  i když se hodnota nezměnila. Computed, který vrací nový objekt a spouští emit
  (DatePicker `update:period`), musí číst props přes primitivní computed; jinak
  vznikne smyčka přes rodiče. Regrese: `/vdom-date-picker-events`.
- IconRenderer mapuje kanonická Iconify jména (`lucide:check`) na UnoCSS třídu
  `i-lucide:check`. CSS existuje jen pro ikony nalezené ve zdrojích nebo v
  safelistu; jména mimo sestavené CSS se nevykreslí. Plná podpora dynamických
  jmen přes Nuxt Icon zůstává migračním problémem I03 níže.
- VirtualScroller 2.3 je port této větve bez Vapor částí; při slučování ponechat
  Vapor viewport a měření a přebírat jen funkční změny.

### Funkční změny z 2.3-mono (2026-09-28)

- Přeneseny jednosměrné `syncRefs` v List, Pivot, Table, Tree, TreeDms,
  QueryBuilder a QueryBuilderInline; obousměrné modely nadále používají `syncRef`.
  Pivot konfigurace a Table pagination používají getter refs, které sledují
  nahrazení merged props. Regrese: `/vdom-prop-sync` (client mount a aktualizace
  VDOM rodiče) a `/vapor-table-pivot-dom?controls=true&updates=true`.
- Table podporuje `selectionConfig.onSelectAll` pro výběr/zrušení všech řádků
  v hlavičce, včetně `emitKey` a částečného výběru.
- Menu header slot nabízí `mousedown` a `pointerdown` callbacky pro vlastní
  drag handle. Obě cesty používají Dragdoll a uvolňují gesture při Escape,
  zavření a zániku vlastníka. Regrese: `/vapor-element-movement?header=mouse`
  a `?header=pointer`.
- Utilities směruje Lodash autoimporty přes vlastní runtime modul. Nepřeneseny
  monorepo package/alias/lint konfigurace ani změny vzhledu Menu, Heading a
  CrudBtnDelete. Zachován výchozí TRASH preset včetně jeho barvy.
- Produkční build odhalil chybějící default export ve stávající fixture
  TemporaryMeasurementContent; doplněn bez změny pojmenovaného measurement slotu.
  Během přenosu prošel produkční build a cílené regrese props sync, Table
  measurement a Menu drag headeru. Nuxt Icon experiment byl následně vrácen
  (I03); jeho dřívější výsledky nepopisují aktuální vykreslování ikon.
  Existující HY01 zůstává expected failure; typecheck má 42 výchozích diagnostik.

## Známá omezení migrace a interopu

- [x] I01 — VDOM child cleanup under a Vapor wrapper: verified on the matched
      Vue 3.6.0-rc.9 packages (2026-09-29). On rc.7, removing a native Vapor
      `div v-if` skipped a nested VDOM component's unmount hooks, including the
      old VDOM Btn ripple cleanup. Direct component removal was the control.
      `tests/fixtures/interop-lifecycle` now preserves that exact boundary with
      an intentionally VDOM leaf under a native Vapor owner. This is a runtime
      diagnostic, not an adapter for UI components. Its unit suite checks both
      direct and wrapped removal, all three cleanup hooks, a real listener,
      repeated remounts and whole-app unmount. Both variants pass on rc.9;
      the four separate native fallback-slot controls also pass.
      The browser suite `tests/e2e/vapor-interop-lifecycle.spec.mjs` verifies
      the mixed tree after SSR/hydration and client remount, deterministic
      JavaScript-disabled SSR and localized query variants. It uses ordinary
      passing assertions, with no expected failure or local runtime patch.
      The original Table `?wrapper=true` case also passes, but now uses native
      descendants and is kept as a consumer regression rather than proof of
      interop cleanup. Other UI consumers need a matched Vue release containing
      the fix; this result does not certify rc.7 or resolve I02/I03.
      Validation: 6 focused unit tests and 24 production browser checks pass
      across Chromium/Firefox/WebKit, including Table and ripple regressions.
      Build and affected-code lint pass; typecheck retains the same 42 baseline
      diagnostics. See [test coverage](testing.md#vdom-child-cleanup-under-a-vapor-wrapper).

- [x] I02 — InputWrapper root CSS variables restored (2026-10-11). Vue RC.11
      includes the RC.10 mixed-parent `resolveCssVars` fix
      [#15721](https://github.com/vuejs/core/pull/15721). Variables bind to the
      original `.wrapper` root again; `contentStyle` remains on `.wrapper__body`.
      Removed the TODO and body-binding workaround. The original VDOM prepend
      owner is retained so mixed consumers remain covered. Native regular,
      inline and label-inside layouts also test live radius updates, marker and
      non-teleported menu inheritance, and body-only styles. SSR/navigation,
      focus, readonly/disabled/loading and remount checks remain in the suite.
      See the [root-style record](research/input-wrapper-root-style.md).

- [x] I03 — Nativní runtime ikony (2026-10-12). IconRenderer používá span,
  veřejné Nuxt useAsyncData a datový provider Nuxt Icon; jeho VDOM komponentu
  neimportuje. Buildové ikony zachovávají hashované SVG, runtime jména získají
  masku nebo barevné pozadí. Kanonická/legacy jména, pole/mapy tříd, aliasy a
  vlastní SVG kolekce fungují v aplikaci i v createVaporApp bez interopu.
  SSR serializuje stejné ikony pro hydrataci bez dalšího GET; cache přežije
  remount offline. Změněné/odstraněné vlastníky neaktualizují staré požadavky.
  Missing/failed provider má tichý fallback, výpadek se znovu zkusí při remount.
  Module provider je serverový i pro CSR konzumenty; nepotřebný klientský icon
  dataset je vypnutý a staré generované SVG se uklízí před publikací assetů.
  Nejde o náhradu Nuxt Icon API pro libovolné globální Vue komponenty či
  customize callback; veřejný UI kontrakt jsou jména ikon a stylovací třídy.
  Nuxt aplikační root ani jeho framework VDOM helpery tím nejsou převedené.


- [x] I04 — Native fallback-slot lifecycle (2026-09-29). Vue rc.7 creates a
  detached fallback effect scope without tying its disposal to the outlet
  owner. Forwarding an empty slot into an outlet with fallback content then
  removes the DOM but skips child `onBeforeUnmount`, `onScopeDispose` and
  `onUnmounted`, leaving listeners active. Table's empty forwarded `row` slot
  exposes this bug in its default TableRow; it predates D07 (`fe0cab1c`).
  The minimal `tests/fixtures/slot-lifecycle` reproduction contains only native
  Vapor components and fails under `createVaporApp` without any interop.
  SSR/hydration is not required to trigger it.
  Upgrading the matched Vue packages to rc.9 applies the published owner-scope
  cleanup from [Vue #15524](https://github.com/vuejs/core/pull/15524), specifically
  [the SlotFragment disposal change](https://github.com/vuejs/core/commit/922a7dddb20838a124750834ebee64978880ffaf).
  No Table slot workaround, renderer adapter or local runtime patch is needed.
  Other UI consumers must also use a matched Vue runtime/compiler release
  containing that fix; updating the UI layer alone cannot repair rc.7's runtime.
  Four native-only unit cases cover static, direct fallback, supplied content
  and empty forwarded fallback, including repeated removal, app unmount and
  listener disposal. The forwarded-fallback case fails on rc.7 and passes on rc.9.
  `/cs-CZ/vapor-slot-lifecycle` shares that reproduction; `?mode=provided` is its
  control case. Both localized navigation links and no-JavaScript SSR are checked.
  `tests/e2e/vapor-table-measurement.spec.mjs` now requires visible child counts
  to return to zero after removal and cancelled autofit, with no expected-failure
  marker. All 10 focused checks pass in development and production Chromium
  and production Firefox. WebKit passes all 5 minimal lifecycle checks and the
  actual Table-removal regression; 2 measurement tests still fail only their
  final error assertion on the previously recorded ResizeObserver diagnostic.
  Production build and affected lint pass. Typecheck retains the same 42 baseline
  diagnostics. At this checkpoint, the full unit run had 276 passes and 24
  input-test failures also reproduced on rc.7; the upgrade removed only the
  additional fallback failure. F09 subsequently fixes those input test mounts.
  The broader 60-case production Chromium run has 56 functional passes, the
  existing HY01 expected failure and 3 DatePicker failures also reproduced on
  rc.7 (I05). The aggregate reporter's 57 passes includes HY01.
  H05/H06 still require the broader native bundle and workaround audit.

- [x] I05 — Picker focus/click interaction (2026-09-29). Clicking an unfocused
  DateInput, TimeInput or ColorInput opened its menu on focus, then the same
  gesture's click toggled it closed. The leave transition explained the unstable
  or detached picker and underlying hint intercepting pointer events; popup
  positioning was not the cause. `useInputUtils` tracked this gesture only in
  `handlePointerDown`, while these three inputs intentionally bind
  `handleMouseDown` to preserve WebKit touch clicks (D05ae). Both handlers now
  share the same press bookkeeping. Later clicks on an already focused input
  still toggle the menu; touch opens on click without editable focus.
  Cross-browser verification also found that WebKit reports a touch-generated
  click as `PointerEvent(pointerType="mouse")`. The existing pointer branch
  returned early, bypassing its intended touch-history fallback and manually
  focusing the input. All six touch cases reproduced on the unchanged rc.9 build.
  Click events now reach that fallback; a real mouse pointerdown still uses its
  own pointer type, and keyboard activation ignores stale touch history.
  No timer, positioning workaround or renderer adapter was added.
  Three new browser regressions fail on the unchanged production build and
  verify ordinary clicks, a held press through popup opening, subsequent toggles
  and real selections after the fix. The shared-helper unit test also covers
  both event bindings. The two localized date/time tests additionally had an
  invalid extra input click after public `select()` had already focused the input
  and opened its picker; they now assert that state and click the day directly.
  The original failures reproduced on rc.7 and rc.9 and were separate from I04.
  Production Chromium passes 39 affected browser checks; Firefox and WebKit
  each pass all 15 applicable picker checks (one Chromium-only scroll check
  skipped in each). Both focused unit cases, build and lint pass; typecheck
  retains the same 42 baseline diagnostics. Details are in `docs/testing.md`,
  under picker focus and click lifecycle. All interactions use ordinary clicks,
  with no forced actions or expected-failure marker for I05.

### RAF audit drag-and-drop

- List a Tree používají výchozí sampled režim Dragdollu (RAF ticker), vlastní
  scroll RAF se při ukončení ruší. Před commitem se zpracuje release pozice,
  protože Dragdoll při stop ruší neprovedený move frame.
- ElementMove/ElementResize a QueryBuilder nyní také používají Dragdoll PointerSensor
  a Draggable. Vue dál řídí geometrii; QueryBuilder zachovává svůj clone a drop pravidla.
  QueryBuilder přijímá gesture jen pro vlastní řádek, ne pro vnořeného potomka.
- QueryBuilder autoscroll přešel z 5ms intervalu na Dragdoll autoScrollPlugin,
  s explicitním scroll targetem a pointer rectem (clone není řízený Dragdoll item).
  Drop target se počítá ve stejném cyklu jako sampled pozice, před commitem.
- Table/Pivot resize a scroll hit-test QueryBuilderu používají Utilities useRafTask:
  nejvýše jeden pending frame, poslední hodnota vyhrává, flush při commitu,
  cancel při ukončení scope nebo zrušení resize.
- CornerResize/useCornerAdjustment nyní také používá Dragdoll s native DOM refem.
  TreeDms externí dragover také používá useRafTask; nativní souborový drop zůstává HTML DnD.
  Samostatná regrese I01 ověřuje cleanup Vue interopu na rc.9 bez runtime patche.

### QueryBuilder hierarchy verification

The default example now has 24 conditions in four groups; the old three-condition
case remains at `?small=true`. Both are available in navigation. E2E checks drag
frame responsiveness, cross-group moves, two-digit indexes, stable row DOM and
nested subtree paths. Computed hover/drag flags isolate row renders (measured
p95 frame gap 150.5 → 8.9 ms in the local development run). Row keys use stable IDs;
reordering preserves item identity, parses complete indexes and distinguishes true
`children` descendants from sibling path prefixes. This improves existing VDOM
QueryBuilder components; it is not a claim of completing their native Vapor migration.

### Ověření hydratace

- [x] HY01 — Tree/TreeDms initial-data hydration (2026-10-12, RC.11).
      Built-in flatten/sort/search a synchronní vlastní hledání dokončí práci
      před renderem. Setup je synchronní; není třeba Suspense. Vlastní Promise
      hledání drží stejný pending SSR/first-client stav, commit provede po mountu
      a zahazuje starší výsledky i výsledky po dispose. Merged config neopakuje
      počáteční hledání. Prázdný vnitřní outlet se předává jen při skutečném
      obsahu; dočasný DOM wrapper zůstává odstraněný.
      Původní HY01 assertion i obě minimální empty/provided slot varianty jsou
      obyčejné strict testy bez expected-failure anotace. Počáteční řazení,
      hledání, synchronní/asynchronní vlastní funkce, prázdná data, lokalizované
      odkazy, stale/disposed výsledky, remount a TreeDms ověřují všechny tři
      enginy v cold development běhu. Samostatný createVaporApp konzument
      ověřuje skutečný drag/drop a async hledání bez interopu.
      Viz [oprava a historická reprodukce](research/tree-hydration.md) a
      [finální validační záznam](testing.md). E01 zůstává samostatný dokončený
      bod; jeho TanStack Grid důkaz nenahrazuje Tree testy.
