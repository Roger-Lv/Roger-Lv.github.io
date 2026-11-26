// Two damped radial waves and an A–A′ section through the same samples.
const columns = 112
const rows = 48
const section = 31
const width = 1536
const height = 880

const paper = {
  light: { ground: [231, 237, 240], face: [249, 251, 249], ink: [24, 45, 60], pigments: [[61, 83, 171], [36, 142, 145], [138, 93, 159]] },
  dark: { ground: [18, 29, 39], face: [25, 42, 56], ink: [188, 210, 222], pigments: [[128, 154, 227], [107, 207, 202], [189, 156, 209]] }
}

function mix (a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t))
}
const rgb = color => 'rgb(' + color.join(',') + ')'

function wave (x, y, cx, cy, strength) {
  const dx = x - cx
  const radius = Math.hypot(dx, 1.08 * (y - cy))
  const amplitude = strength * Math.exp(-(1.50 - 0.52 * Math.tanh(dx * 1.4)) * (radius / 1.62) ** 1.32)
  const angle = 3.45 * radius + 0.08 * radius * radius
  return [amplitude * Math.cos(angle), amplitude * Math.sin(angle)]
}

function createMesh () {
  return Array.from({ length: rows + 1 }, (_, i) => {
    const y = -2 + 3.9 * i / rows
    return Array.from({ length: columns + 1 }, (_, j) => {
      const x = -3.7 + 8.15 * j / columns
      const [a, b] = wave(x, y, -1.13, -0.63, 1.44)
      const [c, d] = wave(x, y, 0.42, 0.52, 1.12)
      return { x: 716 + (x + 0.48 * y) * 140, base: 345 + (-0.095 * x + 0.60 * y) * 133, a, b, c, d, y: 0, z: 0 }
    })
  })
}

function line (ctx, points, color, weight) {
  ctx.strokeStyle = color
  ctx.lineWidth = weight
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let j = 1; j < points.length; j++) ctx.lineTo(points[j].x, points[j].y)
  ctx.stroke()
}

