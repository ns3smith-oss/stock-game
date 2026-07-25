'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  UTCTimestamp,
} from 'lightweight-charts'
import type { CrosshairInfo } from './ChartLegend'

export interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  vwap?: number
}

export interface EMAData {
  ema9: (number | null)[]
  ema20: (number | null)[]
  ema200: (number | null)[]
}

export interface SimulatorChartHandle {
  getContainerRect: () => DOMRect | null
  timeToX: (time: number) => number | null
  priceToY: (price: number) => number | null
  xToTime: (x: number) => number | null
  yToPrice: (y: number) => number | null
  subscribeRangeChange: (cb: () => void) => void
  unsubscribeRangeChange: (cb: () => void) => void
  setVisibleTimeRange: (from: number, to: number) => void
}

interface Props {
  candles: CandleData[]
  emaData: EMAData
  onCrosshairMove: (info: CrosshairInfo | null) => void
}

// Format a UTC timestamp as Eastern Time
function fmtET(ts: number, tickType: number): string {
  const d = new Date(ts * 1000)
  // tickType: 0=year 1=month 2=day 3=time 4=time+sec
  if (tickType <= 2) {
    return d.toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' })
  }
  return d.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export const SimulatorChart = forwardRef<SimulatorChartHandle, Props>(
  ({ candles, emaData, onCrosshairMove }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
    const vwapSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
    const candlesRef = useRef<CandleData[]>([])
    const emaDataRef = useRef<EMAData>(emaData)

    useImperativeHandle(ref, () => ({
      getContainerRect: () => containerRef.current?.getBoundingClientRect() ?? null,
      timeToX:  (t) => chartRef.current?.timeScale().timeToCoordinate(t as UTCTimestamp) as number ?? null,
      priceToY: (p) => candleSeriesRef.current?.priceToCoordinate(p) as number ?? null,
      xToTime:  (x) => chartRef.current?.timeScale().coordinateToTime(x) as number ?? null,
      yToPrice: (y) => candleSeriesRef.current?.coordinateToPrice(y) ?? null,
      subscribeRangeChange:   (cb) => chartRef.current?.timeScale().subscribeVisibleLogicalRangeChange(cb),
      unsubscribeRangeChange: (cb) => chartRef.current?.timeScale().unsubscribeVisibleLogicalRangeChange(cb),
      setVisibleTimeRange: (from, to) => chartRef.current?.timeScale().setVisibleRange({ from: from as UTCTimestamp, to: to as UTCTimestamp }),
    }), [])

    // Create chart once
    useEffect(() => {
      if (!containerRef.current) return

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#131722' },
          textColor: '#787B86',
        },
        grid: {
          vertLines: { color: '#1e222d' },
          horzLines: { color: '#1e222d' },
        },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: '#2a2e39' },
        timeScale: {
          borderColor: '#2a2e39',
          timeVisible: true,
          secondsVisible: false,
          tickMarkFormatter: (time: number, tickType: number) => fmtET(time, tickType),
        },
        localization: {
          timeFormatter: (time: number) => fmtET(time, 3),
        },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      })

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      })

      const vwapSeries = chart.addSeries(LineSeries, {
        color: '#8B00FF',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })

      const ema9Series = chart.addSeries(LineSeries, {
        color: '#E0E0E0',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })

      const ema20Series = chart.addSeries(LineSeries, {
        color: '#909090',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })

      const ema200Series = chart.addSeries(LineSeries, {
        color: '#3B82F6',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      })

      chartRef.current = chart
      candleSeriesRef.current = candleSeries
      volumeSeriesRef.current = volumeSeries
      vwapSeriesRef.current = vwapSeries
      ema9SeriesRef.current = ema9Series
      ema20SeriesRef.current = ema20Series
      ema200SeriesRef.current = ema200Series

      // Crosshair move → update legend
      chart.subscribeCrosshairMove((param) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!param.time || !param.seriesData) { onCrosshairMove(null); return }
        const t = param.time as number
        const idx = candlesRef.current.findIndex((c) => c.time === t)
        if (idx === -1) { onCrosshairMove(null); return }
        const candle = candlesRef.current[idx]
        onCrosshairMove({
          candle,
          ema9: emaDataRef.current?.ema9?.[idx] ?? null,
          ema20: emaDataRef.current?.ema20?.[idx] ?? null,
          ema200: emaDataRef.current?.ema200?.[idx] ?? null,
        })
      })

      const ro = new ResizeObserver(() => {
        if (containerRef.current) {
          chart.applyOptions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          })
        }
      })
      ro.observe(containerRef.current)

      return () => {
        ro.disconnect()
        chart.remove()
        chartRef.current = null
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Keep refs in sync for crosshair callback
    useEffect(() => { candlesRef.current = candles }, [candles])
    useEffect(() => { emaDataRef.current = emaData }, [emaData])

    // Update OHLCV + VWAP
    useEffect(() => {
      if (!candleSeriesRef.current || !volumeSeriesRef.current || !vwapSeriesRef.current) return
      if (candles.length === 0) {
        candleSeriesRef.current.setData([])
        volumeSeriesRef.current.setData([])
        vwapSeriesRef.current.setData([])
        return
      }

      candleSeriesRef.current.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open, high: c.high, low: c.low, close: c.close,
        }))
      )
      volumeSeriesRef.current.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? '#26a69a40' : '#ef535040',
        }))
      )
      vwapSeriesRef.current.setData(
        candles.filter((c) => c.vwap != null).map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.vwap!,
        }))
      )
    }, [candles])

    // Update EMA lines
    useEffect(() => {
      if (!ema9SeriesRef.current || !ema20SeriesRef.current || !ema200SeriesRef.current) return
      if (candles.length === 0 || !emaData?.ema9) {
        ema9SeriesRef.current.setData([])
        ema20SeriesRef.current.setData([])
        ema200SeriesRef.current.setData([])
        return
      }

      function toLineData(vals: (number | null)[] | undefined) {
        if (!vals) return []
        return candles
          .map((c, i) => ({ time: c.time as UTCTimestamp, value: vals[i] ?? null }))
          .filter((d): d is { time: UTCTimestamp; value: number } => d.value !== null)
      }

      ema9SeriesRef.current.setData(toLineData(emaData.ema9))
      ema20SeriesRef.current.setData(toLineData(emaData.ema20))
      ema200SeriesRef.current.setData(toLineData(emaData.ema200))
    }, [candles, emaData])

    return (
      <div ref={containerRef} className="w-full h-full cursor-default" />
    )
  }
)

SimulatorChart.displayName = 'SimulatorChart'
