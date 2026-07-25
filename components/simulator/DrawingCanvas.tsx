'use client'

import { useEffect, useRef, useState } from 'react'
import type { SimulatorChartHandle } from './SimulatorChart'

export type DrawingPt = { time: number; price: number }
export interface Drawing {
  id: string
  type: 'trend' | 'extended' | 'horizontal' | 'vertical' | 'channel' | 'rectangle' | 'fib'
  color: string
  pts: DrawingPt[]
}

const LINE_COLOR = '#FFD700'
const FIB_LEVELS  = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
const FIB_COLORS  = ['#26a69a', '#9e9e9e', '#9e9e9e', '#FFD700', '#9e9e9e', '#9e9e9e', '#ef5350']
const FIB_LABELS  = ['0', '23.6', '38.2', '50', '61.8', '78.6', '100']

function clicksNeeded(type: string) {
  if (type === 'vertical') return 1
  if (type === 'channel')  return 3
  return 2
}

interface Props {
  drawings: Drawing[]
  drawMode: string
  chartRef: React.RefObject<SimulatorChartHandle | null>
  onDrawingAdded: (d: Drawing) => void
  visible: boolean
  locked: boolean
}

export function DrawingCanvas({ drawings, drawMode, chartRef, onDrawingAdded, visible, locked }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [, forceUpdate] = useState(0)
  const [pending, setPending] = useState<{ type: string; pts: DrawingPt[] } | null>(null)
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Subscribe to chart range changes so SVG re-renders on zoom/pan
  useEffect(() => {
    function trySubscribe() {
      const h = chartRef.current
      if (!h) {
        const t = window.setTimeout(trySubscribe, 150)
        cleanupRef.current = () => clearTimeout(t)
        return
      }
      const update = () => forceUpdate(n => n + 1)
      h.subscribeRangeChange(update)
      cleanupRef.current = () => h.unsubscribeRangeChange(update)
    }
    trySubscribe()
    return () => cleanupRef.current?.()
  }, [chartRef])

  // Reset pending state when the active tool changes
  useEffect(() => { setPending(null); setMouse(null) }, [drawMode])

  const isDrawing = drawMode !== 'cursor' && drawMode !== ''

  // ── Coordinate helpers ──────────────────────────────────────────────────────
  const h = () => chartRef.current

  function tx(time: number)   { return h()?.timeToX(time)   ?? null }
  function py(price: number)  { return h()?.priceToY(price) ?? null }
  function xt(x: number)      { return h()?.xToTime(x)      ?? null }
  function yp(y: number)      { return h()?.yToPrice(y)     ?? null }

  function toXY(pt: DrawingPt) {
    const x = tx(pt.time); const y = py(pt.price)
    return (x != null && y != null) ? { x, y } : null
  }

  function svgSize() {
    const el = svgRef.current
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 800, h: 400 }
  }

  function extendedLine(x1: number, y1: number, x2: number, y2: number) {
    const { w, h } = svgSize()
    if (Math.abs(x2 - x1) < 0.001) return { x1, y1: 0, x2: x1, y2: h }
    const m = (y2 - y1) / (x2 - x1)
    const b = y1 - m * x1
    return { x1: 0, y1: b, x2: w, y2: m * w + b }
  }

  // ── Click handler ───────────────────────────────────────────────────────────
  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!isDrawing || locked) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Try the exact x; if it returns null (edge/gap), nudge inward slightly
    let time = xt(x) ?? xt(x + 4) ?? xt(x - 4) ?? xt(rect.width / 2)
    const price = yp(y) ?? yp(rect.height / 2)
    if (time == null || price == null) return

    const pt: DrawingPt = { time, price }
    const needed     = clicksNeeded(drawMode)
    const currentPts = (pending?.type === drawMode) ? pending.pts : []
    const newPts     = [...currentPts, pt]

    if (newPts.length >= needed) {
      onDrawingAdded({ id: `d-${Date.now()}`, type: drawMode as Drawing['type'], color: LINE_COLOR, pts: newPts })
      setPending(null)
    } else {
      setPending({ type: drawMode, pts: newPts })
    }
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!isDrawing) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  // ── Render committed drawings ───────────────────────────────────────────────
  function renderDrawing(d: Drawing, key: number) {
    const { w } = svgSize()
    const c = d.color

    switch (d.type) {
      case 'trend': {
        const [p1, p2] = d.pts.map(toXY); if (!p1 || !p2) return null
        return <line key={key} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={c} strokeWidth="1.5" />
      }
      case 'extended': {
        const [p1, p2] = d.pts.map(toXY); if (!p1 || !p2) return null
        const l = extendedLine(p1.x, p1.y, p2.x, p2.y)
        return <line key={key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={c} strokeWidth="1.5" />
      }
      case 'horizontal': {
        const p = toXY(d.pts[0]); if (!p) return null
        return <line key={key} x1={0} y1={p.y} x2={w} y2={p.y} stroke={c} strokeWidth="1" strokeDasharray="6 3" />
      }
      case 'vertical': {
        const p = toXY(d.pts[0]); if (!p) return null
        const { h: sh } = svgSize()
        return <line key={key} x1={p.x} y1={0} x2={p.x} y2={sh} stroke={c} strokeWidth="1" strokeDasharray="4 3" />
      }
      case 'channel': {
        const xys = d.pts.map(toXY); if (xys.some(p => !p)) return null
        const [p1, p2, p3] = xys as { x: number; y: number }[]
        const dx = p2.x - p1.x; const dy = p2.y - p1.y
        const len = Math.sqrt(dx*dx + dy*dy); if (len < 1) return null
        const nx = -dy/len; const ny = dx/len
        const off = (p3.x - p1.x)*nx + (p3.y - p1.y)*ny
        const ox = nx*off; const oy = ny*off
        const l1 = extendedLine(p1.x, p1.y, p2.x, p2.y)
        const l2 = extendedLine(p1.x+ox, p1.y+oy, p2.x+ox, p2.y+oy)
        return (
          <g key={key}>
            <line x1={l1.x1} y1={l1.y1} x2={l1.x2} y2={l1.y2} stroke={c} strokeWidth="1.5" />
            <line x1={l2.x1} y1={l2.y1} x2={l2.x2} y2={l2.y2} stroke={c} strokeWidth="1.5" />
            <line x1={l1.x1} y1={l1.y1} x2={l2.x1} y2={l2.y1} stroke={c} strokeWidth="0.5" strokeOpacity="0.35" strokeDasharray="4 4" />
            <line x1={l1.x2} y1={l1.y2} x2={l2.x2} y2={l2.y2} stroke={c} strokeWidth="0.5" strokeOpacity="0.35" strokeDasharray="4 4" />
          </g>
        )
      }
      case 'rectangle': {
        const [p1, p2] = d.pts.map(toXY); if (!p1 || !p2) return null
        const rx = Math.min(p1.x, p2.x); const ry = Math.min(p1.y, p2.y)
        const rw = Math.abs(p2.x - p1.x);  const rh = Math.abs(p2.y - p1.y)
        return <rect key={key} x={rx} y={ry} width={rw} height={rh} fill={c} fillOpacity="0.07" stroke={c} strokeWidth="1" />
      }
      case 'fib': {
        const [p1, p2] = d.pts
        const hi = Math.max(p1.price, p2.price); const lo = Math.min(p1.price, p2.price)
        const range = hi - lo
        return (
          <g key={key}>
            {FIB_LEVELS.map((lv, i) => {
              const fibPrice = hi - range * lv
              const fy = py(fibPrice); if (fy == null) return null
              return (
                <g key={lv}>
                  <line x1={0} y1={fy} x2={w} y2={fy} stroke={FIB_COLORS[i]} strokeWidth="0.9" strokeOpacity="0.85" />
                  <text x={w - 6} y={fy - 3} fill={FIB_COLORS[i]} fontSize="9" fontFamily="monospace" textAnchor="end">
                    {FIB_LABELS[i]}%  ${fibPrice.toFixed(2)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      }
      default: return null
    }
  }

  // ── Preview while placing points ────────────────────────────────────────────
  function renderPreview() {
    if (!pending || !mouse) return null
    const { mx, my } = { mx: mouse.x, my: mouse.y }
    const { w } = svgSize()
    const lastXY = toXY(pending.pts[pending.pts.length - 1])
    if (!lastXY) return null

    switch (pending.type) {
      case 'trend':
        return <line x1={lastXY.x} y1={lastXY.y} x2={mx} y2={my} stroke={LINE_COLOR} strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
      case 'extended': {
        const allXYs = pending.pts.map(toXY).filter(Boolean) as { x: number; y: number }[]
        allXYs.push({ x: mx, y: my })
        if (allXYs.length < 2) return <line x1={allXYs[0].x} y1={allXYs[0].y} x2={mx} y2={my} stroke={LINE_COLOR} strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
        const l = extendedLine(allXYs[0].x, allXYs[0].y, allXYs[1].x, allXYs[1].y)
        return <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={LINE_COLOR} strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
      }
      case 'horizontal':
        return <line x1={0} y1={lastXY.y} x2={w} y2={lastXY.y} stroke={LINE_COLOR} strokeWidth="1" strokeDasharray="6 3" opacity="0.7" />
      case 'channel': {
        if (pending.pts.length === 1) {
          return <line x1={lastXY.x} y1={lastXY.y} x2={mx} y2={my} stroke={LINE_COLOR} strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
        }
        const [p1xy, p2xy] = pending.pts.map(toXY) as [{ x: number; y: number }, { x: number; y: number }]
        const dx = p2xy.x - p1xy.x; const dy = p2xy.y - p1xy.y
        const len = Math.sqrt(dx*dx + dy*dy); if (len < 1) return null
        const nx = -dy/len; const ny = dx/len
        const off = (mx - p1xy.x)*nx + (my - p1xy.y)*ny
        const ox = nx*off; const oy = ny*off
        const l1 = extendedLine(p1xy.x, p1xy.y, p2xy.x, p2xy.y)
        const l2 = extendedLine(p1xy.x+ox, p1xy.y+oy, p2xy.x+ox, p2xy.y+oy)
        return (
          <g opacity="0.7">
            <line x1={l1.x1} y1={l1.y1} x2={l1.x2} y2={l1.y2} stroke={LINE_COLOR} strokeWidth="1.5" />
            <line x1={l2.x1} y1={l2.y1} x2={l2.x2} y2={l2.y2} stroke={LINE_COLOR} strokeWidth="1.5" strokeDasharray="5 4" />
          </g>
        )
      }
      case 'rectangle': {
        const p1xy = toXY(pending.pts[0]); if (!p1xy) return null
        const rx = Math.min(p1xy.x, mx); const ry = Math.min(p1xy.y, my)
        const rw = Math.abs(mx - p1xy.x);  const rh = Math.abs(my - p1xy.y)
        return <rect x={rx} y={ry} width={rw} height={rh} fill={LINE_COLOR} fillOpacity="0.05" stroke={LINE_COLOR} strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
      }
      case 'fib': {
        const p1 = pending.pts[0]
        const p2price = yp(my); if (p2price == null) return null
        const hi = Math.max(p1.price, p2price); const lo = Math.min(p1.price, p2price)
        const range = hi - lo
        return (
          <g opacity="0.55">
            {FIB_LEVELS.map((lv, i) => {
              const fy = py(hi - range * lv); if (fy == null) return null
              return <line key={lv} x1={0} y1={fy} x2={w} y2={fy} stroke={FIB_COLORS[i]} strokeWidth="0.9" />
            })}
          </g>
        )
      }
      default: return null
    }
  }

  // Anchor dots for pending points
  function renderDots() {
    if (!pending) return null
    return (
      <>
        {pending.pts.map((pt, i) => {
          const xy = toXY(pt); if (!xy) return null
          return <circle key={i} cx={xy.x} cy={xy.y} r={4} fill={LINE_COLOR} fillOpacity="0.85" stroke="#131722" strokeWidth="1.5" />
        })}
      </>
    )
  }

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      style={{
        pointerEvents: isDrawing ? 'all' : 'none',
        cursor:        isDrawing ? 'crosshair' : 'default',
        visibility:    visible   ? 'visible' : 'hidden',
        userSelect:    'none',
        overflow:      'visible',
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse(null)}
    >
      {drawings.map((d, i) => renderDrawing(d, i))}
      {renderPreview()}
      {renderDots()}
    </svg>
  )
}
