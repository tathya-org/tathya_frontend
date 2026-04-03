"use client"

import { useState } from "react"
import type { AnalysedStatement } from "@/lib/api"

// ── verdict → style mapping ───────────────────────────────────────────────────

const VERDICT_STYLE: Record<string, string> = {
  supported:     "bg-green-100 text-green-900 border-b-2 border-green-400 cursor-pointer",
  contradicted:  "bg-red-100 text-red-900 border-b-2 border-red-400 cursor-pointer",
  hedged:        "bg-gray-100 text-gray-700 border-b-2 border-gray-300 cursor-pointer",
  no_prior_data: "bg-gray-50 text-gray-600 border-b border-dashed border-gray-300 cursor-pointer",
}

const VERDICT_LABEL: Record<string, string> = {
  supported:     "Supported by prior data",
  contradicted:  "Contradicts prior data",
  hedged:        "Hedged — uncertain",
  no_prior_data: "New — no prior data",
}

const VERDICT_DOT: Record<string, string> = {
  supported:     "bg-green-500",
  contradicted:  "bg-red-500",
  hedged:        "bg-gray-400",
  no_prior_data: "bg-gray-300",
}

// ── types ────────────────────────────────────────────────────────────────────

interface Segment {
  text:      string
  statement: AnalysedStatement | null
}

// ── helpers ───────────────────────────────────────────────────────────────────

function buildSegments(body: string, statements: AnalysedStatement[]): Segment[] {
  // sort statements by their position in the body
  const positioned = statements
    .map(s => ({ stmt: s, idx: body.indexOf(s.sentence) }))
    .filter(x => x.idx !== -1)
    .sort((a, b) => a.idx - b.idx)

  const segments: Segment[] = []
  let cursor = 0

  for (const { stmt, idx } of positioned) {
    if (idx > cursor) {
      segments.push({ text: body.slice(cursor, idx), statement: null })
    }
    segments.push({ text: stmt.sentence, statement: stmt })
    cursor = idx + stmt.sentence.length
  }

  if (cursor < body.length) {
    segments.push({ text: body.slice(cursor), statement: null })
  }

  return segments
}

// ── tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ stmt }: { stmt: AnalysedStatement }) {
  const chain = stmt.paths[0]?.chain ?? []
  return (
    <div className="absolute z-50 bottom-full left-0 mb-2 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs text-left">
      <div className="font-medium text-gray-900 mb-1">
        {VERDICT_LABEL[stmt.verdict]}
      </div>
      <div className="text-gray-500 mb-1">
        <span className="font-medium">p:</span> {stmt.p}
      </div>
      <div className="text-gray-500 mb-1">
        <span className="font-medium">connective:</span>{" "}
        <span className="italic">{stmt.connective}</span>{" "}
        <span className="text-gray-400">({stmt.conn_type})</span>
      </div>
      <div className="text-gray-500 mb-2">
        <span className="font-medium">q:</span> {stmt.q}
      </div>
      {chain.length > 0 && (
        <div className="font-mono text-gray-400 text-[10px] border-t pt-2">
          {chain.join(" ⇒ ")}
        </div>
      )}
      {stmt.bias_score !== null && (
        <div className="mt-1 text-gray-500">
          bias score:{" "}
          <span
            className={
              stmt.bias_score > 0 ? "text-green-600" : "text-red-600"
            }
          >
            {stmt.bias_score.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}

// ── highlighted span ──────────────────────────────────────────────────────────

function HighlightedSentence({ stmt }: { stmt: AnalysedStatement }) {
  const [open, setOpen] = useState(false)
  const style = VERDICT_STYLE[stmt.verdict] ?? VERDICT_STYLE.no_prior_data

  return (
    <span
      className={`relative inline ${style} rounded px-0.5`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {stmt.sentence}
      {open && <Tooltip stmt={stmt} />}
    </span>
  )
}

// ── legend ────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-6">
      {Object.entries(VERDICT_LABEL).map(([verdict, label]) => (
        <span key={verdict} className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${VERDICT_DOT[verdict]}`} />
          {label}
        </span>
      ))}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  body:       string
  statements: AnalysedStatement[]
  bias:       number | null
}

export default function AnalysedBody({ body, statements, bias }: Props) {
  const segments = buildSegments(body, statements)

  return (
    <div>
      {/* article-level bias badge */}
      {bias !== null && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-400">Article bias</span>
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              bias > 0.3
                ? "bg-green-100 text-green-800"
                : bias < -0.3
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {bias > 0 ? "+" : ""}
            {bias.toFixed(2)}
          </span>
        </div>
      )}

      <Legend />

      <div className="leading-8 text-gray-800 whitespace-pre-wrap">
        {segments.map((seg, i) =>
          seg.statement ? (
            <HighlightedSentence key={i} stmt={seg.statement} />
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>
    </div>
  )
}
