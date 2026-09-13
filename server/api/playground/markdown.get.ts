import { parseMarkdown } from 'comark'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const id = Number(query.id)
  if (!Number.isInteger(id) || id < 0 || id >= 200) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid row' })
  }

  // A deterministic demo delay makes the transition from preview to body visible.
  await new Promise(resolve => setTimeout(resolve, (300 + id % 5 * 180) * (query.slow === 'true' ? 3 : 1)))
  const paragraphs = Array.from({ length: 1 + id % 4 }, (_, index) =>
    `Odstavec ${index + 1}: **Proměnlivá výška** vzniká až po načtení obsahu. Text se při zúžení zalamuje a sousední řádky musí zůstat přesně pod sebou. Každý záznam má vlastní délku a dorazí v jiném čase.`)
  const extras = [
    '> Krátká poznámka může zabrat jen několik řádků.',
    '- Načíst Markdown\n- Převést pomocí **Comark**\n- Přeměřit skutečnou výšku\n- Zachovat návaznost řádků',
    `\`\`\`ts\nconst row = { id: ${id}, loaded: true }\nconsole.log(row)\n\`\`\``,
    '| Fáze | Stav |\n| --- | --- |\n| HTTP požadavek | hotovo |\n| Comark | vykresleno |\n| Výška řádku | automatická |',
  ]
  const markdown = [`## Poznámka ${id + 1}`, ...paragraphs, extras[id % extras.length]].join('\n\n')

  return { document: await parseMarkdown(markdown) }
})
