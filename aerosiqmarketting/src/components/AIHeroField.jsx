import { useEffect, useRef } from 'react'

const NODE_COUNT = 54
const SIGNAL_COUNT = 18
const LINK_DIST = 150

function createNodes(width, height) {
  return Array.from({ length: NODE_COUNT }, (_, i) => {
    // Bias nodes toward the right half so text stays clear on the left
    const bias = i % 5 === 0 ? Math.random() * 0.45 : 0.38 + Math.random() * 0.62
    return {
      x: width * bias,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.4 + Math.random() * 2.2,
      pulse: Math.random() * Math.PI * 2,
      layer: Math.random(),
    }
  })
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
      speed: 0.0035 + Math.random() * 0.01,
      trail: [],
    }
  })
}

export default function AIHeroField() {
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
    let tick = 0

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
      tick += 1
      ctx.clearRect(0, 0, width, height)

      // soft AI aura on the right
      const aura = ctx.createRadialGradient(
        width * 0.72,
        height * 0.45,
        40,
        width * 0.72,
        height * 0.45,
        width * 0.55,
      )
      aura.addColorStop(0, 'rgba(194,181,162,0.14)')
      aura.addColorStop(0.45, 'rgba(194,181,162,0.04)')
      aura.addColorStop(1, 'rgba(194,181,162,0)')
      ctx.fillStyle = aura
      ctx.fillRect(0, 0, width, height)

      // concentric neural rings
      for (let r = 0; r < 4; r += 1) {
        const radius = 90 + r * 70 + Math.sin(tick * 0.01 + r) * 8
        ctx.beginPath()
        ctx.arc(width * 0.72, height * 0.45, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(194,181,162,${0.08 - r * 0.015})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // links
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist > LINK_DIST) continue
          const alpha = (1 - dist / LINK_DIST) * 0.35
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(194,181,162,${alpha})`
          ctx.lineWidth = 0.9
          ctx.stroke()
        }
      }

      // traveling signals with trails
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
          s.speed = 0.0035 + Math.random() * 0.01
          s.trail = []
          continue
        }

        const x = a.x + (b.x - a.x) * s.t
        const y = a.y + (b.y - a.y) * s.t
        s.trail.push({ x, y })
        if (s.trail.length > 12) s.trail.shift()

        for (let t = 0; t < s.trail.length; t += 1) {
          const p = s.trail[t]
          const o = (t / s.trail.length) * 0.55
          ctx.beginPath()
          ctx.fillStyle = `rgba(237,234,228,${o})`
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
          ctx.fill()
        }

        const glow = ctx.createRadialGradient(x, y, 0, x, y, 14)
        glow.addColorStop(0, 'rgba(237,234,228,0.95)')
        glow.addColorStop(0.35, 'rgba(194,181,162,0.45)')
        glow.addColorStop(1, 'rgba(194,181,162,0)')
        ctx.beginPath()
        ctx.fillStyle = glow
        ctx.arc(x, y, 14, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = '#edeae4'
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // nodes
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < width * 0.28 || n.x > width - 8) n.vx *= -1
        if (n.y < 8 || n.y > height - 8) n.vy *= -1
        n.pulse += 0.035
        const pulse = 0.5 + Math.sin(n.pulse) * 0.5

        ctx.beginPath()
        ctx.fillStyle = `rgba(194,181,162,${0.12 + pulse * 0.12})`
        ctx.arc(n.x, n.y, n.r * (2.8 + pulse), 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = `rgba(237,234,228,${0.4 + pulse * 0.5})`
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // scanning beam
      const beamX = ((tick * 1.4) % (width * 0.9)) + width * 0.08
      const beam = ctx.createLinearGradient(beamX - 40, 0, beamX + 40, 0)
      beam.addColorStop(0, 'rgba(194,181,162,0)')
      beam.addColorStop(0.5, 'rgba(194,181,162,0.07)')
      beam.addColorStop(1, 'rgba(194,181,162,0)')
      ctx.fillStyle = beam
      ctx.fillRect(beamX - 40, 0, 80, height)

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

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 to-transparent" />
    </div>
  )
}
