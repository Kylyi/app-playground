# UI Component Migration Guide

This document describes the process for migrating components from the OLD architecture to the NEW architecture with function-based UI props and extracted default styling constants.

## Overview of Changes

The migration involves:

1. **Creating a default-props constant file** - Extracts all visual/styling logic into a dedicated constants file
2. **Updating the props type definition** - Converting static UI props to function-based callbacks with defaults access
3. **Refactoring the component** - Removing inline styles/SCSS and using computed style properties with merged defaults

---

## Important: Payload Parameters vs CSS Selectors

### What to Pass as Payload Parameters

Only pass **stable/rarely-changing props** as payload parameters to the default-props functions:

**GOOD - Pass these as payload:**
- `size` - Typically set once and doesn't change
- `contained` - Layout configuration that stays constant
- `variant` - Usually static per component instance

**BAD - Never pass these as payload:**
- `state` - Changes frequently (e.g., `checked`/`unchecked` on toggle)
- `isOpen` - Changes on every interaction
- `isActive` - Changes frequently

### Why This Matters

Passing frequently-changing values as payload causes the computed property to re-run on every change:

```typescript
// BAD - Re-runs computed on every state change
const toggleClass = computed(() => {
  return mergedProps.value?.ui?.toggleClass?.({
    defaults: TOGGLE_DEFAULT_PROPS.ui.toggleClass({ state: model.value }), // state changes often!
  })
})

// GOOD - Only re-runs when size/contained changes
const toggleClass = computed(() => {
  return mergedProps.value?.ui?.toggleClass?.({
    defaults: TOGGLE_DEFAULT_PROPS.ui.toggleClass({
      size: props.size ?? 'sm',
      contained: props.contained ?? false,
    }),
  })
})
```

### Use CSS Selectors for Dynamic State

Instead of passing dynamic state as payload, use CSS selectors to handle state-based styling:

```typescript
// For the element itself, use [&.class-name]:
const checked = '[&.is-checked]:(bg-positive/15 border-positive)'
const unchecked = '[&.is-unchecked]:(bg-negative/15 border-negative)'

// For child elements, use group selectors:
const checkedBullet = 'group-[.is-checked]/toggle:(bg-positive)'
const uncheckedBullet = 'group-[.is-unchecked]/toggle:(bg-negative)'
```

Then apply the state classes directly in the template:

```vue
<div
  class="toggle group/toggle"
  :class="[
    `is-${model}`,
    { 'is-hoverable': hoverable, 'is-readonly': readonly },
    toggleClass,
  ]"
>
```

---

## Migration Steps

### Step 1: Create the Default Props Constant File

Create a new file: `constants/{component-name}-default-props.constant.ts`

#### Key Requirements:

- Add `// @unocss-include` directive at the top for UnoCSS tree-shaking
- Export a constant named `{COMPONENT_NAME}_DEFAULT_PROPS`
- Each `ui` property should be a **function** that returns an object with:
  - Individual class parts (e.g., `base`, `font`, `position`)
  - An `all` property that combines everything
- Only accept **stable props** as payload parameters (see above)

#### Structure Pattern:

```typescript
// @unocss-include

export const {COMPONENT_NAME}_DEFAULT_PROPS = {
  ui: {
    // Simple function - no payload needed
    containerClass() {
      const base = 'flex gap-2 items-center'
      const variant = '[&.variant--primary]:(bg-primary color-white)'

      return {
        base,
        variant,
        all: `${base} ${variant}`,
      } as const
    },

    // Function with stable payload parameters
    bulletClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg'
      contained: boolean
    }) {
      const { size, contained } = payload

      const base = 'rounded-full'

      // Compute size-based classes
      const sizes = {
        xs: 'h-5 w-5',
        sm: 'h-6 w-6',
        md: 'h-7 w-7',
        lg: 'h-8 w-8',
      } as const

      const sizeClass = sizes[size]

      // State-based styling via CSS selectors (NOT payload)
      const checked = 'group-[.is-checked]/toggle:(bg-positive)'
      const unchecked = 'group-[.is-unchecked]/toggle:(bg-negative)'

      return {
        base,
        sizes,
        checked,
        unchecked,
        all: `${base} ${sizeClass} ${checked} ${unchecked}`,
      } as const
    },
  },
}
```

