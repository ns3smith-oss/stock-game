'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export type DrawMode = string

// ─── Sub-tool data ──────────────────────────────────────────────────────────

interface SubTool {
  id: string
  label: string
  shortcut?: string
  drawMode?: string // if set, passed to chart as functional draw mode
}
interface ToolGroup { label?: string; items: SubTool[] }
interface MainButtonDef {
  id: string
  tooltip: string
  groups: ToolGroup[]
  defaultSub: string
  standalone?: boolean // no flyout
  action?: 'delete-all' | 'toggle-lock' | 'toggle-visibility' | 'toggle-magnet'
}

const TOOL_BUTTONS: MainButtonDef[] = [
  {
    id: 'cursor',
    tooltip: 'Cursor',
    defaultSub: 'cross',
    groups: [{
      items: [
        { id: 'cross',  label: 'Cross',  drawMode: 'cursor' },
        { id: 'dot',    label: 'Dot',    drawMode: 'cursor' },
        { id: 'arrow',  label: 'Arrow',  drawMode: 'cursor' },
        { id: 'eraser', label: 'Eraser', drawMode: 'cursor' },
      ],
    }],
  },
  {
    id: 'lines',
    tooltip: 'Lines',
    defaultSub: 'trend-line',
    groups: [
      {
        label: 'LINES',
        items: [
          { id: 'trend-line',      label: 'Trend Line',      shortcut: '⌥T', drawMode: 'trend' },
          { id: 'ray',             label: 'Ray',                               drawMode: 'trend' },
          { id: 'info-line',       label: 'Info Line' },
          { id: 'extended-line',   label: 'Extended Line',                    drawMode: 'trend' },
          { id: 'trend-angle',     label: 'Trend Angle' },
          { id: 'horizontal-line', label: 'Horizontal Line', shortcut: '⌥H', drawMode: 'horizontal' },
          { id: 'horizontal-ray',  label: 'Horizontal Ray',  shortcut: '⌥J', drawMode: 'horizontal' },
          { id: 'vertical-line',   label: 'Vertical Line',   shortcut: '⌥V', drawMode: 'vertical' },
          { id: 'cross-line',      label: 'Cross Line',      shortcut: '⌥C' },
        ],
      },
      {
        label: 'CHANNELS',
        items: [
          { id: 'parallel-channel',  label: 'Parallel Channel' },
          { id: 'regression-trend',  label: 'Regression Trend' },
          { id: 'flat-top-bottom',   label: 'Flat Top/Bottom' },
          { id: 'disjoint-channel',  label: 'Disjoint Channel' },
        ],
      },
      {
        label: 'PITCHFORKS',
        items: [
          { id: 'pitchfork',           label: 'Pitchfork' },
          { id: 'schiff-pitchfork',    label: 'Schiff Pitchfork' },
          { id: 'mod-schiff-pitchfork',label: 'Modified Schiff Pitchfork' },
          { id: 'inside-pitchfork',    label: 'Inside Pitchfork' },
        ],
      },
    ],
  },
  {
    id: 'fibonacci',
    tooltip: 'Fibonacci',
    defaultSub: 'fib-retracement',
    groups: [
      {
        items: [
          { id: 'fib-retracement',        label: 'Fib Retracement',          shortcut: '⌥F' },
          { id: 'tb-fib-extension',       label: 'Trend-Based Fib Extension' },
          { id: 'fib-channel',            label: 'Fib Channel' },
          { id: 'fib-time-zone',          label: 'Fib Time Zone' },
          { id: 'fib-speed-res-fan',      label: 'Fib Speed Resistance Fan' },
          { id: 'tb-fib-time',            label: 'Trend-Based Fib Time' },
          { id: 'fib-circles',            label: 'Fib Circles' },
          { id: 'fib-spiral',             label: 'Fib Spiral' },
          { id: 'fib-speed-res-arcs',     label: 'Fib Speed Resistance Arcs' },
          { id: 'fib-wedge',              label: 'Fib Wedge' },
          { id: 'pitchfan',               label: 'Pitchfan' },
        ],
      },
      {
        label: 'GANN',
        items: [
          { id: 'gann-box',          label: 'Gann Box' },
          { id: 'gann-square-fixed', label: 'Gann Square Fixed' },
          { id: 'gann-square',       label: 'Gann Square' },
          { id: 'gann-fan',          label: 'Gann Fan' },
        ],
      },
    ],
  },
  {
    id: 'patterns',
    tooltip: 'Patterns',
    defaultSub: 'xabcd-pattern',
    groups: [
      {
        items: [
          { id: 'xabcd-pattern',    label: 'XABCD Pattern' },
          { id: 'cypher-pattern',   label: 'Cypher Pattern' },
          { id: 'head-shoulders',   label: 'Head and Shoulders' },
          { id: 'abcd-pattern',     label: 'ABCD Pattern' },
          { id: 'triangle-pattern', label: 'Triangle Pattern' },
          { id: 'three-drives',     label: 'Three Drives Pattern' },
        ],
      },
      {
        label: 'ELLIOTT WAVES',
        items: [
          { id: 'elliott-impulse',    label: 'Elliott Impulse Wave (12345)' },
          { id: 'elliott-correction', label: 'Elliott Correction Wave (ABC)' },
          { id: 'elliott-triangle',   label: 'Elliott Triangle Wave (ABCDE)' },
          { id: 'elliott-double',     label: 'Elliott Double Combo Wave (WXY)' },
          { id: 'elliott-triple',     label: 'Elliott Triple Combo Wave (WXYXZ)' },
        ],
      },
      {
        label: 'CYCLES',
        items: [
          { id: 'cyclic-lines',  label: 'Cyclic Lines' },
          { id: 'time-cycles',   label: 'Time Cycles' },
          { id: 'sine-line',     label: 'Sine Line' },
        ],
      },
    ],
  },
  {
    id: 'projection',
    tooltip: 'Projection',
    defaultSub: 'long-position',
    groups: [
      {
        label: 'PROJECTION',
        items: [
          { id: 'long-position',  label: 'Long Position',  drawMode: 'long-position' },
          { id: 'short-position', label: 'Short Position', drawMode: 'short-position' },
          { id: 'forecast',       label: 'Forecast' },
          { id: 'bars-pattern',   label: 'Bars Pattern' },
          { id: 'ghost-feed',     label: 'Ghost Feed' },
          { id: 'projection',     label: 'Projection' },
        ],
      },
      {
        label: 'VOLUME-BASED',
        items: [
          { id: 'anchored-vwap',       label: 'Anchored VWAP' },
          { id: 'fixed-range-vol-prof',label: 'Fixed Range Volume Profile' },
        ],
      },
      {
        label: 'MEASURER',
        items: [
          { id: 'price-range',          label: 'Price Range' },
          { id: 'date-range',           label: 'Date Range' },
          { id: 'date-price-range',     label: 'Date and Price Range' },
        ],
      },
    ],
  },
  {
    id: 'brush',
    tooltip: 'Brushes & Shapes',
    defaultSub: 'brush',
    groups: [
      {
        label: 'BRUSHES',
        items: [
          { id: 'brush',       label: 'Brush' },
          { id: 'highlighter', label: 'Highlighter' },
        ],
      },
      {
        label: 'ARROWS',
        items: [
          { id: 'arrow-marker',      label: 'Arrow Marker' },
          { id: 'draw-arrow',        label: 'Arrow' },
          { id: 'arrow-mark-up',     label: 'Arrow Mark Up' },
          { id: 'arrow-mark-down',   label: 'Arrow Mark Down' },
          { id: 'arrow-mark-left',   label: 'Arrow Mark Left' },
          { id: 'arrow-mark-right',  label: 'Arrow Mark Right' },
        ],
      },
      {
        label: 'SHAPES',
        items: [
          { id: 'rectangle',        label: 'Rectangle',         shortcut: '⌥⇧R' },
          { id: 'rotated-rect',     label: 'Rotated Rectangle' },
          { id: 'path',             label: 'Path' },
          { id: 'circle',           label: 'Circle' },
          { id: 'ellipse',          label: 'Ellipse' },
          { id: 'polyline',         label: 'Polyline' },
          { id: 'triangle',         label: 'Triangle' },
          { id: 'arc',              label: 'Arc' },
          { id: 'curve',            label: 'Curve' },
          { id: 'double-curve',     label: 'Double Curve' },
        ],
      },
    ],
  },
  {
    id: 'text',
    tooltip: 'Text & Notes',
    defaultSub: 'text',
    groups: [{
      label: 'TEXT & NOTES',
      items: [
        { id: 'text',          label: 'Text' },
        { id: 'anchored-text', label: 'Anchored Text' },
        { id: 'note',          label: 'Note' },
        { id: 'anchored-note', label: 'Anchored Note' },
        { id: 'callout',       label: 'Callout' },
        { id: 'comment',       label: 'Comment' },
        { id: 'price-label',   label: 'Price Label' },
        { id: 'price-note',    label: 'Price Note' },
        { id: 'signpost',      label: 'Signpost' },
        { id: 'flag-mark',     label: 'Flag Mark' },
      ],
    }],
  },
  {
    id: 'emoji',
    tooltip: 'Annotations',
    defaultSub: 'note',
    groups: [{
      label: 'ANNOTATIONS',
      items: [
        { id: 'note',          label: 'Note' },
        { id: 'anchored-note', label: 'Anchored Note' },
        { id: 'signpost',      label: 'Signpost' },
        { id: 'flag-mark',     label: 'Flag Mark' },
        { id: 'callout',       label: 'Callout' },
        { id: 'comment',       label: 'Comment' },
      ],
    }],
  },
  {
    id: 'ruler',
    tooltip: 'Ruler / Measure',
    standalone: true,
    defaultSub: 'ruler',
    groups: [],
  },
  {
    id: 'zoom',
    tooltip: 'Zoom',
    standalone: true,
    defaultSub: 'zoom',
    groups: [],
  },
  {
    id: 'magnet',
    tooltip: 'Magnet',
    action: 'toggle-magnet',
    defaultSub: 'weak-magnet',
    groups: [{
      items: [
        { id: 'weak-magnet',   label: 'Weak Magnet' },
        { id: 'strong-magnet', label: 'Strong Magnet' },
      ],
    }],
  },
]

