import { readFileSync } from 'node:fs'
import process from 'node:process'

export const experiment = process.env.VAPOR_PERFORMANCE_EXPERIMENT
  ? JSON.parse(readFileSync(process.env.VAPOR_PERFORMANCE_EXPERIMENT, 'utf8'))
  : undefined

export const variants = experiment?.variants ?? {
  'vdom': { url: 'http://127.0.0.1:3023', parent: 'vdom', library: '2.3' },
  'vapor': { url: 'http://127.0.0.1:3024', parent: 'vdom', library: 'current' },
  'vapor-parent': { url: 'http://127.0.0.1:3025', parent: 'vapor', library: 'current' },
  'current-vdom': { url: 'http://127.0.0.1:3026', parent: 'vdom', library: 'current' },
}

export const families = ['table', 'tree', 'pivot', 'selector', 'scroller']
export const rowSelectors = {
  table: '.tr',
  tree: '.tree-node',
  pivot: '.pivot-content__rows .pivot-row-item',
  selector: '.control',
  scroller: '.benchmark-row',
}
