# B09 — vlastnictví konfigurace a modelů

Audit všech 42 produkčních použití `initRef` v UI. Z nich 23 nahrazeno readonly
`computed` a 19 ponecháno jako model. `initRef` samotný se nemění.

| Vlastník | Readonly konfigurace (původně `initRef`) | Zachované modely a důvod zápisu |
| --- | --- | --- |
| List | `loading`, `itemKey`, `itemLabel`, `clearable`, `noFilter`, `hiddenItems` | `search` — hledání; `selection` — výběr; `addedItems` — přidání/odebrání |
| Tree | `idKey`, `labelKey`, `childrenKey`, `parentKey`, `maxLevel` | `search`, `selection`; `meta` — collapse a metadata uzlů; `modelValue` — vložení/odebrání/přesun uzlů |
| TreeDms | `fileKey`, `folderKey`, `noNodeIcon` | Žádný z revidovaných propů; výběr, editace a context menu jsou interní refy |
| Form | `loading`, `submitDisabled`, `submitConfirmation` | `isEditing` — edit/cancel a režim bez ovládacích prvků; `errors` — obousměrná vazba ErrorsSection |
| Pivot | `loading` | `config` a `items` — uživatelské změny v PivotConfiguration; `data` — výsledek načítání |
| QueryBuilder | `allowNegation`, `maxLevel`, `breakpoint` | Žádný z revidovaných propů; vlastní model QueryBuilderu není předmětem převodu `initRef` |
| Menu | `virtualConfig` | `modelValue` — otevření/zavření; `virtualDimensions` — přesun a resize |
| Selector | `loading` | `modelValue`, `search`, `addedItems`; `options` — načítání přes List a mazání při skrytí menu |
| useInputUtils | Žádný z revidovaných propů | `modelValue` — editace inputu; samostatný draft pro debounce/emitOnBlur/masku zůstává |

Rozhodnutí vychází z veřejných props, ovládacích prvků a volajících. Například
Pivot `config` je přes svůj název editovatelný model; `loading` je ve všech zde
revidovaných komponentách pouze vstup. Interní request/transform loading zůstává
samostatným stavem, kombinovaným s tímto vstupem.

Konfigurační gettery sledují původní props, tedy i defaulty z `getComponentProps`.
Fallback se použije pouze pro `undefined`, explicitní `null` se nepřepisuje.
Gettery nemají setter ani vlastní kopii props. Nové objektové fallbacky Menu
vznikají pro každý store zvlášť. Readonly ref není hluboké zmrazení objektu parenta.

Odstraněny odpovídající `update:*` deklarace z komponent i emit typů. TreeDms už
nepotřebuje prázdné `defineEmits`. SelectorMenu předává Listu `:loading` místo
`v-model:loading`; pro tento vstup žádná implementace neemituje změnu. Externí
konzumenti těchto konfiguračních eventů mají používat jednosměrné props a měnit je
u vlastníka, nikoliv zapisovat do store. `getComponentProps` a `ui` API zůstávají.

Navazující reaktivita:

- List odvozuje Fuse konfiguraci z aktuálního `itemLabel` a search configu.
- Výchozí třídění Listu vzniká odvozením; nedoplňuje se mutací do objektu parenta.
- Přepočet položek Listu reaguje také na změny klíčů, filtrace a odvozené konfigurace.
- Tree přepočítává uzly při změně `idKey`, `labelKey` a `childrenKey`, i bez výměny
  dat; chybějící data při přepočtu znamenají prázdný strom.

Ověření: `store-config.spec.ts` pokrývá všechny rodiny, readonly refy, změny props,
obnovu defaultů, absenci update emisí, odvozené ikony TreeDms a virtual režim Menu.
List scénář kontroluje změnu klíče, labelu a třídění při zamrzlé konfiguraci parenta.
`store-models.spec.ts` už nepovažuje konfiguraci TreeDms/QueryBuilder za writable
model a ověřuje skutečné modely v controlled, one-way i local režimu a reset parentem.
Zachované testy `init-ref.spec.ts` a `component-props.spec.ts` pokrývají fallbacky,
null/undefined, objekty a izolaci defaultů. Celkem 22 cílených unit testů.
Prošlo také 16 produkčních Playwright scénářů Selectoru, formulářů (ArkType/Zod)
a Vapor probe včetně SSR, hydratace, focusu, modelů a remountu.

Tento audit neuzavírá obecný B07: zbývající `defineModel`, `useVModel`, `syncRef`
a hluboké mutace modelů se musí posoudit při migraci dalších komponent. Ani
jednorázové kopie konfigurace mimo původní použití `initRef` nejsou tímto auditem
plošně certifikované. DOM a lifecycle překážky zůstávají v C–E.