// ─── Icon SVGs ──────────────────────────────────────────────────────────────

function I({ children, size = 16 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="shrink-0">
      {children}
    </svg>
  )
}

const SUB_ICONS: Record<string, React.ReactNode> = {
  // Cursor
  cross:   <I><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></I>,
  dot:     <I><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></I>,
  arrow:   <I><path d="M5 12L19 12M14 7l5 5-5 5"/></I>,
  eraser:  <I><path d="M20 20H7L3 16l11-11 7 7-1 8z"/><line x1="3" y1="16" x2="20" y2="16"/></I>,
  // Lines
  'trend-line':    <I><circle cx="4" cy="18" r="2"/><circle cx="20" cy="6" r="2"/><line x1="5.5" y1="16.7" x2="18.5" y2="7.3"/></I>,
  'ray':           <I><circle cx="4" cy="18" r="2"/><line x1="6" y1="17" x2="22" y2="7"/><path d="M18 8l4-1-1 4"/></I>,
  'info-line':     <I><circle cx="4" cy="18" r="2"/><circle cx="14" cy="12" r="1.5"/><line x1="6" y1="17" x2="12.5" y2="13"/></I>,
  'extended-line': <I><line x1="2" y1="20" x2="22" y2="4"/><circle cx="8" cy="15" r="2"/><circle cx="16" cy="9" r="2"/></I>,
  'trend-angle':   <I><line x1="3" y1="19" x2="21" y2="19"/><line x1="3" y1="19" x2="14" y2="6"/><path d="M7 19a4 4 0 0 1 4-4"/></I>,
  'horizontal-line':<I><line x1="2" y1="12" x2="22" y2="12"/><circle cx="8" cy="12" r="2"/></I>,
  'horizontal-ray': <I><circle cx="4" cy="12" r="2"/><line x1="6" y1="12" x2="22" y2="12"/></I>,
  'vertical-line':  <I><line x1="12" y1="2" x2="12" y2="22"/><circle cx="12" cy="8" r="2"/></I>,
  'cross-line':     <I><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></I>,
  'parallel-channel':<I><line x1="3" y1="17" x2="17" y2="7"/><line x1="7" y1="21" x2="21" y2="11"/><circle cx="3" cy="17" r="2"/><circle cx="7" cy="21" r="2"/></I>,
  'regression-trend':<I><rect x="3" y="8" width="14" height="10" rx="1"/><line x1="6" y1="14" x2="14" y2="11"/></I>,
  'flat-top-bottom': <I><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/><circle cx="7" cy="8" r="2"/><circle cx="7" cy="16" r="2"/></I>,
  'disjoint-channel':<I><line x1="3" y1="17" x2="11" y2="10"/><line x1="10" y1="21" x2="21" y2="11"/><circle cx="3" cy="17" r="2"/></I>,
  'pitchfork':      <I><path d="M12 3v18M5 7l7-4 7 4M5 7l7 7M19 7l-7 7"/></I>,
  'schiff-pitchfork':<I><path d="M12 3v18M5 9l7-6 7 6M5 9l6 6M19 9l-6 6"/></I>,
  'mod-schiff-pitchfork':<I><path d="M12 3v18M4 10l8-7 8 7M4 10l7 5M20 10l-7 5"/></I>,
  'inside-pitchfork':<I><path d="M12 4v16M6 8l6-4 6 4M6 8l5 5M18 8l-5 5"/></I>,
  // Fibonacci
  'fib-retracement':  <I><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/></I>,
  'tb-fib-extension': <I><line x1="3" y1="18" x2="11" y2="8"/><line x1="11" y1="8" x2="21" y2="4"/><line x1="3" y1="14" x2="21" y2="14"/></I>,
  'fib-channel':      <I><line x1="3" y1="18" x2="21" y2="8"/><line x1="3" y1="14" x2="21" y2="4"/><circle cx="6" cy="17" r="1.5"/></I>,
  'fib-time-zone':    <I><line x1="5" y1="4" x2="5" y2="20"/><line x1="10" y1="4" x2="10" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/><line x1="19" y1="4" x2="19" y2="20"/></I>,
  'fib-speed-res-fan':<I><path d="M3 19 L19 3"/><path d="M3 19 L21 12"/><path d="M3 19 L19 19"/></I>,
  'tb-fib-time':      <I><line x1="6" y1="4" x2="6" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/><circle cx="6" cy="12" r="2"/></I>,
  'fib-circles':      <I><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/></I>,
  'fib-spiral':       <I><path d="M12 12 Q14 8 18 10 Q22 14 18 18 Q12 22 7 18 Q3 12 7 7 Q12 3 17 7"/></I>,
  'fib-speed-res-arcs':<I><path d="M4 20 Q12 4 20 20"/><path d="M4 20 Q12 8 20 20" opacity="0.6"/></I>,
  'fib-wedge':        <I><path d="M4 20 L20 8 L20 20 Z"/><line x1="4" y1="14" x2="20" y2="14"/></I>,
  'pitchfan':         <I><path d="M4 20 L20 4"/><path d="M4 20 L20 12"/><path d="M4 20 L20 20"/></I>,
  'gann-box':         <I><rect x="3" y="6" width="18" height="12" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="6" x2="12" y2="18"/></I>,
  'gann-square-fixed':<I><rect x="3" y="3" width="18" height="18"/><path d="M3 21L21 3M3 3L21 21" opacity="0.5"/><line x1="3" y1="12" x2="21" y2="12" opacity="0.5"/><line x1="12" y1="3" x2="12" y2="21" opacity="0.5"/></I>,
  'gann-square':      <I><rect x="3" y="3" width="18" height="18" strokeDasharray="3 2"/><path d="M3 21L21 3"/></I>,
  'gann-fan':         <I><path d="M3 21L21 3"/><path d="M3 21L21 9"/><path d="M3 21L21 21"/><path d="M3 21L12 3"/></I>,
  // Patterns
  'xabcd-pattern':    <I><polyline points="4,18 9,8 14,14 19,5"/><circle cx="4" cy="18" r="2"/><circle cx="9" cy="8" r="2"/><circle cx="14" cy="14" r="2"/><circle cx="19" cy="5" r="2"/></I>,
  'cypher-pattern':   <I><polyline points="4,18 8,7 13,14 18,5"/><circle cx="4" cy="18" r="2"/><circle cx="8" cy="7" r="2"/><circle cx="13" cy="14" r="2"/><circle cx="18" cy="5" r="2"/></I>,
  'head-shoulders':   <I><polyline points="3,18 6,12 9,16 12,6 15,16 18,12 21,18"/></I>,
  'abcd-pattern':     <I><polyline points="5,17 10,7 15,13 20,5"/><circle cx="5" cy="17" r="2"/><circle cx="10" cy="7" r="2"/><circle cx="15" cy="13" r="2"/><circle cx="20" cy="5" r="2"/></I>,
  'triangle-pattern': <I><polygon points="12,4 20,18 4,18"/><circle cx="12" cy="4" r="2"/><circle cx="20" cy="18" r="2"/><circle cx="4" cy="18" r="2"/></I>,
  'three-drives':     <I><polyline points="3,18 7,11 10,15 14,8 17,12 21,5"/><circle cx="7" cy="11" r="1.5"/><circle cx="14" cy="8" r="1.5"/></I>,
  'elliott-impulse':  <I><polyline points="3,18 6,11 9,15 13,7 17,11 20,5"/></I>,
  'elliott-correction':<I><polyline points="3,7 8,14 13,8 18,15"/></I>,
  'elliott-triangle': <I><polyline points="3,8 7,14 11,9 15,14 19,10"/></I>,
  'elliott-double':   <I><polyline points="3,14 6,8 9,13 12,8 15,13 18,8"/></I>,
  'elliott-triple':   <I><polyline points="2,14 5,8 7,12 10,7 12,12 15,7 17,12 20,7"/></I>,
  'cyclic-lines':     <I><line x1="6" y1="4" x2="6" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/></I>,
  'time-cycles':      <I><path d="M4 20 Q8 8 12 20 Q16 8 20 20"/></I>,
  'sine-line':        <I><path d="M2 12 Q6 4 10 12 Q14 20 18 12 Q20 8 22 10"/></I>,
  // Projection
  'long-position':    <I><rect x="3" y="8" width="18" height="8" rx="1" strokeDasharray="0"/><line x1="3" y1="11" x2="21" y2="11"/><circle cx="8" cy="11" r="2" fill="currentColor" stroke="none"/></I>,
  'short-position':   <I><rect x="3" y="8" width="18" height="8" rx="1"/><line x1="3" y1="13" x2="21" y2="13"/><circle cx="8" cy="13" r="2" fill="currentColor" stroke="none"/></I>,
  'forecast':         <I><line x1="3" y1="18" x2="21" y2="18"/><path d="M3 12 Q8 6 12 12 Q16 18 21 12" strokeDasharray="3 2"/></I>,
  'bars-pattern':     <I><rect x="3" y="8" width="3" height="8"/><rect x="8" y="6" width="3" height="10"/><rect x="13" y="10" width="3" height="6"/><rect x="18" y="4" width="3" height="12"/></I>,
  'ghost-feed':       <I><path d="M3 12 Q8 4 13 12 Q18 20 21 12" strokeDasharray="2 2"/><circle cx="13" cy="12" r="2"/></I>,
  'projection':       <I><path d="M4 18 Q10 10 16 14"/><path d="M16 14 Q20 10 22 8" strokeDasharray="3 2"/><circle cx="16" cy="14" r="2"/></I>,
  'anchored-vwap':    <I><circle cx="8" cy="14" r="2.5"/><path d="M10 12 Q14 6 20 10"/><line x1="8" y1="11.5" x2="8" y2="4"/></I>,
  'fixed-range-vol-prof':<I><rect x="3" y="4" width="14" height="16" rx="1" strokeDasharray="0"/><rect x="5" y="7" width="8" height="2" rx="1"/><rect x="5" y="11" width="5" height="2" rx="1"/><rect x="5" y="15" width="10" height="2" rx="1"/></I>,
  'price-range':      <I><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="4" x2="16" y2="4"/><line x1="8" y1="20" x2="16" y2="20"/><circle cx="12" cy="12" r="2"/></I>,
  'date-range':       <I><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="8" x2="4" y2="16"/><line x1="20" y1="8" x2="20" y2="16"/><circle cx="12" cy="12" r="2"/></I>,
  'date-price-range': <I><rect x="4" y="6" width="16" height="12" rx="1"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="12" y1="6" x2="12" y2="18"/></I>,
  // Brush/Shapes
  'brush':            <I><path d="M4 20 Q8 12 14 8 L18 4 L20 6 L16 10 Q12 16 4 20Z"/></I>,
  'highlighter':      <I><path d="M6 20 L10 16 L16 8 L18 10 L12 16 L8 20Z"/><line x1="4" y1="22" x2="14" y2="22"/></I>,
  'arrow-marker':     <I><path d="M5 20L19 6M19 6L13 6M19 6L19 12"/></I>,
  'draw-arrow':       <I><circle cx="5" cy="18" r="2"/><line x1="7" y1="17" x2="19" y2="7"/><path d="M15 6l4-1-1 4"/></I>,
  'arrow-mark-up':    <I><path d="M12 20V8M6 14l6-6 6 6"/></I>,
  'arrow-mark-down':  <I><path d="M12 4v12M18 10l-6 6-6-6"/></I>,
  'arrow-mark-left':  <I><path d="M20 12H8M14 6l-6 6 6 6"/></I>,
  'arrow-mark-right': <I><path d="M4 12h12M10 6l6 6-6 6"/></I>,
  'rectangle':        <I><rect x="3" y="6" width="18" height="12" rx="1"/><circle cx="3" cy="6" r="2"/><circle cx="21" cy="6" r="2"/><circle cx="3" cy="18" r="2"/><circle cx="21" cy="18" r="2"/></I>,
  'rotated-rect':     <I><rect x="6" y="6" width="12" height="12" rx="1" transform="rotate(30 12 12)"/></I>,
  'path':             <I><circle cx="4" cy="18" r="2"/><circle cx="12" cy="7" r="2"/><circle cx="20" cy="14" r="2"/><path d="M6 17 Q10 5 14 8 Q18 11 18 14"/></I>,
  'circle':           <I><circle cx="12" cy="12" r="8"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="8" r="2"/></I>,
  'ellipse':          <I><ellipse cx="12" cy="12" rx="9" ry="5"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></I>,
  'polyline':         <I><polyline points="4,17 9,8 14,13 20,5"/><circle cx="4" cy="17" r="2"/><circle cx="9" cy="8" r="2"/><circle cx="14" cy="13" r="2"/><circle cx="20" cy="5" r="2"/></I>,
  'triangle':         <I><polygon points="12,4 21,19 3,19"/><circle cx="12" cy="4" r="2"/></I>,
  'arc':              <I><path d="M4 18 Q12 4 20 18"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/></I>,
  'curve':            <I><path d="M4 18 C8 4 16 4 20 18"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/></I>,
  'double-curve':     <I><path d="M3 18 C7 4 11 4 12 12 C13 20 17 20 21 10"/></I>,
  // Text
  'text':             <svg viewBox="0 0 24 24" width="16" height="16"><text x="12" y="18" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor" fontFamily="serif">T</text></svg>,
  'anchored-text':    <svg viewBox="0 0 24 24" width="16" height="16"><text x="10" y="17" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor" fontFamily="serif">T</text><circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="15" y1="18" x2="15" y2="22" stroke="currentColor" strokeWidth="1.5"/></svg>,
  'note':             <I><path d="M12 21a1 1 0 0 1-1-1v-1H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6l-1 1z"/></I>,
  'anchored-note':    <I><path d="M10 20a1 1 0 0 1-1-1v-1H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4l-1 1z"/><circle cx="18" cy="20" r="2"/></I>,
  'callout':          <I><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4V16H5a2 2 0 0 1-2-2V5z"/></I>,
  'comment':          <I><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></I>,
  'price-label':      <I><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H12l-3 3V13H5a2 2 0 0 1-2-2V5z"/><line x1="12" y1="13" x2="12" y2="20"/></I>,
  'price-note':       <I><path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/><line x1="12" y1="15" x2="12" y2="20"/><circle cx="12" cy="21" r="1" fill="currentColor" stroke="none"/></I>,
  'signpost':         <I><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="21"/><path d="M8 21h8"/></I>,
  'flag-mark':        <I><line x1="4" y1="4" x2="4" y2="20"/><path d="M4 4 L18 4 L14 10 L18 16 L4 16"/></I>,
  // Magnet
  'weak-magnet':      <I><path d="M6 12 A6 6 0 0 1 18 12" strokeWidth="2"/><line x1="6" y1="12" x2="6" y2="17" strokeWidth="2"/><line x1="18" y1="12" x2="18" y2="17" strokeWidth="2"/><line x1="4" y1="17" x2="8" y2="17" strokeWidth="2"/><line x1="16" y1="17" x2="20" y2="17" strokeWidth="2"/></I>,
  'strong-magnet':    <I><path d="M6 12 A6 6 0 0 1 18 12" strokeWidth="2"/><line x1="6" y1="12" x2="6" y2="17" strokeWidth="2"/><line x1="18" y1="12" x2="18" y2="17" strokeWidth="2"/><line x1="4" y1="17" x2="8" y2="17" strokeWidth="2"/><line x1="16" y1="17" x2="20" y2="17" strokeWidth="2"/><line x1="12" y1="6" x2="12" y2="20" strokeWidth="1" strokeDasharray="2 1"/></I>,
  // Standalone
  ruler: <I><rect x="2" y="9" width="20" height="6" rx="1"/><line x1="6" y1="12" x2="6" y2="15"/><line x1="10" y1="12" x2="10" y2="15"/><line x1="14" y1="12" x2="14" y2="15"/><line x1="18" y1="12" x2="18" y2="15"/></I>,
  zoom:  <I><circle cx="11" cy="11" r="7"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></I>,
}