#### Styling with CSS Group Selectors:

For state-based styling, use UnoCSS group selectors instead of payload parameters:

```typescript
// For the element itself:
const checked = '[&.is-checked]:(bg-positive/15 border-positive)'
const disabled = '[&.is-disabled]:(cursor-not-allowed op-50)'

// For child elements that need parent state awareness:
// Container must have: class="component group/component"
const checkedIcon = 'group-[.is-checked]/component:i-lucide:check'
const uncheckedIcon = 'group-[.is-unchecked]/component:i-lucide:x'
```

The group name (`/component`) matches the `group/{name}` class on the container element.

---

### Step 2: Update the Props Type Definition

Modify `types/{component-name}-props.type.ts`

#### Changes Required:

1. **Add import for the default props constant type:**

```typescript
import type { {COMPONENT_NAME}_DEFAULT_PROPS } from '../constants/{component-name}-default-props.constant'
```

2. **Convert UI properties from static to function-based:**

**BEFORE (OLD):**

```typescript
ui?: {
  labelClass?: ClassType
  labelStyle?: CSSProperties
  iconClass?: ClassType
  iconStyle?: CSSProperties
}
```

**AFTER (NEW):**

```typescript
ui?: {
  containerClass?: (payload: {
    defaults: ReturnType<typeof {COMPONENT_NAME}_DEFAULT_PROPS['ui']['containerClass']>
  }) => ClassType

  containerStyle?: () => CSSProperties

  labelClass?: (payload: {
    defaults: ReturnType<typeof {COMPONENT_NAME}_DEFAULT_PROPS['ui']['labelClass']>
  }) => ClassType

  labelStyle?: () => CSSProperties

  iconClass?: (payload: {
    defaults: ReturnType<typeof {COMPONENT_NAME}_DEFAULT_PROPS['ui']['iconClass']>
  }) => ClassType

  iconStyle?: () => CSSProperties
}
```

#### Key Points:

- `*Class` properties receive `{ defaults }` payload for accessing default values
- `*Style` properties are simple functions returning `CSSProperties`
- Always include `containerClass` and `containerStyle` for the root element

---

### Step 3: Refactor the Component

Modify the main component file: `{ComponentName}.vue`

#### 3.1 Update Imports

**BEFORE:**

```typescript
// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'
```

**AFTER:**

```typescript
// Constants
import { {COMPONENT_NAME}_DEFAULT_PROPS } from './constants/{component-name}-default-props.constant'
```

Note: `getComponentProps` and `getComponentMergedProps` are available globally (auto-imported).

#### 3.2 Add Style Computed Properties

For each UI element, create computed properties for class and style. Only pass stable props as payload:

```typescript
// Styles - container (no payload needed)
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: {COMPONENT_NAME}_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - bullet (with stable payload parameters)
const bulletClass = computed(() => {
  return mergedProps.value?.ui?.bulletClass?.({
    defaults: {COMPONENT_NAME}_DEFAULT_PROPS.ui.bulletClass({
      size: props.size ?? 'sm',
      contained: props.contained ?? false,
    }),
  })
})

const bulletStyle = computed(() => {
  return mergedProps.value?.ui?.bulletStyle?.()
})
```

#### 3.3 Update Template

**BEFORE:**

```vue
<div
  class="component"
  :class="[
    `component--${variant}`,
    { 'is-outlined': outlined },
  ]"
>
  <div
    class="component-label"
    :class="mergedProps.ui?.labelClass"
    :style="mergedProps.ui?.labelStyle"
  >
```

**AFTER:**

