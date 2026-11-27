;(() => {
  if (customElements.get('path-figure')) return
  const css = new URL('../css/path-figure.css', document.currentScript.src)
  const svgNS = 'http://www.w3.org/2000/svg'
  function svg(tag, attrs, text) {
    const el = document.createElementNS(svgNS, tag)
    for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
    if (text !== undefined) el.textContent = text
    return el
  }

  // Clip a centre-to-centre segment at the edge of a device, including diagonals.
  function port([x, y], [tx, ty]) {
    const scale = 1 / Math.max(Math.abs(tx - x) / 53, Math.abs(ty - y) / 23)
    return [x + (tx - x) * scale, y + (ty - y) * scale]
  }

  class PathFigure extends HTMLElement {
    connectedCallback() {
      this.abort = new AbortController()
      const { signal } = this.abort
      this.init(signal).catch(() => {
        if (signal.aborted) return
        // The author's static caption stays visible if the asset is unavailable.
        if (this.shadowRoot) this.shadowRoot.replaceChildren(document.createElement('slot'))
      })
    }
    disconnectedCallback() {
      this.abort.abort()
      this.observer?.disconnect()
      cancelAnimationFrame(this.frame)
    }

    async init(signal) {
      const response = await fetch(this.getAttribute('src'), { signal })
      if (!response.ok) throw new Error('Figure could not be loaded')
      const model = await response.json()
      if (signal.aborted) return
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' })
      root.innerHTML = `<link rel="stylesheet"><section><header><h4></h4><span class="count"></span></header>
        <svg class="map" role="img" viewBox="0 0 396 208" preserveAspectRatio="xMidYMid meet"><desc></desc><g class="edges"></g><g class="devices"></g></svg>
        <div class="caption"><strong></strong><p></p></div>
        <label>步骤进度<input type="range" min="0" step="1"></label>
        <div class="controls"><button type="button" class="prev">上一步</button><button type="button" class="play">播放</button><button type="button" class="next">下一步</button></div></section>`
      const get = (selector) => root.querySelector(selector)
      get('link').href = css
      get('h4').textContent = model.title
      get('section').setAttribute('aria-label', model.title)
      const map = get('.map')
      map.setAttribute('aria-label', model.title)
      get('desc').textContent = model.description
      const positions = new Map()
      const labels = new Map()
      for (const [id, x, y, name, value] of model.nodes) {
        const group = svg('g', { transform: 'translate(' + x + ' ' + y + ')' })
        const state = svg('text', { y: 13, class: 'value' }, value)
        group.append(
          svg('rect', { x: -53, y: -23, width: 106, height: 46, rx: 3 }),
          svg('text', { y: -4, class: 'name' }, name),
          state,
        )
        get('.devices').append(group)
        positions.set(id, [x, y])
        labels.set(id, { state, group, value })
      }
      const edges = new Map()
      for (const [id, from, to, bends = []] of model.edges) {
        const a = positions.get(from),
          b = positions.get(to)
        const points = [port(a, bends[0] || b), ...bends, port(b, bends.at(-1) || a)]
        const group = svg('g', { class: 'edge' })
        const line = svg('polyline', { points: points.map((p) => p.join(',')).join(' ') })
        const packet = svg('path', { class: 'packet', d: 'M -5 -4 L 5 0 L -5 4 Z' })
        group.append(line, packet)
        get('.edges').append(group)
        edges.set(id, { group, line, packet, to, length: line.getTotalLength() })
      }

      const motion = matchMedia('(prefers-reduced-motion: reduce)')
      const range = get('input'),
        play = get('.play')
      const last = model.steps.length - 1
      const duration = 3800
      let step = 0,
        elapsed = 0,
        running = false,
        inView = false,
        previousTime
      let active = []
      range.max = last
      range.setAttribute('aria-label', model.title + '，步骤进度')

      const draw = () => {
        const progress = motion.matches ? 0.6 : 0.08 + 0.84 * Math.min(1, elapsed / duration)
        for (const edge of active) {
          const dist = edge.length * progress
          const p = edge.line.getPointAtLength(dist)
          const q = edge.line.getPointAtLength(dist + 0.4)
          const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI
          edge.packet.setAttribute(
            'transform',
            'translate(' + p.x + ' ' + p.y + ') rotate(' + angle + ')',
          )
        }
      }
      const show = (index) => {
        step = index
        elapsed = 0
        const current = model.steps[index]
        active = current.move.map((id) => edges.get(id))
        for (const edge of edges.values())
          edge.group.classList.toggle('active', active.includes(edge))
        const values = Object.assign({}, ...model.steps.slice(0, index + 1).map((s) => s.values))
        for (const [id, node] of labels) {
          node.state.textContent = values[id] ?? node.value
          node.group.classList.toggle(
            'selected',
            Object.hasOwn(current.values, id) || active.some((e) => e.to === id),
          )
        }
        get('.count').textContent = index + 1 + ' / ' + model.steps.length
        get('.caption strong').textContent = current.title
        get('.caption p').textContent = current.text
        range.value = index
        range.setAttribute('aria-valuetext', '第 ' + (index + 1) + ' 步，' + current.title)
        get('.prev').disabled = index === 0
        get('.next').disabled = index === last
        draw()
      }
      const setRunning = (enabled) => {
        cancelAnimationFrame(this.frame)
        running = enabled
        previousTime = undefined
        play.textContent = enabled ? '暂停' : step === last ? '重播' : '播放'
        if (enabled && inView && !document.hidden) this.frame = requestAnimationFrame(tick)
      }
      const tick = (now) => {
        if (signal.aborted || !running || !inView || document.hidden) return
        elapsed += previousTime === undefined ? 0 : now - previousTime
        previousTime = now
        if (elapsed >= duration) {
          if (step === last) {
            setRunning(false)
            return
          }
          show(step + 1)
        }
        draw()
        this.frame = requestAnimationFrame(tick)
      }
      const select = (index) => {
        show(index)
        setRunning(false)
      }
      range.addEventListener('input', () => select(Number(range.value)), { signal })
      get('.prev').addEventListener('click', () => select(step - 1), { signal })
      get('.next').addEventListener('click', () => select(step + 1), { signal })
      play.addEventListener(
        'click',
        () => {
          if (!running && step === last) show(0)
          setRunning(!running)
        },
        { signal },
      )
      document.addEventListener('visibilitychange', () => setRunning(running), { signal })
      motion.addEventListener(
        'change',
        () => {
          setRunning(false)
          draw()
        },
        { signal },
      )
      let initial = true
      this.observer = new IntersectionObserver(
        (entries) => {
          inView = entries[0].isIntersecting
          if (inView && initial) {
            initial = false
            setRunning(!motion.matches)
          } else setRunning(running)
        },
        { threshold: 0.15 },
      )
      show(0)
      this.observer.observe(this)
    }
  }
  customElements.define('path-figure', PathFigure)
})()
