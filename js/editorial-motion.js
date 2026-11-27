// Slice copies of the typeset ink. Native text keeps its line breaks, selection and accessible name.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)')
  const hero = document.querySelector('.home-masthead')
  const title = hero?.querySelector('#site-title')
  const clamp = n => Math.max(0, Math.min(1, n))
  let stopMotion

  function splitMasthead () {
    if (!title || !window.ResizeObserver) return () => {}
    const textNode = title.firstChild
    if (textNode?.nodeType !== Node.TEXT_NODE) return () => {}
    const text = textNode.data
    const glyphs = window.Intl?.Segmenter
      ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), s => s.segment)
      : Array.from(text)
    const overlay = document.createElement('span')
    overlay.className = 'type-overlay'
    overlay.setAttribute('aria-hidden', 'true')
    title.append(overlay)
    let groups = [], frame = 0, range = 160, progress = -1, previousTime = 0, disposed = false

    let moving = false, intensity = 0, quietTimer = 0

    function measure () {
      if (disposed) return
      title.style.setProperty('--type-settle', '0')
      const box = title.getBoundingClientRect()
      const lineHeight = parseFloat(getComputedStyle(title).lineHeight)
      range = Math.max(85, box.top + scrollY + Math.min(box.height * 0.42, 78))
      const inkRange = document.createRange()
      const fragment = document.createDocumentFragment()
      let offset = 0
      groups = []
      for (const glyph of glyphs) {
        inkRange.setStart(textNode, offset)
        offset += glyph.length
        if (!glyph.trim()) continue
        inkRange.setEnd(textNode, offset)
        const rect = inkRange.getBoundingClientRect()
        const row = Math.floor((rect.top + rect.height / 2 - box.top) / lineHeight)
        const top = row * lineHeight, bottom = top + lineHeight
        const left = rect.left - box.left, right = rect.right - box.left
        const seam = top + lineHeight * 0.54, slant = Math.min(0.08 * lineHeight, rect.width * 0.16)
        const group = document.createElement('span')
        group.className = 'type-glyph'
        for (const upper of [true, false]) {
          const piece = document.createElement('span')
          piece.className = upper ? 'type-piece upper' : 'type-piece lower'
          piece.dataset.ink = text
          const a = upper ? top - 1 : seam + slant
          const b = upper ? top - 1 : seam - slant
          const c = upper ? seam - slant + 0.4 : bottom + 1
          const d = upper ? seam + slant + 0.4 : bottom + 1
          piece.style.clipPath = `polygon(${left}px ${a}px, ${right}px ${b}px, ${right}px ${c}px, ${left}px ${d}px)`
          group.append(piece)
        }
        groups.push(group)
        fragment.append(group)
      }
      overlay.replaceChildren(fragment)
      progress = -1
      schedule()
    }

    function render (now) {
      frame = 0
      const target = clamp(scrollY / range)
      const dt = Math.min(70, now - previousTime)
      previousTime = now
      progress = progress < 0 ? target : progress + (target - progress) * (1 - Math.exp(-dt / 48))
      if (Math.abs(progress - target) < 0.002) progress = target
      const targetIntensity = moving && target > 0 && target < 0.84 ? 1 : 0
      intensity += (targetIntensity - intensity) * (1 - Math.exp(-dt / (moving ? 48 : 105)))
      if (Math.abs(intensity - targetIntensity) < 0.004) intensity = targetIntensity
      const splitting = progress > 0.005 && progress < 0.84 && intensity > 0
      title.classList.toggle('is-split', splitting)
      title.style.setProperty('--type-settle', clamp((progress - 0.84) / 0.16).toFixed(3))
      if (splitting) {
        groups.forEach((g, index) => {
          const delay = 0.24 * index / Math.max(1, groups.length - 1)
          const local = clamp((progress - delay) / 0.60)
          const split = intensity * Math.sin(Math.PI * local) ** 2
          g.style.setProperty('--cut', split.toFixed(3))
        })
      }
      if (progress !== target || intensity !== targetIntensity) schedule()
    }
    function schedule () {
      if (!frame) frame = requestAnimationFrame(render)
    }
    const sizes = new ResizeObserver(measure)
    sizes.observe(hero, { box: 'border-box' })
    document.fonts?.ready.then(measure)
    function onScroll () {
      if (scrollY >= range && progress === 1 && intensity === 0) return
      clearTimeout(quietTimer)
      moving = true
      quietTimer = setTimeout(() => { moving = false; schedule() }, 215)
      schedule()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    measure()
    return () => {
      disposed = true
      sizes.disconnect()
      cancelAnimationFrame(frame)
      clearTimeout(quietTimer)
      window.removeEventListener('scroll', onScroll)
      title.classList.remove('is-split')
      title.style.removeProperty('--type-settle')
      overlay.remove()
    }
  }

  function revealHeadings () {
    if (!window.IntersectionObserver || !Element.prototype.animate) return () => {}
    const headings = document.querySelectorAll('.topic-atlas .index-heading h2, #post #article-container > h2')
    if (!headings.length) return () => {}
    const active = new Set()
    function reveal (el) {
      const node = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
      const simple = node && Array.from(el.childNodes).every(n => n === node || n.nodeType === Node.TEXT_NODE && !n.textContent.trim() || n.nodeType === Node.ELEMENT_NODE && n.matches('a.headerlink'))
      if (!simple || !CSS.supports('mask-image', 'repeating-linear-gradient(#000 0 .53lh, transparent .53lh 1lh)')) {
        const animation = el.animate([{ opacity: 0.7, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400 })
        const cancel = () => animation.cancel()
        active.add(cancel)
        animation.onfinish = () => active.delete(cancel)
        return
      }
      const block = document.createElement('span')
      block.className = 'split-text'
      const ink = document.createElement('span')
      ink.className = 'line-overlay'
      ink.setAttribute('aria-hidden', 'true')
      ink.dataset.ink = node.data
      node.replaceWith(block)
      block.append(node, ink)
      function finish () {
        clearTimeout(timer)
        block.replaceWith(node)
        active.delete(finish)
      }
      const timer = setTimeout(finish, 850)
      active.add(finish)
    }
    function onArrival (entries, observer) {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        if (!document.hidden && !entry.target.matches(':target, :focus-visible')) reveal(entry.target)
      }
    }
    const observer = new IntersectionObserver(onArrival, { threshold: 0.15 })
    const sections = new IntersectionObserver(onArrival, { rootMargin: '0px 0px -45% 0px' })
    const waiting = Array.from(headings).filter(el => {
      const bounds = el.getBoundingClientRect()
      return el.closest('.index-heading') || bounds.top >= innerHeight || bounds.bottom <= 0
    })
    function start () {
      for (const el of waiting) {
        if (el.closest('.index-heading')) sections.observe(el)
        else observer.observe(el)
      }
    }
    // Let the opening composition rest until the reader actually scrolls.
    if (scrollY > 0) start()
    else window.addEventListener('scroll', start, { once: true, passive: true })
    return () => {
      window.removeEventListener('scroll', start)
      observer.disconnect()
      sections.disconnect()
      for (const finish of active) finish()
    }
  }

  function configure () {
    stopMotion?.()
    stopMotion = undefined
    if (preference.matches) return
    const stopHero = splitMasthead()
    const stopHeadings = revealHeadings()
    stopMotion = () => { stopHero(); stopHeadings() }
  }
  configure()
  preference.addEventListener('change', configure)
})()
