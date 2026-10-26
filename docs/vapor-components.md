# Inventář komponent pro Vapor

Stav k 2026-10-25 (Nuxt 4.6.1, Vue 3.6.0-rc.11, synchronizace s větvemi 2.3).
Navazuje na [hlavní checklist](vapor-migration.md).
Po opravě mountů platí čerstvé [ověření](research/vapor-mount-verification.json):
111/111 nativních případů a rozšířené produkční SSR/hydratační E2E; výkonové
srovnání používá stejné nastavení pro oba renderery. Nuxt root zůstává odložený.

Checkbox znamená dokončenou migraci a ověření vlastních SFC celé rodiny;
neznamená převod všech jejích externích závislostí. InputLabel a InputWrapper
jsou potvrzené. Poslední rendererový batch D05ai doplnil Vapor marker do všech
zbývajících SFC komponentového stromu; případné VDOM kompatibilní adaptéry jsou
u dotčených rodin uvedené zvlášť.

Aktuální inventář má 242 UI SFC, všechny s Vapor markerem, a 63 rodin.
Původní seznam vynechal adresář Icon. Nativní UI routing a runtime Icon (I03)
jsou nyní ověřené; ElementMovement, MenuConfirmation,
Scroller, Tabs a Tree mají doplněné SSR, hydrataci, interakce a cleanup testy.

Samostatný konzument bez interopu prošel 111 případy ve třech enginech. UI
nemá VDOM render importy a icon renderer Nuxt/Iconify v jeho bundle chybí;
framework stále ponechává createVNode a NuxtLink render funkce. Aplikační Nuxt
root a framework helpery zůstávají v H05; externí rollout a odstranění používaného
legacy API zůstávají v B08/H04. Kontraktní a lokální externí audit je v
[závěrečném záznamu](research/vapor-final-contract-audit.md). Checkbox
rodiny ani marker nejsou uzavřením celé migrace. Rozsah důkazů a zbývající
závislosti uvádí [nativní audit](research/native-vapor-audit.md).
Čerstvé [měření výkonu](research/vapor-performance.md) má 1 280 párovaných
vzorků s opravenými VDOM direktivami. Tree používá shallow úložiště odvozených
uzlů; Pivot a Table po odmítnutí neprokázaných variant zůstávají beze změny.
Ponechaná změna má změřený přínos; neprokázané Tree/Pivot/Table varianty jsou vrácené.
Nativní režie proti stejnému optimalizovanému VDOM kódu zůstává přiznaná.
Aplikační root a externí rollout zůstávají otevřené.

U každé rodiny doplnit při práci konkrétní SFC, testy a případné interop výjimky.
Počty zahrnují všechny aktuální `.vue` soubory, i případné starší varianty.
Nepoužívané varianty nejprve doložit jako nepoužívané; neignorovat je automaticky.