```vue
<div
  class="component group/component"
  :class="[
    `is-${state}`,
    { 'is-outlined': outlined, 'is-disabled': disabled },
    containerClass,
  ]"
  :style="containerStyle"
>
  <div
    class="component-label"
    :class="labelClass"
    :style="labelStyle"
  >
```

Key changes:

- Add `group/{component-name}` class to the root element for group selector support
- Apply state classes directly in template (e.g., `` `is-${state}` ``) for CSS selectors to match
- Apply boolean state classes directly (e.g., `{ 'is-disabled': disabled }`)
- Use the computed class/style properties

#### 3.4 Remove SCSS Styles

Move all visual styling from `<style>` to the default-props constant using UnoCSS classes.

**Keep in SCSS:**

- Transitions and animations
- Keyframes
- Anything that can't be expressed in UnoCSS

**Move to default-props:**

- All visual styling (colors, backgrounds, borders)
- Layout classes (flex, grid, padding, margin)
- Typography
- State-specific styles (via CSS selectors)

---

### Step 4: Update the Config File

In `libs/UI/config.ts`, ensure the component config uses the new function-based UI props.

**Important:** The config should use `defaults.all` - don't add custom styling classes here:

```typescript
{componentName}: {
  props: {
    // ... other props
    ui: {
      containerClass: ({ defaults }) => defaults.all,
      labelClass: ({ defaults }) => defaults.all,
      iconClass: ({ defaults }) => defaults.all,
    },
  },
  merge: ['ui'],
},
```

The `({ defaults }) => defaults.all` pattern applies all default styles. Consumers can customize when using the component:

```typescript
// Use only specific defaults
ui: {
  containerClass: ({ defaults }) => `${defaults.base} custom-class`,
}

// Override completely
ui: {
  containerClass: () => 'my-custom-container-class',
}
```

---

## File Structure (After Migration)

```
ComponentName/
├── ComponentName.vue                    # Main component
├── constants/
│   └── component-name-default-props.constant.ts  # Default styling
└── types/
    └── component-name-props.type.ts     # Props type definition
```

---

## Example: Toggle Component Migration

### Summary of Changes

| Aspect            | OLD                                    | NEW                                                 |
| ----------------- | -------------------------------------- | --------------------------------------------------- |
| Styling location  | SCSS in `<style>` block                | UnoCSS in `default-props.constant.ts`               |
| UI prop types     | `toggleClass?: (state) => ClassType`   | `toggleClass?: (payload: { defaults }) => ClassType`|
| State styling     | Passed as function argument            | CSS selectors (`[&.is-checked]:...`)                |
| Stable props      | Not distinguished                      | Passed as payload (`size`, `contained`)             |
| Config styling    | Custom classes inline                  | `defaults.all` only                                 |

### Toggle Default Props Pattern

```typescript
// @unocss-include

export const TOGGLE_DEFAULT_PROPS = {
  ui: {
    toggleClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
      contained: boolean
    }) {
      const { size, contained } = payload

      const base = 'flex items-center cursor-pointer rounded-full border-1'

      // Size classes computed from stable payload
      const sizes = {
        xs: 'w-8 h-4.5',
        sm: 'w-9.5 h-5.5',
        // ...
      } as const

      const sizeClass = sizes[size]

      // State styling via CSS selectors (NOT payload)
      const checked = '[&.is-checked]:(bg-positive/15 border-positive)'
      const unchecked = '[&.is-unchecked]:(bg-negative/15 border-negative)'
      const disabled = '[&.is-disabled]:(cursor-not-allowed op-50)'

      return {
        base,
        sizes,
        checked,
        unchecked,
        disabled,
        all: `${base} ${sizeClass} ${checked} ${unchecked} ${disabled}`,
      } as const
    },

    bulletClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
      contained: boolean
    }) {
      const { size, contained } = payload

      const base = 'rounded-full flex flex-center'

      // State colors via group selectors
      const checked = 'group-[.is-checked]/toggle:(bg-positive)'
      const unchecked = 'group-[.is-unchecked]/toggle:(bg-negative)'

      // Position based on state via group selectors
      const checkedPosition = 'group-[.is-checked]/toggle:(translate-x-16px)'
      const uncheckedPosition = 'group-[.is-unchecked]/toggle:(translate-x--8px)'

      return {
        base,
        checked,
        unchecked,
        checkedPosition,
        uncheckedPosition,
        all: `${base} ${checked} ${unchecked} ${checkedPosition} ${uncheckedPosition}`,
      } as const
    },
  },
}
```

