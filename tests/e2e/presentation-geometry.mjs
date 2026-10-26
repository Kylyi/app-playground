import { expect } from '@playwright/test'

/** The fixture's external slot label must not shrink or cover the circle. */
export async function expectCircleFixtureLayout(circle) {
  await expect.poll(() => circle.locator('svg').evaluate(element => element.getBoundingClientRect().width))
    .toBeCloseTo(80, 1)
  const bounds = await circle.evaluate(element => {
    const label = element.querySelector(':scope > div').getBoundingClientRect()
    const slot = element.querySelector('[data-testid="circle-slot"]').getBoundingClientRect()
    const example = element.closest('[data-testid="presentation-primitives-example"]').getBoundingClientRect()

    return { labelRight: label.right, slotLeft: slot.left, slotRight: slot.right, exampleRight: example.right }
  })
  expect(bounds.slotLeft - bounds.labelRight).toBeGreaterThanOrEqual(8)
  expect(bounds.slotRight).toBeLessThanOrEqual(bounds.exampleRight)
}