// Main button icons (shown in sidebar)
const BTN_ICONS: Record<string, React.ReactNode> = {
  cursor: <I size={18}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></I>,
  lines:  <I size={18}><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><line x1="6.5" y1="16.8" x2="17.5" y2="7.2"/></I>,
  fibonacci:<I size={18}><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></I>,
  patterns:<I size={18}><circle cx="5" cy="17" r="2"/><circle cx="10" cy="8" r="2"/><circle cx="16" cy="13" r="2"/><circle cx="21" cy="5" r="2"/><polyline points="5,17 10,8 16,13 21,5"/></I>,
  projection:<I size={18}><circle cx="5" cy="16" r="2"/><circle cx="19" cy="8" r="2"/><line x1="7" y1="15" x2="17" y2="9" strokeDasharray="3 2"/><circle cx="5" cy="12" r="1.5" opacity="0.5"/><circle cx="19" cy="4" r="1.5" opacity="0.5"/></I>,
  brush:  <I size={18}><path d="M4 18 Q8 10 14 7 L17 4 L20 7 L17 10 Q14 13 4 18Z"/></I>,
  text:   <svg viewBox="0 0 24 24" width="18" height="18"><text x="12" y="18" textAnchor="middle" fontSize="17" fontWeight="700" fill="currentColor" fontFamily="serif">T</text></svg>,
  emoji:  <I size={18}><circle cx="12" cy="12" r="8"/><path d="M9 14.5 Q12 17 15 14.5"/><circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none"/></I>,
  ruler:  <I size={18}><rect x="2" y="9" width="20" height="6" rx="1"/><line x1="6" y1="12" x2="6" y2="15"/><line x1="10" y1="12" x2="10" y2="15"/><line x1="14" y1="12" x2="14" y2="15"/><line x1="18" y1="12" x2="18" y2="15"/></I>,
  zoom:   <I size={18}><circle cx="11" cy="11" r="7"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></I>,
  magnet: <I size={18}><path d="M6 12 A6 6 0 0 1 18 12" strokeWidth="2"/><line x1="6" y1="12" x2="6" y2="18" strokeWidth="2"/><line x1="18" y1="12" x2="18" y2="18" strokeWidth="2"/><line x1="4" y1="18" x2="8" y2="18" strokeWidth="2"/><line x1="16" y1="18" x2="20" y2="18" strokeWidth="2"/></I>,
  lock:   <I size={18}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></I>,
  unlock: <I size={18}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-.5"/><circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/></I>,
  visibility:<I size={18}><path d="M1 12 C5 5 19 5 23 12 C19 19 5 19 1 12"/><circle cx="12" cy="12" r="3"/></I>,
  trash:  <I size={18}><polyline points="3 6 5 6 21 6"/><path d="M19 6L18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></I>,
}