### Toggle Component Template

```vue
<div
  class="toggle group/toggle"
  :class="[
    `is-${model}`,
    { 'is-hoverable': hoverable, 'is-readonly': readonly, 'is-disabled': disabled },
    toggleClass,
  ]"
  :style="toggleStyle"
>
  <div
    class="bullet"
    :class="bulletClass"
    :style="bulletStyle"
  />
</div>
```

---

## Benefits of New Architecture

1. **Customizability**: Consumers can access individual style parts (`defaults.base`, `defaults.font`) and compose custom styles
2. **Type Safety**: Full TypeScript support with `ReturnType<typeof ...>` patterns
3. **Separation of Concerns**: Visual styling is separate from component logic
4. **Tree Shaking**: UnoCSS only includes used classes with `@unocss-include`
5. **Consistency**: All components follow the same pattern for UI customization
6. **No Runtime Style Computation**: Group selectors handle state at CSS level
7. **Performance**: Computed properties only re-run when stable props change, not on every state change

---

## Common Patterns

### Container with State Classes (via CSS Selectors)

```typescript
containerClass() {
  const base = 'flex items-center p-2 rounded-custom'
  
  // State styling via CSS selectors
  const checked = '[&.is-checked]:(bg-positive/15 border-positive)'
  const unchecked = '[&.is-unchecked]:(bg-negative/15 border-negative)'
  const disabled = '[&.is-disabled]:(cursor-not-allowed op-50)'

  return {
    base,
    checked,
    unchecked,
    disabled,
    all: `${base} ${checked} ${unchecked} ${disabled}`,
  }
}
```

### Child Element Aware of Parent State

```typescript
// Container must have: class="component group/component"
iconClass() {
  const base = 'w-6 h-6'
  
  // React to parent state via group selectors
  const checkedIcon = 'group-[.is-checked]/component:i-lucide:check'
  const uncheckedIcon = 'group-[.is-unchecked]/component:i-lucide:x'

  return {
    base,
    checkedIcon,
    uncheckedIcon,
    all: `${base} ${checkedIcon} ${uncheckedIcon}`,
  }
}
```

### Size Variants (via Payload)

```typescript
bulletClass(payload: { size: 'xs' | 'sm' | 'md' | 'lg' }) {
  const { size } = payload

  const base = 'rounded-full'

  const sizes = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8',
  } as const

  const sizeClass = sizes[size]

  return {
    base,
    sizes,
    all: `${base} ${sizeClass}`,
  }
}
```

### Combining Payload and CSS Selectors

```typescript
toggleClass(payload: {
  size: 'xs' | 'sm' | 'md' | 'lg'
  contained: boolean
}) {
  const { size, contained } = payload

  const base = 'flex items-center'

  // Stable props computed from payload
  const sizes = {
    xs: 'w-8 h-4.5',
    xsContained: 'w-8 h-4.5 m-x-1.5',
    sm: 'w-9.5 h-5.5',
    smContained: 'w-9.5 h-5.5 m-x-1.5',
  } as const

  const sizeKey = contained ? `${size}Contained` as const : size
  const sizeClass = sizes[sizeKey]

  // Dynamic state via CSS selectors
  const checked = '[&.is-checked]:(bg-positive/15)'
  const unchecked = '[&.is-unchecked]:(bg-negative/15)'

  return {
    base,
    sizes,
    checked,
    unchecked,
    all: `${base} ${sizeClass} ${checked} ${unchecked}`,
  }
}
```
