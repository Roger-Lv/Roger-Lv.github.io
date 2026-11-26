/**
 * Refer to hexo-generator-searchdb
 * https://github.com/next-theme/hexo-generator-searchdb/blob/main/dist/search.js
 * Modified by hexo-theme-butterfly
 */

const escapeSearchText = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

class LocalSearch {
  constructor ({
    path = '',
    top_n_per_article = 1
  }) {
    this.path = path
    this.top_n_per_article = top_n_per_article
    this.isfetched = false
    this.datas = null
  }

  getIndexByWord (words, text, caseSensitive = false) {
    const index = []
    const included = new Set()

    if (!caseSensitive) {
      text = text.toLowerCase()
    }
    words.forEach(word => {
      const wordLen = word.length
      if (wordLen === 0) return
      let startPosition = 0
      let position = -1
      if (!caseSensitive) {
        word = word.toLowerCase()
      }
      while ((position = text.indexOf(word, startPosition)) > -1) {
        index.push({ position, word })
        included.add(word)
        startPosition = position + wordLen
      }
    })
    // Sort index by position of keyword
    index.sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position
      }
      return right.word.length - left.word.length
    })
    return [index, included]
  }

  // Merge hits into slices
  mergeIntoSlice (start, end, index) {
    let item = index[0]
    let { position, word } = item
    const hits = []
    const count = new Set()
    while (position + word.length <= end && index.length !== 0) {
      count.add(word)
      hits.push({
        position,
        length: word.length
      })
      const wordEnd = position + word.length

      // Move to next position of hit
      index.shift()
      while (index.length !== 0) {
        item = index[0]
        position = item.position
        word = item.word
        if (wordEnd > position) {
          index.shift()
        } else {
          break
        }
      }
    }
    return {
      hits,
      start,
      end,
      count: count.size
    }
  }

  // Highlight title and content
  highlightKeyword (val, slice) {
    let result = ''
    let index = slice.start
    for (const { position, length } of slice.hits) {
      result += escapeSearchText(val.substring(index, position))
      index = position + length
      result += `<mark class="search-keyword">${escapeSearchText(val.substr(position, length))}</mark>`
    }
    result += escapeSearchText(val.substring(index, slice.end))
    return result
  }

  getResultItems (keywords) {
    const resultItems = []
    this.datas.forEach(({ title, content, url }) => {
      // The number of different keywords included in the article.
      const [indexOfTitle, keysOfTitle] = this.getIndexByWord(keywords, title)
      const [indexOfContent, keysOfContent] = this.getIndexByWord(keywords, content)
      const includedCount = new Set([...keysOfTitle, ...keysOfContent]).size

      // Show search results
      const hitCount = indexOfTitle.length + indexOfContent.length
      if (hitCount === 0) return

      const slicesOfTitle = []
      if (indexOfTitle.length !== 0) {
        slicesOfTitle.push(this.mergeIntoSlice(0, title.length, indexOfTitle))
      }

      let slicesOfContent = []
      while (indexOfContent.length !== 0) {
        const item = indexOfContent[0]
        const { position } = item
        // Cut out 120 characters. The maxlength of .search-input is 80.
        const start = Math.max(0, position - 20)
        const end = Math.min(content.length, position + Math.max(100, item.word.length))
        slicesOfContent.push(this.mergeIntoSlice(start, end, indexOfContent))
      }

      // Sort slices in content by included keywords' count and hits' count
      slicesOfContent.sort((left, right) => {
        if (left.count !== right.count) {
          return right.count - left.count
        } else if (left.hits.length !== right.hits.length) {
          return right.hits.length - left.hits.length
        }
        return left.start - right.start
      })

      // Select top N slices in content
      const upperBound = parseInt(this.top_n_per_article, 10)
      if (upperBound >= 0) {
        slicesOfContent = slicesOfContent.slice(0, upperBound)
      }

      let resultItem = ''

      url = new URL(url, location.origin)
      url.searchParams.append('highlight', keywords.join(' '))

      const displayedTitle = slicesOfTitle.length ? this.highlightKeyword(title, slicesOfTitle[0]) : escapeSearchText(title)
      resultItem = `<li class="local-search-hit-item"><a href="${escapeSearchText(url.href)}"><span class="search-result-title">${displayedTitle}</span>`
      slicesOfContent.forEach(slice => {
        resultItem += `<p class="search-result">${this.highlightKeyword(content, slice)}…</p>`
      })
      resultItem += '</a></li>'
      resultItems.push({
        item: resultItem,
        id: resultItems.length,
        titleHits: keysOfTitle.size,
        hitCount,
        includedCount
      })
    })
    return resultItems
  }

  async fetchData () {
    const response = await fetch(this.path)
    if (!response.ok) throw new Error('Search index HTTP ' + response.status)
    let entries
    if (this.path.endsWith('.json')) {
      entries = await response.json()
    } else {
      const xml = new DOMParser().parseFromString(await response.text(), 'application/xml')
      if (xml.querySelector('parsererror')) throw new Error('Invalid search index')
      entries = Array.from(xml.querySelectorAll('entry'), entry => ({
        title: entry.querySelector('title').textContent,
        url: entry.querySelector('url').textContent,
        content: entry.querySelector('content')?.textContent || ''
      }))
    }
    const decoder = document.createElement('textarea')
    this.datas = entries.filter(entry => entry.title && entry.url).map(entry => {
      // Existing HTML indexes and the compact text index use HTML entities for code.
      decoder.innerHTML = (entry.content || '').replace(/<[^>]+>/g, ' ').replace(/</g, '&lt;')
      return { title: entry.title.trim(), url: entry.url, content: decoder.value.trim() }
    })
    this.isfetched = true
  }

  // Highlight by wrapping node in mark elements with the given class name
  highlightText (node, slice, className) {
    const val = node.nodeValue
    let index = slice.start
    const children = []
    for (const { position, length } of slice.hits) {
      const text = document.createTextNode(val.substring(index, position))
      index = position + length
      const mark = document.createElement('mark')
      mark.className = className
      mark.appendChild(document.createTextNode(val.substr(position, length)))
      children.push(text, mark)
    }
    node.nodeValue = val.substring(index, slice.end)
    children.forEach(element => {
      node.parentNode.insertBefore(element, node)
    })
  }

  // Highlight the search words provided in the url in the text
  highlightSearchWords (body) {
    const params = new URL(location.href).searchParams.get('highlight')
    const keywords = params ? params.split(' ') : []
    if (!keywords.length || !body) return
    const walk = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null)
    const allNodes = []
    while (walk.nextNode()) {
      if (!walk.currentNode.parentElement.closest('button, select, textarea, script, style, .mermaid-wrap, .katex, .search-keyword')) allNodes.push(walk.currentNode)
    }
    allNodes.forEach(node => {
      const [indexOfNode] = this.getIndexByWord(keywords, node.nodeValue)
      if (!indexOfNode.length) return
      const slice = this.mergeIntoSlice(0, node.nodeValue.length, indexOfNode)
      this.highlightText(node, slice, 'search-keyword')
    })
  }
}

