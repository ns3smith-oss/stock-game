'use client'

import { useState, useEffect, useRef } from 'react'

interface Result { ticker: string; name: string }

interface Props {
  value: string
  onChange: (ticker: string, name: string) => void
}

export function TickerSearch({ value, onChange }: Props) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 1) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results ?? [])
      setOpen(true)
    }, 300)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value.toUpperCase())}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="AAPL"
        className="w-24 bg-brand-surface border border-white/10 text-white text-sm font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-brand-purple uppercase"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
          {results.map((r) => (
            <button
              key={r.ticker}
              className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors flex items-center gap-2"
              onMouseDown={() => {
                onChange(r.ticker, r.name)
                setQuery(r.ticker)
                setOpen(false)
              }}
            >
              <span className="text-white font-bold text-sm w-14 shrink-0">{r.ticker}</span>
              <span className="text-brand-muted text-xs truncate">{r.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