- [x] [Badge](../packages/UI/app/components/Badge) — 1 nativní Vapor SFC (D05u/D05af); counter, vlastní slot, reaktivní změna, SSR a remount ověřeny v /vapor-leaf-primitives a /vapor. Explicitní getRootElement používá Banner pro bounce animaci counteru.
- [x] [Banner](../packages/UI/app/components/Banner) — 1 nativní Vapor SFC (D05af). Původní model a counter zůstávají; Transition bez appear zachová SSR obsah a běžné enter/leave animace. Model, dismiss, counter, attrs, remount, SSR a tlačítka PivotPerformanceWarning prošly ve třech prohlížečích; širší Chromium regrese pokrývá také Table, Form a dialogové akce.
- [x] [Breadcrumbs](../packages/UI/app/components/Breadcrumbs) — 1 nativní Vapor SFC (D05af); home a vlastní odkazy, oddělovače, append/right sloty, remount a SSR ověřuje /vapor-presentation-primitives ve třech prohlížečích.
- [x] [Burger](../packages/UI/app/components/Burger) — 1 nativní Vapor SFC (D05u); model, SVG DOM ref, otevřená cesta po remountu a SSR ověřeny v /vapor-leaf-primitives.
- [x] [Button](../packages/UI/app/components/Button) — všechny 3 SFC jsou nativní Vapor (D05x/D05y). Btn zachovává explicitní button/anchor kořeny, navigaci a DOM API; CopyBtn odkládá detekci Clipboard API za mount a BtnConfirmation uklízí oba timeouty. Nativní IconRenderer z D05ai zachovává ikony bez rendererové hranice. Chování, SSR a remount ověřují /vapor-button a /vapor-action-primitives.
- [x] [ButtonGroup](../packages/UI/app/components/ButtonGroup) — 1 nativní Vapor SFC (D05u); model, dynamické pojmenované sloty, aktivní stav, SSR a remount ověřeny. Nativní Btn prošel navazující regresí D05x.
- [x] [Card](../packages/UI/app/components/Card) — MiniCard je nativní Vapor SFC (D05ai); deklarativní větve nahradily createReusableTemplate a readonly scoped obsah ověřuje InputBlock regrese.
- [x] [Checkbox](../packages/UI/app/components/Checkbox) — 1 nativní Vapor SFC (D05z); scalar/array/indeterminate model, skutečné DOM properties, slot, keyboard, focus API, readonly, SSR a remount ověřuje /vapor-control-primitives. Reální konzumenti prošli v Listu a Table/Pivot regresích.
- [x] [Chip](../packages/UI/app/components/Chip) — oba SFC jsou nativní Vapor (D05x); ripple, remove, link, archivní preset, SSR a cleanup ověřeny v /vapor-ripple a /vapor-action-primitives. Ikony vykresluje nativní IconRenderer z D05ai.
- [x] [CircleProgress](../packages/UI/app/components/CircleProgress) — 1 nativní Vapor SFC (D05t); reaktivní progress, vlastní slot, velikost, SSR a remount ověřeny v /vapor-presentation-primitives.
- [x] [Collapse](../packages/UI/app/components/Collapse) — všechny 3 SFC jsou nativní Vapor (D05ae). CollapseContent používá explicitní DOM template ref; model, obsah, otevření, zavření, remount a SSR ověřuje /vapor-presentation-primitives ve třech prohlížečích.
- [x] [Confirmation](../packages/UI/app/components/Confirmation) — 1 nativní Vapor SFC (D05z); visible model, close event, vlastní checkmark/content/actions sloty, Transition, SSR a remount ověřuje /vapor-control-primitives.
- [x] [Crud](../packages/UI/app/components/Crud) — všech 7 SFC je nativní Vapor (D05x/D05y). Přímé i potvrzované add/save/delete/archive/restore akce, edit/cancel přes skutečný Form store, scoped prepend/append/confirmation sloty, breakpoint po mountu, remount a SSR ověřuje /vapor-action-primitives.
- [x] [DatePicker](../packages/UI/app/components/DatePicker) — všech 5 SFC je nativní Vapor (D05ae). Lokalizace, navigace, přepnutí kalendáře mezi dny, měsíci a roky, výběr dne, mobilní dialog, remount a SSR ověřuje /vapor-date-time-inputs ve třech prohlížečích.
- [x] [Dialog](../packages/UI/app/components/Dialog) — oba SFC jsou nativní Vapor (D05ai). Deklarativní i programatické otevření, inject/sloty/close/disposal, focus, kotvy a responsive MenuProxy ověřují dialogové regrese. DialogHost používá deklarativní dynamický outlet; jeho původní VDOM wrapper byl odstraněn. Legacy render-function obsah zůstává volitelnou interop cestou v mixed aplikaci.
- [x] [DragAndDrop](../packages/UI/app/components/DragAndDrop) — oba SFC jsou nativní Vapor (D05w/D05ag). DraggableItem zachovává `get-item`; DraggableContainer po mountu zapisuje get/insert/remove/move/parent/drop DOM API a při dispose je odstraňuje. Reorder, no-drop, remount a SSR ověřuje /vapor-action-primitives.
- [x] [Drawer](../packages/UI/app/components/Drawer) — všechny 3 SFC jsou nativní Vapor (D05w/D05ag); DrawerResizer z 2.3 byl převeden při sloučení a tažení Draweru i PageDraweru ověřuje /vapor-action-primitives. Drawer explicitně předává attrs kořeni v Teleportu; modely, zavření, sloty, remount a SSR ověřuje /vapor-action-primitives.
- [x] [ElementMovement](../packages/UI/app/components/ElementMovement) — 3 nativní Vapor SFC; pohyb, resize, všech 8 handles, limity, poslední pozice před RAF, vlastní mouse/pointer header, Escape/hide/unmount a remount ověřují /vapor-element-movement a /vapor-corner-resize. Touch cancel i obnovení původní selection hodnoty a priority pokrývá vapor-family-interaction. SSR a nativní konzument bez interopu jsou ověřené ve třech enginech.
- [x] [Field](../packages/UI/app/components/Field) — oba SFC jsou nativní Vapor (D05s/D05t). Field má typovaný wrapper ref a podmíněný label slot; FieldWithFormatter zachovává formátovaný obsah a append. FileInput, drop, focus, kotvy a SSR jsou ověřeny.
- [x] [Form](../packages/UI/app/components/Form) — všechny 3 SFC jsou nativní Vapor (D05v/D05ai); FormControls používá stabilní deklarativní větve. Validace, submit/reset, řízení stavu, SSR a hydratace pro ArkType i Zod ověřují /vapor-form a /vapor-form-zod.
- [x] [Icon](../packages/UI/app/components/Icon) — IconRenderer vykresluje nativní span nad datovým providerem Nuxt Icon. Podporuje runtime jména, aliasy, vlastní SVG kolekce, masky a barevné pozadí; statické ikony znovu používají hashované SVG. SSR payload, hydrataci bez refetch, změny jména, chyby provideru, offline cache a cleanup ověřuje /vapor-runtime-icons a samostatný nativní konzument. I03 je uzavřené pro tento veřejný UI kontrakt.
- [x] [Link](../packages/UI/app/components/Link) — UILink je nativní anchor nad veřejným Vue Router useLink. Nahrazuje UI NuxtLink větve v Chip, MiniCard, FilePreview2, TableRow a SelectorInner; Btn sdílí stejnou navigaci. Ověřeny jsou lokalizované/named cíle, aktivní stav, Back/replace, klávesnice, modifikátory, download, disabled/prevented kliknutí, prefetch, SSR/hydratace a disposal. Table má samostatné řádkové/cell odkazy bez vnořených anchorů.
- [x] [InputBlock](../packages/UI/app/components/InputBlock) — 1 nativní Vapor SFC (D05ai); po převodu MiniCard zachovává scoped readonly i editable obsah při SSR a hydrataci.
- [x] [InputLabel](../packages/UI/app/components/InputLabel) — 1 nativní Vapor SFC (D05s); focus, floating label, prepend offset a remount ověřeny v /vapor-input-layouts a /vapor-input-dom.
- [x] [InputWrapper](../packages/UI/app/components/InputWrapper) — 4 nativní Vapor SFC (D05s); regular/inline/label-inside, dynamické přepínání, styly, label fallback, readonly/disabled, loading a SSR. I02 je uzavřené na RC.11: CSS proměnné jsou opět na kořeni; měření prepend obsahu je zachované jako nutná layout funkce.
- [x] [Inputs](../packages/UI/app/components/Inputs) — všech 30 SFC je nativní Vapor (D05a–D05ai). D05ai převedlo IconPickerIcon na nativní span bez @nuxt/icon rendererové hranice. Modely, masky, soubory, pickery, touch/focus, feedback, scoped sloty, veřejná API, SSR a hydrataci pokrývají specializované `/vapor-*input*` regrese.
- [x] [Item](../packages/UI/app/components/Item) — 1 nativní Vapor SFC (D05u); dynamický HTML tag, attrs, click, readonly helper, SSR a remount ověřeny.
- [x] [KeyboardShortcut](../packages/UI/app/components/KeyboardShortcut) — 1 nativní Vapor SFC (D05u); pointer-dependent zobrazení, modifikátory, SSR a reální Form/Table konzumenti ověřeni.
- [x] [List](../packages/UI/app/components/List) — všech 9 SFC je nativní Vapor (D05ag/D05ai). ListContent a ListRowItem používají stabilní snapshot řádku pro scoped sloty a virtualizaci; empty/loading, search, group click, drag, DOM kontrakty, remount, SSR a hydrataci ověřují /vapor-list-dom, /vapor-list-drag a Selector scénáře.
- [x] [Loader](../packages/UI/app/components/Loader) — 3 nativní Vapor SFC (D05t); velikosti, attrs, SSR, remount a reaktivní přepnutí block/inline ověřeny v /vapor-presentation-primitives. Přepínač varianty nyní reaguje i na změnu prop.
- [x] [MainBar](../packages/UI/app/components/MainBar) — 1 nativní Vapor SFC (D05af); title, subtitle, left, title-append, right a inner sloty, remount a SSR ověřuje /vapor-presentation-primitives ve třech prohlížečích.
- [x] [Marquee](../packages/UI/app/components/Marquee) — 1 nativní Vapor SFC (D05z); reaktivní repeat, vertical/reverse, CSS proměnné, opakovaný slot, SSR a remount ověřuje /vapor-control-primitives.
- [x] [Menu](../packages/UI/app/components/Menu) — všechny 4 SFC jsou nativní Vapor (D05ac/D05ad/D05ai). Veřejné DOM refy, trigger/reference anchor, pohyb, overlay/arrow, Escape cleanup a desktop/mobile potvrzovací menu jsou ověřené ve třech enginech.
- [x] [MenuConfirmation](../packages/UI/app/components/MenuConfirmation) — 1 nativní Vapor SFC; otevření, dynamický obsah, potvrzení/cancel, focus a návrat focusu, keyboard Enter/Space/Escape, touch tap, remount a SSR ověřují /vapor-menu-confirmation a vapor-family-interaction ve třech enginech. Nativní konzument ověřuje stejnou klávesnicovou cestu bez interopu.
- [x] [MenuProxy](../packages/UI/app/components/MenuProxy) — 1 nativní Vapor SFC; explicitní Menu/Dialog větve, scoped forwarding, fallback, header-right a responsive přepnutí ověřuje /vapor-menu-proxy (D05b/D05ai).
- [x] [MonthSelector](../packages/UI/app/components/MonthSelector) — oba SFC jsou nativní Vapor (D05ai); model, vybraný měsíc, click cesta v gridu, desktop/mobile otevření a SSR ověřují date/time regrese.
- [x] [Movement](../packages/UI/app/components/Movement) — všech 5 SFC je nativní Vapor (D05u). Checkmark, Close, Indeterminate a RadioButton zachovávají reaktivní stavy a animované styly. MovementElement začíná při SSR i hydrataci s nulovým delayem a náhodný interval 0–2000 ms nastaví až po mountu.
- [x] [Navigation](../packages/UI/app/components/Navigation) — 1 nativní Vapor SFC (D05af); DOM refs, sticky/no-hide stav, obsah, remount a SSR ověřuje /vapor-presentation-primitives ve třech prohlížečích.
- [x] [Notification](../packages/UI/app/components/Notification) — oba SFC jsou nativní Vapor (D05ai). Notifications zapisuje veřejnou metodu hide na skutečný DOM kořen; automatický host, Escape, SSR, hydrataci a přidání/odebrání řádku ověřuje ui-hosts.spec.mjs.
- [x] [Page](../packages/UI/app/components/Page) — všechny 4 SFC jsou nativní Vapor (D05v/D05ad/D05ag). PageTitle sloty a styly ověřuje /vapor-presentation-primitives; PageDrawer model/mini a PageWrapper obsah/loading, remount a SSR ověřuje /vapor-action-primitives.
- [x] [Pivot](../packages/UI/app/components/Pivot) — všech 26 SFC je nativní Vapor (D05ah/D05ai); PivotRowContext z 2.3 připíná skupiny řádků, ověřeno v /vapor-table-pivot-dom?grouped=true. Configuration, empty, filter menu a row header doplňují celý rendererový řetězec; scroll synchronizaci, resize, loading, filtry, click/keyboard události, SSR a hydrataci ověřuje /vapor-table-pivot-dom.
- [x] [ProgressBar](../packages/UI/app/components/ProgressBar) — 1 nativní Vapor SFC (D05t); label funkce, reaktivní poměr, SSR a skutečný upload konzument ověřeny.
- [x] [QueryBuilder](../packages/UI/app/components/QueryBuilder) — všech 12 SFC je nativních Vapor (D05w/D05aa/D05ah). D05ah převedlo kořen, inline variantu, skupiny, položky, řádky a TimeAgoInput jako jeden rendererový řetězec. SSR, editace, touch cancel, unmount cleanup, autoscroll, rychlý pointer-up, zanořené skupiny a dvouciferné indexy ověřují /vapor-query-builder-dom; responsive výška řádků je zahrnuta v DnD geometrii testu.
- [x] [Radio](../packages/UI/app/components/Radio) — 1 nativní Vapor SFC (D05u); výchozí i vlastní label, model, disabled stav, keyboard/click cesta, SSR a remount ověřeny.
- [x] [ScrollArea](../packages/UI/app/components/ScrollArea) — 1 nativní Vapor SFC (D05ai); DOM ref, VueUse/PerfectScrollbar integrace, filtrování lišt a cleanup odložené práce ověřuje /vapor-scroll-area.
- [x] [ScrollPicker](../packages/UI/app/components/ScrollPicker) — VerticalScrollPicker je nativní Vapor (D05ag) s explicitním scroll refem; výběr a mobilní time picker ověřuje /vapor-date-time-inputs.
- [x] [Scroller](../packages/UI/app/components/Scroller) — oba scrolery jsou nativní Vapor; společný helper používá explicitní DOM refy. Osy, modely, wheel, změnu obsahu, veřejné metody, držení šipek, RAF/disposal, remount a SSR ověřuje /vapor-scrollers ve třech enginech; samostatný konzument používá stejné API bez interopu.
- [x] [Section](../packages/UI/app/components/Section) — 1 nativní Vapor SFC (D05af); title, subtitle, obsah, reaktivní loading, remount a SSR ověřuje /vapor-presentation-primitives ve třech prohlížečích.
- [x] [Selector](../packages/UI/app/components/Selector) — všechny 4 SFC jsou nativní Vapor (D05v/D05ag). Model, hledání, výběr, chip, focus, krátké menu, remount a SSR ověřuje /selector-vapor v Chromiu, Firefoxu a WebKitu; Content-size události jsou doručené mimo ResizeObserver loop; WebKit pageerror byl opraven. Responsive regrese hlídá také Firefox opening click, pointer re-entry a smazání preference cookie.
- [x] [Separator](../packages/UI/app/components/Separator) — 1 nativní Vapor SFC (D05t); horizontal/vertical, spaced/inset, obsah, SSR a remount ověřeny.
- [x] [Skeleton](../packages/UI/app/components/Skeleton) — 1 nativní Vapor SFC (D05t); wave/pulse/blink, rychlost, vlastní styl, SSR a remount ověřeny.
- [x] [Table](../packages/UI/app/components/Table) — všech 39 SFC je nativní Vapor (D05v–D05ai, D07); TableCell 2.3 odstranila. Řádky dál předávají sloty deklarativně; renderSlot outlet z 2.3 řešil jen VDOM překreslování. Poslední batch převedl kořen, content, row, výběr sloupců, filtrování a oba layoutové dialogy. Persistence, pagination, fetch-more, fullscreen, resize, virtualizaci, filtry, QueryBuilder, focus editorů, layouty, toolbar, SSR, hydrataci a remount pokrývají `/vapor-table-*` regrese. D07 odstranil VDOM měření autofitu; nativní sloty měří TableMeasurement uvnitř vlastníka. I04 opravil upgrade na Vue rc.9; cleanup viditelných hydratovaných cell slotů má povinnou regresi.
- [x] [Stepper](../packages/UI/app/components/Stepper) — všechny 3 SFC z 2.3 jsou nativní Vapor. Ikony kreslí nativní IconRenderer (kanonická jména mapuje na UnoCSS třídu, výchozí ikony jsou v safelistu); číslo kroku je v elementu kvůli hydrataci. Lineární navigaci, model, ikony, SSR a hydrataci ověřuje /vapor-stepper.
- [x] [Tabs](../packages/UI/app/components/Tabs) — 4 nativní Vapor SFC (Tabs, Tab, TabPanel, TabsNavigation). Vnořené deklarace přes provide/inject, cache state, include/exclude, LRU a activate/deactivate/dispose, dynamické pořadí, SSR a hydrataci ověřuje /vapor-tabs. D01b přidává tablist/tab/tabpanel, stabilní ID, roving focus, disabled skipping, Home/End a manuální/automatickou aktivaci. mode=keyboard/automatic ověřuje skutečné Tab/Shift+Tab pořadí, overflow a focus po odebrání. Custom navigace i label slot sdílejí kontrakt TabsNavigation; nativní cache a klávesnice fungují bez interopu.
- [x] [Toggle](../packages/UI/app/components/Toggle) — 1 nativní Vapor SFC (D05z); tristate i string model, scoped sloty, keyboard, focus API, readonly, SSR a remount ověřuje /vapor-control-primitives.
- [x] [Tooltip](../packages/UI/app/components/Tooltip) — oba SFC jsou nativní Vapor (D05ai). Anchor, retarget, směr, předání bubliny, slot kontext, časování a cleanup ověřují shared-tooltip regrese. Viz [sdílený Tooltip](research/shared-tooltip.md).
- [x] [Tree](../packages/UI/app/components/Tree) — všech 9 SFC je nativní Vapor. HY01 je vyřešené: built-in flatten/sort/search i synchronní vlastní hledání dodají data před renderem; vlastní Promise drží shodný pending SSR/klient stav a zahazuje staré výsledky i výsledky po dispose. Bez async setup/Suspense. /vapor-tree-initialization pokrývá všech 5 režimů a lokalizované odkazy; /vapor-tree-drag, TreeDms a keyboard regrese doplňují virtualizaci 1 000 uzlů, drop, cancel/unmount a remount ve třech enginech. Nativní konzument ověřuje skutečný drag i async hledání bez interopu. Viz [oprava a reprodukce](research/tree-hydration.md).
- [x] [TreeDms](../packages/UI/app/components/TreeDms) — všech 6 SFC je nativní Vapor (D05ai); strom, search, kontextové menu, soubor/složka, drop, SSR a hydrataci ověřuje /vapor-tree-dms-drop.
- [x] [Typography](../packages/UI/app/components/Typography) — Heading je 1 nativní Vapor SFC (D05t); slot, highlighted, UI styl, SSR a remount ověřeny.
- [x] [ValueFormatter](../packages/UI/app/components/ValueFormatter) — 1 nativní Vapor SFC (D05t); default/previous scoped sloty, vlastní formatter, attrs, SSR a Field/Table konzumenti ověřeni.
- [x] [VirtualScroller](../packages/UI/app/components/VirtualScroller) — oba SFC jsou nativní Vapor. TanStack Virtual cesta i sticky Pivot cesta mají ověřené osy, resize, recyklaci, synchronizaci scrollu a SSR/hydrataci. E01a nahrazuje pět Vertical API stubů; /vapor-scroller-contracts dokládá clear/rerender, omezený range, synchronní měření, validní eventy, append a cleanup. Table mode=vertical ověřuje skutečného autofit/remount konzumenta; Tree používá typovaný main-scroller kontrakt.
- [x] [YearMonthSelector](../packages/UI/app/components/YearMonthSelector) — 1 nativní Vapor SFC (D05ag); model, otevření nativního month gridu, výběr měsíce a SSR ověřuje /vapor-date-time-inputs.
- [x] [YearSelector](../packages/UI/app/components/YearSelector) — vlastní SFC i závislosti jsou nativní Vapor; datum, wheel, držení šipek, cleanup, desktop/mobile a SSR ověřeny v /vapor-year-selector. NumberInput je nativní od D05m, Btn od D05x a Menu od D05ai.