// Map sub-tool IDs to actual drawMode strings for the chart
const DRAW_MODE_MAP: Record<string, string> = {
  'cross': 'cursor', 'dot': 'cursor', 'arrow': 'cursor', 'eraser': 'cursor',
  'trend-line': 'trend',
  'ray': 'trend',
  'extended-line': 'extended',
  'horizontal-line': 'horizontal', 'horizontal-ray': 'horizontal',
  'vertical-line': 'vertical',
  'parallel-channel': 'channel',
  'rectangle': 'rectangle',
  'fib-retracement': 'fib',
  'long-position': 'cursor', 'short-position': 'cursor',
  'ruler': 'cursor', 'zoom': 'cursor',
  'weak-magnet': 'cursor', 'strong-magnet': 'cursor',
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  activeTool: string
  onToolChange: (toolId: string, drawMode: string) => void
  onDeleteAll: () => void
  locked: boolean
  onLockToggle: () => void
  visible: boolean
  onVisibilityToggle: () => void
  magnetMode: 'off' | 'weak' | 'strong'
  onMagnetChange: (mode: 'off' | 'weak' | 'strong') => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DrawingToolbar({
  activeTool, onToolChange, onDeleteAll,
  locked, onLockToggle, visible, onVisibilityToggle,
  magnetMode, onMagnetChange,
}: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const [selectedSub, setSelectedSub] = useState<Record<string, string>>({
    cursor: 'cross', lines: 'trend-line', fibonacci: 'fib-retracement',
    patterns: 'xabcd-pattern', projection: 'long-position', brush: 'brush',
    text: 'text', emoji: 'note', magnet: 'weak-magnet',
  })
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const flyoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const openFlyout = useCallback((btnId: string) => {
    const btn = btnRefs.current.get(btnId)
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setFlyoutPos({ top: rect.top, left: rect.right + 2 })
    setOpenMenu((prev) => prev === btnId ? null : btnId)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!openMenu) return
    function handler(e: MouseEvent) {
      const target = e.target as Node
      if (flyoutRef.current?.contains(target)) return
      if (btnRefs.current.get(openMenu!)?.contains(target)) return
      setOpenMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openMenu])

  function selectSubTool(category: string, subId: string) {
    setSelectedSub((prev) => ({ ...prev, [category]: subId }))
    const dm = DRAW_MODE_MAP[subId] ?? 'cursor'
    onToolChange(subId, dm)
    setOpenMenu(null)  // always close flyout after selecting a sub-tool

    if (subId === 'weak-magnet') onMagnetChange('weak')
    if (subId === 'strong-magnet') onMagnetChange('strong')
  }

  // Determine which main category contains this sub-tool ID
  function getCategoryOfTool(subToolId: string): string | null {
    for (const btn of TOOL_BUTTONS) {
      for (const g of btn.groups) {
        if (g.items.some((i) => i.id === subToolId)) return btn.id
      }
      if (btn.id === subToolId) return btn.id
    }
    return null
  }
  const activeCategory = getCategoryOfTool(activeTool)

  return (
    <div className="flex flex-col items-center gap-0.5 py-2 bg-[#131722] border-r border-[#2a2e39] w-11 shrink-0">

      {/* Main tool buttons */}
      {TOOL_BUTTONS.map((btn) => {
        const isActive = activeCategory === btn.id || openMenu === btn.id
        const currentSub = selectedSub[btn.id] ?? btn.defaultSub
        const subIcon = SUB_ICONS[currentSub] ?? BTN_ICONS[btn.id]
        const isMagnet = btn.id === 'magnet'
        const isMagnetOn = isMagnet && magnetMode !== 'off'

        // Handle separators
        const showSep = btn.id === 'ruler' || btn.id === 'magnet'

        return (
          <div key={btn.id} className="w-full flex flex-col items-center">
            {showSep && <div className="w-6 h-px bg-white/10 my-1" />}
            <button
              ref={(el) => { if (el) btnRefs.current.set(btn.id, el); else btnRefs.current.delete(btn.id) }}
              onClick={() => {
                if (btn.standalone) {
                  onToolChange(btn.id, DRAW_MODE_MAP[btn.id] ?? 'cursor')
                  return
                }
                if (btn.id === 'lock') { onLockToggle(); return }
                if (btn.id === 'unlock') { onLockToggle(); return }
                if (btn.id === 'visibility') { onVisibilityToggle(); return }
                // If this category is already active, deactivate (go to cursor)
                const isThisCategoryActive = activeCategory === btn.id && activeTool !== 'cross'
                if (isThisCategoryActive && openMenu !== btn.id) {
                  onToolChange('cross', 'cursor')
                  setOpenMenu(null)
                  return
                }
                // Immediately activate the current sub-tool for this category
                const currentSub = selectedSub[btn.id] ?? btn.defaultSub
                const dm = DRAW_MODE_MAP[currentSub] ?? 'cursor'
                onToolChange(currentSub, dm)
                // Open flyout for sub-tool selection (closes automatically when user clicks chart)
                if (btn.groups.length > 0) openFlyout(btn.id)
              }}
              title={btn.tooltip}
              className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
                isActive || isMagnetOn
                  ? 'bg-[#2962FF]/80 text-white'
                  : 'text-[#787B86] hover:text-white hover:bg-white/8'
              }`}
            >
              {isActive && !isMagnet ? (subIcon ?? BTN_ICONS[btn.id]) : BTN_ICONS[btn.id]}
            </button>
          </div>
        )
      })}

      {/* Separator before utility tools */}
      <div className="w-6 h-px bg-white/10 my-1" />

      {/* Lock */}
      <button
        title={locked ? 'Unlock Drawings' : 'Lock Drawings'}
        onClick={onLockToggle}
        className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${locked ? 'bg-[#2962FF]/80 text-white' : 'text-[#787B86] hover:text-white hover:bg-white/8'}`}>
        {locked ? BTN_ICONS.unlock : BTN_ICONS.lock}
      </button>

      {/* Visibility */}
      <button
        title={visible ? 'Hide Drawings' : 'Show Drawings'}
        onClick={onVisibilityToggle}
        className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${!visible ? 'bg-[#2962FF]/80 text-white' : 'text-[#787B86] hover:text-white hover:bg-white/8'}`}>
        {BTN_ICONS.visibility}
      </button>

      {/* Separator before delete */}
      <div className="w-6 h-px bg-white/10 my-1" />

      {/* Trash */}
      <button title="Delete All Drawings" onClick={onDeleteAll}
        className="w-9 h-9 flex items-center justify-center rounded transition-colors text-[#787B86] hover:text-red-400 hover:bg-red-500/10">
        {BTN_ICONS.trash}
      </button>

      {/* Flyout portal */}
      {mounted && openMenu && (() => {
        const def = TOOL_BUTTONS.find((b) => b.id === openMenu)
        if (!def || def.standalone || def.groups.length === 0) return null
        const currentSubId = selectedSub[openMenu] ?? def.defaultSub

        return createPortal(
          <div
            ref={flyoutRef}
            className="fixed z-[9999] bg-[#1e222d] border border-[#2a2e39] rounded-r-lg shadow-2xl overflow-y-auto"
            style={{ top: flyoutPos.top, left: flyoutPos.left, maxHeight: '80vh', minWidth: '220px' }}
          >
            {def.groups.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <div className="px-4 pt-3 pb-1 text-[10px] text-[#787B86] uppercase tracking-widest font-semibold">
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => {
                  const isSelected = item.id === currentSubId
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectSubTool(openMenu, item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 transition-colors text-left ${
                        isSelected
                          ? 'bg-[#2962FF] text-white'
                          : 'text-white hover:bg-[#2a2e39]'
                      }`}
                    >
                      <span className={`shrink-0 ${isSelected ? 'text-white' : 'text-[#787B86]'}`}>
                        {SUB_ICONS[item.id] ?? <span className="w-4 h-4 block" />}
                      </span>
                      <span className="text-sm flex-1">{item.label}</span>
                      {item.shortcut && (
                        <span className={`text-[11px] ml-auto ${isSelected ? 'text-white/70' : 'text-[#787B86]'}`}>
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                })}
                {gi < def.groups.length - 1 && (
                  <div className="mx-4 my-1 border-t border-[#2a2e39]" />
                )}
              </div>
            ))}
          </div>,
          document.body
        )
      })()}
    </div>
  )
}
