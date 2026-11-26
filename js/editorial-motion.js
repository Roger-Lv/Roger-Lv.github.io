// The document is fully visible before any scroll enhancement runs.
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const hero = document.querySelector('.home-masthead')
  const headings = document.querySelectorAll('.recent-post-info > .article-title, #post #article-container > h2')
  let cleanup

  function updateMotion () {
    cleanup?.()
    if (preference.matches) return

    let frame = 0
    let range = 1
    let lastProgress = -1
    function paintHero () {
      frame = 0
      const progress = Math.max(0, Math.min(1, window.scrollY / range))
      if (progress !== lastProgress) {
        hero.style.setProperty('--hero-progress', progress.toFixed(3))
        lastProgress = progress
      }
    }
    function schedulePaint () {
      if (!frame) frame = requestAnimationFrame(paintHero)
    }
    function measureHero () {
      range = Math.max(1, hero.offsetHeight * 0.72)
      schedulePaint()
    }
    if (hero) {
      measureHero()
      window.addEventListener('scroll', schedulePaint, { passive: true })
      window.addEventListener('resize', measureHero)
    }

    // Only reveal a heading on arrival. Keep the initial viewport and anchor landings still.
    const animations = new Set()
    let observer
    if ('IntersectionObserver' in window && Element.prototype.animate) {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const heading = entry.target
          observer.unobserve(heading)
          if (heading.matches(':target, :focus-visible') || document.hidden) continue
          const animation = heading.animate([
            { transform: 'translateY(11px)', opacity: 0.68 },
            { transform: 'translateY(0)', opacity: 1 }
          ], { duration: 530, easing: 'cubic-bezier(.2,.7,.2,1)' })
          animations.add(animation)
          animation.onfinish = () => animations.delete(animation)
        }
      }, { threshold: 0.12 })
      for (const heading of headings) {
        const bounds = heading.getBoundingClientRect()
        if (bounds.top >= innerHeight || bounds.bottom <= 0) observer.observe(heading)
      }
    }
    cleanup = () => {
      window.removeEventListener('scroll', schedulePaint)
      window.removeEventListener('resize', measureHero)
      cancelAnimationFrame(frame)
      hero?.style.removeProperty('--hero-progress')
      observer?.disconnect()
      for (const animation of animations) animation.cancel()
    }
  }

  updateMotion()
  preference.addEventListener('change', updateMotion)
})()
