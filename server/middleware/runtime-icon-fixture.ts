export default defineEventHandler(async event => {
  if (event.path.split('?')[0] === '/api/_nuxt_icon/playground'
    && getQuery(event).icons === 'runtime-failed') {
    throw createError({ statusCode: 503, statusMessage: 'Example icon provider unavailable' })
  }
  // A real delayed local provider response exercises stale-result/disposal
  // handling without replacing fetch or intercepting requests in the browser.
  if (event.path.split('?')[0] === '/api/runtime-icon'
    && getQuery(event).name === 'playground:runtime-slow') {
    await new Promise(resolve => setTimeout(resolve, 700))
  }
})
