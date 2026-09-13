# Inventář komponent pro Vapor

Stav k 2026-09-10. Navazuje na [hlavní checklist](vapor-migration.md).

Checkbox znamená dokončenou migraci a ověření vlastních SFC celé rodiny;
neznamená převod všech jejích externích závislostí. InputLabel a InputWrapper
jsou potvrzené. Poslední rendererový batch D05ai doplnil Vapor marker do všech
zbývajících SFC komponentového stromu; případné VDOM kompatibilní adaptéry jsou
u dotčených rodin uvedené zvlášť.

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
- [x] [Dialog](../packages/UI/app/components/Dialog) — oba SFC jsou nativní Vapor (D05ai). Deklarativní i programatické otevření, inject/sloty/close/disposal, focus, kotvy a responsive MenuProxy ověřují dialogové regrese. DialogHost drží úzký kompatibilní adaptér pro uživatelský legacy render-function obsah.
- [x] [DragAndDrop](../packages/UI/app/components/DragAndDrop) — oba SFC jsou nativní Vapor (D05w/D05ag). DraggableItem zachovává `get-item`; DraggableContainer po mountu zapisuje get/insert/remove/move/parent/drop DOM API a při dispose je odstraňuje. Reorder, no-drop, remount a SSR ověřuje /vapor-action-primitives.
- [x] [Drawer](../packages/UI/app/components/Drawer) — oba SFC jsou nativní Vapor (D05w/D05ag). Drawer explicitně předává attrs kořeni v Teleportu; modely, zavření, sloty, remount a SSR ověřuje /vapor-action-primitives.
- [ ] [ElementMovement](../packages/UI/app/components/ElementMovement) — 3 SFC; neověřeno jako celek.
- [x] [Field](../packages/UI/app/components/Field) — oba SFC jsou nativní Vapor (D05s/D05t). Field má typovaný wrapper ref a podmíněný label slot; FieldWithFormatter zachovává formátovaný obsah a append. FileInput, drop, focus, kotvy a SSR jsou ověřeny.
- [x] [Form](../packages/UI/app/components/Form) — všechny 3 SFC jsou nativní Vapor (D05v/D05ai); FormControls používá stabilní deklarativní větve. Validace, submit/reset, řízení stavu, SSR a hydratace pro ArkType i Zod ověřují /vapor-form a /vapor-form-zod.
- [x] [InputBlock](../packages/UI/app/components/InputBlock) — 1 nativní Vapor SFC (D05ai); po převodu MiniCard zachovává scoped readonly i editable obsah při SSR a hydrataci.
- [x] [InputLabel](../packages/UI/app/components/InputLabel) — 1 nativní Vapor SFC (D05s); focus, floating label, prepend offset a remount ověřeny v /vapor-input-layouts a /vapor-input-dom.
- [x] [InputWrapper](../packages/UI/app/components/InputWrapper) — 4 nativní Vapor SFC (D05s); regular/inline/label-inside, dynamické přepínání, styly, label fallback, readonly/disabled, loading a SSR. CSS proměnné zůstávají na těle layoutu do samostatného uzavření I02.
- [x] [Inputs](../packages/UI/app/components/Inputs) — všech 30 SFC je nativní Vapor (D05a–D05ai). D05ai převedlo IconPickerIcon na nativní span bez @nuxt/icon rendererové hranice. Modely, masky, soubory, pickery, touch/focus, feedback, scoped sloty, veřejná API, SSR a hydrataci pokrývají specializované `/vapor-*input*` regrese.
- [x] [Item](../packages/UI/app/components/Item) — 1 nativní Vapor SFC (D05u); dynamický HTML tag, attrs, click, readonly helper, SSR a remount ověřeny.
- [x] [KeyboardShortcut](../packages/UI/app/components/KeyboardShortcut) — 1 nativní Vapor SFC (D05u); pointer-dependent zobrazení, modifikátory, SSR a reální Form/Table konzumenti ověřeni.
- [x] [List](../packages/UI/app/components/List) — všech 9 SFC je nativní Vapor (D05ag/D05ai). ListContent a ListRowItem používají stabilní snapshot řádku pro scoped sloty a virtualizaci; empty/loading, search, group click, drag, DOM kontrakty, remount, SSR a hydrataci ověřují /vapor-list-dom, /vapor-list-drag a Selector scénáře.
- [x] [Loader](../packages/UI/app/components/Loader) — 3 nativní Vapor SFC (D05t); velikosti, attrs, SSR, remount a reaktivní přepnutí block/inline ověřeny v /vapor-presentation-primitives. Přepínač varianty nyní reaguje i na změnu prop.
- [x] [MainBar](../packages/UI/app/components/MainBar) — 1 nativní Vapor SFC (D05af); title, subtitle, left, title-append, right a inner sloty, remount a SSR ověřuje /vapor-presentation-primitives ve třech prohlížečích.
- [x] [Marquee](../packages/UI/app/components/Marquee) — 1 nativní Vapor SFC (D05z); reaktivní repeat, vertical/reverse, CSS proměnné, opakovaný slot, SSR a remount ověřuje /vapor-control-primitives.
- [x] [Menu](../packages/UI/app/components/Menu) — všechny 4 SFC jsou nativní Vapor (D05ac/D05ad/D05ai). Veřejné DOM refy, trigger/reference anchor, pohyb, overlay/arrow, Escape cleanup a desktop/mobile potvrzovací menu jsou ověřené ve třech enginech.
- [ ] [MenuConfirmation](../packages/UI/app/components/MenuConfirmation) — 1 SFC; neověřeno jako celek.
- [x] [MenuProxy](../packages/UI/app/components/MenuProxy) — 1 nativní Vapor SFC; explicitní Menu/Dialog větve, scoped forwarding, fallback, header-right a responsive přepnutí ověřuje /vapor-menu-proxy (D05b/D05ai).
- [x] [MonthSelector](../packages/UI/app/components/MonthSelector) — oba SFC jsou nativní Vapor (D05ai); model, vybraný měsíc, click cesta v gridu, desktop/mobile otevření a SSR ověřují date/time regrese.
- [x] [Movement](../packages/UI/app/components/Movement) — všech 5 SFC je nativní Vapor (D05u). Checkmark, Close, Indeterminate a RadioButton zachovávají reaktivní stavy a animované styly. MovementElement začíná při SSR i hydrataci s nulovým delayem a náhodný interval 0–2000 ms nastaví až po mountu.
- [x] [Navigation](../packages/UI/app/components/Navigation) — 1 nativní Vapor SFC (D05af); DOM refs, sticky/no-hide stav, obsah, remount a SSR ověřuje /vapor-presentation-primitives ve třech prohlížečích.
- [x] [Notification](../packages/UI/app/components/Notification) — oba SFC jsou nativní Vapor (D05ai). Notifications zapisuje veřejnou metodu hide na skutečný DOM kořen; automatický host, Escape, SSR, hydrataci a přidání/odebrání řádku ověřuje ui-hosts.spec.mjs.
- [x] [Page](../packages/UI/app/components/Page) — všechny 4 SFC jsou nativní Vapor (D05v/D05ad/D05ag). PageTitle sloty a styly ověřuje /vapor-presentation-primitives; PageDrawer model/mini a PageWrapper obsah/loading, remount a SSR ověřuje /vapor-action-primitives.
- [x] [Pivot](../packages/UI/app/components/Pivot) — všech 25 SFC je nativní Vapor (D05ah/D05ai). Configuration, empty, filter menu a row header doplňují celý rendererový řetězec; scroll synchronizaci, resize, loading, filtry, click/keyboard události, SSR a hydrataci ověřuje /vapor-table-pivot-dom.
- [x] [ProgressBar](../packages/UI/app/components/ProgressBar) — 1 nativní Vapor SFC (D05t); label funkce, reaktivní poměr, SSR a skutečný upload konzument ověřeny.
- [x] [QueryBuilder](../packages/UI/app/components/QueryBuilder) — všech 12 SFC je nativních Vapor (D05w/D05aa/D05ah). D05ah převedlo kořen, inline variantu, skupiny, položky, řádky a TimeAgoInput jako jeden rendererový řetězec. SSR, editace, touch cancel, unmount cleanup, autoscroll, rychlý pointer-up, zanořené skupiny a dvouciferné indexy ověřují /vapor-query-builder-dom; responsive výška řádků je zahrnuta v DnD geometrii testu.
- [x] [Radio](../packages/UI/app/components/Radio) — 1 nativní Vapor SFC (D05u); výchozí i vlastní label, model, disabled stav, keyboard/click cesta, SSR a remount ověřeny.
- [x] [ScrollArea](../packages/UI/app/components/ScrollArea) — 1 nativní Vapor SFC (D05ai); DOM ref, VueUse/PerfectScrollbar integrace, filtrování lišt a cleanup odložené práce ověřuje /vapor-scroll-area.
- [x] [ScrollPicker](../packages/UI/app/components/ScrollPicker) — VerticalScrollPicker je nativní Vapor (D05ag) s explicitním scroll refem; výběr a mobilní time picker ověřuje /vapor-date-time-inputs.
- [ ] [Scroller](../packages/UI/app/components/Scroller) — oba scrolery nativní Vapor, společný helper bez VNode hooků; osy, modely, wheel, RAF, cleanup a SSR ověřeny v /vapor-scrollers. Šipky používají nativní Btn od D05x.
- [x] [Section](../packages/UI/app/components/Section) — 1 nativní Vapor SFC (D05af); title, subtitle, obsah, reaktivní loading, remount a SSR ověřuje /vapor-presentation-primitives ve třech prohlížečích.
- [x] [Selector](../packages/UI/app/components/Selector) — všechny 4 SFC jsou nativní Vapor (D05v/D05ag). Model, hledání, výběr, chip, focus, krátké menu, remount a SSR ověřuje /selector-vapor v Chromiu, Firefoxu a WebKitu; WebKit dev runtime při ResizeObserver měření hlásí nedoručenou notifikaci jako pageerror.
- [x] [Separator](../packages/UI/app/components/Separator) — 1 nativní Vapor SFC (D05t); horizontal/vertical, spaced/inset, obsah, SSR a remount ověřeny.
- [x] [Skeleton](../packages/UI/app/components/Skeleton) — 1 nativní Vapor SFC (D05t); wave/pulse/blink, rychlost, vlastní styl, SSR a remount ověřeny.
- [x] [Table](../packages/UI/app/components/Table) — všech 39 SFC je nativní Vapor (D05v–D05ai). Poslední batch převedl kořen, content, row, výběr sloupců, filtrování a oba layoutové dialogy. Persistence, pagination, fetch-more, fullscreen, resize, virtualizaci, filtry, QueryBuilder, focus editorů, layouty, toolbar, SSR, hydrataci a remount pokrývají `/vapor-table-*` regrese.
- [ ] [Tabs](../packages/UI/app/components/Tabs) — 4 nativní Vapor SFC (Tabs, Tab, TabPanel, TabsNavigation). Vnořené deklarace přes provide/inject, nativní cache včetně filtrů/LRU/lifecycle, dynamické pořadí a SSR ověřeny v /vapor-tabs (D01/D01a). Navigace používá nativní Btn od D05x.
- [x] [Toggle](../packages/UI/app/components/Toggle) — 1 nativní Vapor SFC (D05z); tristate i string model, scoped sloty, keyboard, focus API, readonly, SSR a remount ověřuje /vapor-control-primitives.
- [x] [Tooltip](../packages/UI/app/components/Tooltip) — oba SFC jsou nativní Vapor (D05ai). Anchor, retarget, směr, předání bubliny, slot kontext, časování a cleanup ověřují shared-tooltip regrese. Viz [sdílený Tooltip](research/shared-tooltip.md).
- [ ] [Tree](../packages/UI/app/components/Tree) — všech 9 SFC je nativních Vapor (D05aa/D05ab/D05ah). Explicitní DOM API, SSR, virtualizace 1 000 uzlů, oba drag režimy, unmount/cancel cleanup, hledání, collapse/expand all a checkboxový výběr ověřuje /vapor-tree-drag. Rodina zůstává otevřená pouze kvůli počáteční hydration odchylce HY01.
- [x] [TreeDms](../packages/UI/app/components/TreeDms) — všech 6 SFC je nativní Vapor (D05ai); strom, search, kontextové menu, soubor/složka, drop, SSR a hydrataci ověřuje /vapor-tree-dms-drop.
- [x] [Typography](../packages/UI/app/components/Typography) — Heading je 1 nativní Vapor SFC (D05t); slot, highlighted, UI styl, SSR a remount ověřeny.
- [x] [ValueFormatter](../packages/UI/app/components/ValueFormatter) — 1 nativní Vapor SFC (D05t); default/previous scoped sloty, vlastní formatter, attrs, SSR a Field/Table konzumenti ověřeni.
- [x] [VirtualScroller](../packages/UI/app/components/VirtualScroller) — oba SFC jsou nativní Vapor; D05ah přidalo sticky VirtualScrollerVertical používaný Pivotem. TanStack Virtual cesta i sticky Pivot cesta mají ověřené osy, resize, recyklaci, synchronizaci scrollu, SSR/hydrataci a kompatibilní API.
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
