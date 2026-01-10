/**
 * Blurs any focused input element
 */
export function blurFocusedInput() {
  const activeElement = useSharedActiveElement()

  if (
    activeElement.value?.tagName === 'INPUT'
    || activeElement.value?.tagName === 'TEXTAREA'
    || activeElement.value?.contentEditable === 'true'
  ) {
    activeElement.value.blur()
  }
}