function paint (ctx, mesh, seconds, dark, strokeScale) {
  const palette = dark ? paper.dark : paper.light
  const phase = seconds * Math.PI / 5.8
  const ca = Math.cos(phase), sa = Math.sin(phase)
  const cb = Math.cos(phase * 0.75 + 0.36), sb = Math.sin(phase * 0.75 + 0.36)
  for (const row of mesh) {
    for (const p of row) {
      p.z = p.a * ca + p.b * sa + p.c * cb + p.d * sb
      p.y = p.base - p.z * 161
    }
  }
  ctx.setTransform(ctx.canvas.width / width, 0, 0, ctx.canvas.height / height, 0, 0)
  ctx.fillStyle = rgb(palette.ground)
  ctx.fillRect(0, 0, width, height)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  const pen = rgb(mix(palette.ground, palette.ink, dark ? 0.86 : 0.85))
  const finePen = rgb(mix(palette.ground, palette.ink, dark ? 0.63 : 0.56))
  const cut = ctx.createLinearGradient(100, 0, 1450, 0)
  palette.pigments.forEach((ink, i) => cut.addColorStop(i / 2, rgb(mix(ink, palette.ink, dark ? 0.04 : 0.27))))

  // Paint strips from back to front so each wave hides the mesh behind it.
  for (let i = 1; i <= rows; i++) {
    const back = mesh[i - 1], front = mesh[i]
    const wash = ctx.createLinearGradient(front[0].x, 0, front[columns].x, 0)
    for (let j = 0; j <= columns; j += 8) {
      const u = j / columns
      const z = front[j].z
      const position = Math.max(0, Math.min(1, u + 0.15 * Math.sin(phase * 0.5 + 5 * u - i / rows) + 0.10 * z))
      const band = position < 0.5 ? 0 : 1
      const pigment = mix(palette.pigments[band], palette.pigments[band + 1], position * 2 - band)
      const slope = front[Math.min(columns, j + 2)].z - front[Math.max(0, j - 2)].z
      const tint = 0.42 + 0.23 * Math.tanh(z) - 0.17 * Math.tanh(slope * 1.8)
      wash.addColorStop(u, rgb(mix(palette.face, pigment, tint)))
    }
    ctx.fillStyle = wash
    ctx.beginPath()
    ctx.moveTo(back[0].x, back[0].y)
    for (let j = 1; j <= columns; j++) ctx.lineTo(back[j].x, back[j].y)
    for (let j = columns; j >= 0; j--) ctx.lineTo(front[j].x, front[j].y)
    ctx.closePath()
    ctx.fill()
    line(ctx, back, i - 1 === section ? cut : finePen, i - 1 === section ? 5.6 : 1.45 * strokeScale)
    ctx.beginPath()
    for (let j = 0; j <= columns; j += 4) {
      ctx.moveTo(back[j].x, back[j].y)
      ctx.lineTo(front[j].x, front[j].y)
    }
    ctx.strokeStyle = finePen
    ctx.lineWidth = 1.25 * strokeScale
    ctx.stroke()
    line(ctx, front, i === section ? cut : (i % 4 ? finePen : pen), i === section ? 5.6 : (i % 4 ? 1.45 : 2.05) * strokeScale)
  }

  const base = 747, left = 139, right = width - left
  ctx.setLineDash([4, 8])
  line(ctx, [{ x: left, y: base }, { x: right, y: base }], finePen, 1.25)
  ctx.setLineDash([])
  const trace = mesh[section].map((p, j) => ({ x: left + (right - left) * j / columns, y: base - 70 * p.z }))
  line(ctx, trace, cut, 4.5)
  ctx.fillStyle = pen
  ctx.font = 'italic 26px Georgia, serif'
  for (const profile of [mesh[section], trace]) {
    ctx.textAlign = 'right'
    ctx.fillText('A', profile[0].x - 12, profile[0].y + 8)
    ctx.textAlign = 'left'
    ctx.fillText('A′', profile[columns].x + 12, profile[columns].y + 8)
  }
}

function mount (figure) {
  const canvas = figure.querySelector('canvas')
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return
  const button = figure.querySelector('button')
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const mesh = createMesh()
  let inView = false, paused = false
  let frame = 0, last = 0, elapsed = 0, strokeScale = 1

  function draw () {
    paint(ctx, mesh, elapsed, document.documentElement.dataset.theme === 'dark', strokeScale)
  }
  function tick (now) {
    if (last === 0 || now - last >= 1000 / 30 - 1) {
      if (last) elapsed += Math.min(now - last, 100) / 1000
      last = now
      draw()
    }
    frame = requestAnimationFrame(tick)
  }
  function playback () {
    cancelAnimationFrame(frame)
    last = 0
    button.hidden = motion.matches
    if (motion.matches) elapsed = 0
    draw()
    if (inView && !paused && !motion.matches && !document.hidden) frame = requestAnimationFrame(tick)
  }
  function resize () {
    const density = Math.max(1.5, Math.min(devicePixelRatio || 1, 2))
    const cssWidth = Math.max(1, canvas.clientWidth)
    strokeScale = Math.max(1, Math.min(1.55, 565 / cssWidth))
    canvas.width = Math.max(1, Math.round(cssWidth * density))
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * density))
    draw()
  }
  canvas.hidden = false
  resize()
  button.addEventListener('click', () => {
    paused = !paused
    button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation')
    button.title = button.getAttribute('aria-label')
    button.classList.toggle('is-paused', paused)
    playback()
  })
  new ResizeObserver(resize).observe(figure)
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; playback() }).observe(figure)
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  document.addEventListener('visibilitychange', playback)
  motion.addEventListener('change', playback)
}

const figure = document.querySelector('.echo-figure')
if (figure && window.ResizeObserver && window.IntersectionObserver) mount(figure)