const initLocalSearch = () => {
  const dialog = document.querySelector('#local-search dialog')
  const trigger = document.querySelector('#search-button > .search')
  if (!dialog || !trigger) return
  const { path, top_n_per_article, languages, preload } = GLOBAL_CONFIG.localSearch
  const search = new LocalSearch({ path, top_n_per_article })
  const input = dialog.querySelector('input')
  const results = dialog.querySelector('#local-search-results')
  const stats = dialog.querySelector('#local-search-stats-wrap')
  const status = dialog.querySelector('#loading-database')
  const retry = dialog.querySelector('.search-retry')
  const loadingText = status.textContent
  let fetching

  const update = () => {
    if (!search.isfetched) return
    const query = input.value.trim()
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    results.replaceChildren()
    stats.textContent = ''
    if (!words.length) return
    const hits = search.getResultItems([...new Set(words)])
    hits.sort((a, b) => b.includedCount - a.includedCount || b.titleHits - a.titleHits || b.hitCount - a.hitCount || a.id - b.id)
    stats.textContent = hits.length
      ? languages.hits_stats.replace('${hits}', hits.length)
      : languages.hits_empty.replace('${query}', () => query)
    if (hits.length) results.innerHTML = '<ol class="search-result-list">' + hits.map(hit => hit.item).join('') + '</ol>'
  }

  const load = async () => {
    if (search.isfetched || fetching) return
    status.hidden = false
    status.textContent = loadingText
    retry.hidden = true
    fetching = search.fetchData()
    try {
      await fetching
      status.hidden = true
      update()
    } catch {
      status.textContent = 'The search index could not be loaded.'
      retry.hidden = false
    } finally {
      fetching = null
    }
  }

  const open = () => {
    if (dialog.open) return
    dialog.showModal()
    btf.overflowPaddingR.add()
    input.focus()
    load()
  }
  const bindTrigger = () => btf.addEventListenerPjax(document.querySelector('#search-button > .search'), 'click', open)
  bindTrigger()
  input.addEventListener('input', update)
  retry.addEventListener('click', load)
  dialog.querySelector('.search-close-button').addEventListener('click', () => dialog.close())
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault()
      dialog.close()
    }
  })
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return
    const rect = dialog.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close()
  })
  dialog.addEventListener('close', () => {
    btf.overflowPaddingR.remove()
    document.querySelector('#search-button > .search')?.focus({ preventScroll: true })
  })
  search.highlightSearchWords(document.getElementById('article-container'))
  if (preload) load()
  window.addEventListener('pjax:complete', () => {
    if (dialog.open) dialog.close()
    bindTrigger()
    search.highlightSearchWords(document.getElementById('article-container'))
  })
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLocalSearch, { once: true })
else initLocalSearch()
