import { useEffect, useRef } from 'react'

const NODE_COUNT = 28
const SIGNAL_COUNT = 10

function createNodes(width, height) {
  return Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * width,
    y: 8 + Math.random() * (height - 16),
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.2,
    r: 1.2 + Math.random() * 1.8,
    pulse: Math.random() * Math.PI * 2,
  }))
}

function createSignals(nodes) {
  return Array.from({ length: SIGNAL_COUNT }, () => {
    const from = Math.floor(Math.random() * nodes.length)
    let to = Math.floor(Math.random() * nodes.length)
    while (to === from) to = Math.floor(Math.random() * nodes.length)
    return {
      from,
      to,
      t: Math.random(),
      speed: 0.004 + Math.random() * 0.008,
    }
  })
}

export default function AIMotionStrip() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    let nodes = []
    let signals = []
    let raf = 0
    let width = 0
    let height = 0
    let dpr = 1
    let running = true

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = wrap.clientWidth
      height = wrap.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      nodes = createNodes(width, height)
      signals = createSignals(nodes)
    }

    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, width, height)

      // soft base glow line
      const grad = ctx.createLinearGradient(0, 0, width, 0)
      grad.addColorStop(0, 'rgba(194,181,162,0)')
      grad.addColorStop(0.5, 'rgba(194,181,162,0.04)')
      grad.addColorStop(1, 'rgba(194,181,162,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, height * 0.35, width, height * 0.3)

      // connections
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist > 120) continue
          const alpha = (1 - dist / 120) * 0.14
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(194,181,162,${alpha})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      }

      // traveling AI signals
      for (const s of signals) {
        const a = nodes[s.from]
        const b = nodes[s.to]
        if (!a || !b) continue
        s.t += s.speed
        if (s.t >= 1) {
          s.t = 0
          s.from = s.to
          let next = Math.floor(Math.random() * nodes.length)
          while (next === s.from) next = Math.floor(Math.random() * nodes.length)
          s.to = next
          s.speed = 0.004 + Math.random() * 0.008
          continue
        }
        const x = a.x + (b.x - a.x) * s.t
        const y = a.y + (b.y - a.y) * s.t
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 8)
        glow.addColorStop(0, 'rgba(237,234,228,0.45)')
        glow.addColorStop(0.4, 'rgba(194,181,162,0.25)')
        glow.addColorStop(1, 'rgba(194,181,162,0)')
        ctx.beginPath()
        ctx.fillStyle = glow
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.fillStyle = 'rgba(237,234,228,0.5)'
        ctx.arc(x, y, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

      // nodes
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 4 || n.x > width - 4) n.vx *= -1
        if (n.y < 6 || n.y > height - 6) n.vy *= -1
        n.pulse += 0.04
        const pulse = 0.55 + Math.sin(n.pulse) * 0.45

        ctx.beginPath()
        ctx.fillStyle = `rgba(194,181,162,${0.07 * pulse})`
        ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = `rgba(237,234,228,${0.18 + pulse * 0.22})`
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // Animation only — no label text
  return (
    <div
      ref={wrapRef}
      className="relative h-14 w-full overflow-hidden border-t border-white/[0.06] md:h-16"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-transparent to-ink" />
    </div>
  )
}
