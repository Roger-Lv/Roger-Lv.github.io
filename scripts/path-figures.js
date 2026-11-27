'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { escapeHTML } = require('hexo-util')
const decode = require('entities').decodeHTML
const catalog = JSON.parse(
  fs.readFileSync(path.join(hexo.source_dir, '_data/article-figures.json'), 'utf8'),
)
const figures = new Map()

function markup(id) {
  if (figures.has(id)) return figures.get(id)
  const file = path.join(hexo.source_dir, 'figures', id + '.json')
  const { title, steps } = JSON.parse(fs.readFileSync(file, 'utf8'))
  const list = steps
    .map((s) => '<li><strong>' + escapeHTML(s.title) + '</strong>。' + escapeHTML(s.text) + '</li>')
    .join('')
  const result =
    '<div class="article-path"><path-figure src="/figures/' +
    id +
    '.json"><details><summary>' +
    escapeHTML(title) +
    ' · 分步图解</summary><ol>' +
    list +
    '</ol></details></path-figure></div>'
  figures.set(id, result)
  return result
}

// Only enrich full article pages. Feeds, search snippets and excerpts keep the author's prose.
hexo.extend.filter.register(
  'after_render:html',
  function (content) {
    if (!content.includes('id="article-container"') || content.includes('<path-figure '))
      return content
    const url = content.match(/<link rel="canonical" href="([^"]+)"/)
    if (!url) return content
    const key = decodeURIComponent(
      new URL(decode(url[1])).pathname.replace(/%(?![0-9a-f]{2})/gi, '%25'),
    )
      .replace(/index\.html$/, '')
      .normalize('NFC')
    const entries = catalog[key]
    if (!entries) return content
    return content.replace(
      /(<article\b[^>]*\bid="article-container"[^>]*>)([\s\S]*?)(<\/article>)/,
      (_, open, body, close) => {
        const positions = new Map()
        // Insert after the short introductory paragraph of the target section, when one exists.
        for (const h of body.matchAll(/<h[1-6]\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/h[1-6]>/g)) {
          const end = h.index + h[0].length
          const intro = body.slice(end).match(/^\s*<p\b[^>]*>[\s\S]*?<\/p>/)
          positions.set(decode(h[1]), end + (intro ? intro[0].length : 0))
        }
        const inserts = new Map()
        for (const { section, figure } of entries) {
          const at = positions.get(section) ?? body.length
          inserts.set(at, (inserts.get(at) || '') + markup(figure))
        }
        for (const [at, html] of [...inserts].sort((a, b) => b[0] - a[0]))
          body = body.slice(0, at) + html + body.slice(at)
        return open + body + '<script defer src="/js/path-figure.js"></script>' + close
      },
    )
  },
  30,
)