## Aplikační ověření

- [x] `VaporProbe.vue` + `/vapor`: základní SSR/hydratace/model/slot/interop pilot.
- [x] `testing/VaporSelectorHost.vue` + `/selector-vapor`: Selector pilot s Vapor parentem.
- [x] `testing/VaporScopeOwner.vue` + `/vapor-scopes`: SSR/hydratace, validační a souborové registry, cleanup/remount.
- [x] `testing/VaporStatusPrimitives.vue` + `/vapor-status-primitives`: loading, upozornění, Tree loading/no-data, remount, SSR a lokalizovaná navigace pro jednoduché stavové komponenty.
- [x] `testing/VaporActionPrimitives.vue` + `/vapor-action-primitives`: CRUD akce, edit/cancel přes Form store, CopyBtn, potvrzení a timeout cleanup, Drawer, PageDrawer/PageWrapper, DraggableContainer DOM API, TableOptionsDialog, metadata, remount, SSR a lokalizovaná navigace.
- [x] `testing/VaporControlPrimitives.vue` + `/vapor-control-primitives`: Checkbox a Toggle modely, DOM properties, focus, keyboard a sloty; Confirmation model/event/sloty; Marquee reaktivní směry a počet stop; QueryBuilderBooleanInput model/remove a move handle; remount, SSR a lokalizovaná navigace.
- [ ] Ověřit ostatní aplikační komponenty a stránky, pokud mají přejít do nativního Vaporu.

Utilities v aktuálním `app` neobsahuje SFC; jeho composables a helpers jsou vedené
v hlavním checklistu, nikoliv v tomto seznamu UI rodin.
