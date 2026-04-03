"use client"

import type { AnalysedStatement } from "@/lib/api"

// ── verdict → style mapping ───────────────────────────────────────────────────
// We use /25 (25% opacity) and 500-level colors so they "pop" on dark backgrounds
const VERDICT_STYLE: Record<string, string> = {
  supported:     "bg-green-500/25 text-green-200", 
  contradicted:  "bg-red-500/25 text-red-200",
  hedged:        "bg-gray-500/25 text-gray-200",
  no_prior_data: "bg-gray-500/25 text-gray-200",
}

// ── types ────────────────────────────────────────────────────────────────────

interface Segment {
  text:      string
  statement: AnalysedStatement | null
}

// ── helpers ───────────────────────────────────────────────────────────────────

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildSegments(body: string, statements: AnalysedStatement[]): Segment[] {
  if (!statements || statements.length === 0) {
    return [{ text: body, statement: null }]
  }

  const sortedStmts = [...statements].sort((a, b) => b.sentence.length - a.sentence.length)
  const pattern = sortedStmts.map(s => escapeRegExp(s.sentence)).join('|')
  const regex = new RegExp(`(${pattern})`, 'g')
  const parts = body.split(regex).filter(Boolean)

  return parts.map(part => {
    const stmt = statements.find(s => s.sentence === part)
    return { text: part, statement: stmt || null }
  })
}

// ── main component ────────────────────────────────────────────────────────────

interface Props {
  body:            string
  statements:      AnalysedStatement[]
  article_bias:    number | null
}

export default function AnalysedBody({ body, statements, article_bias }: Props) {
  const segments = buildSegments(body, statements)

  return (
    <div className="max-w-4xl mx-auto font-sans">
      {/* Aggregate Bias Score */}
      {typeof article_bias === 'number' && (
        <div className="flex items-center gap-3 mb-8 p-3 rounded-xl border border-white/10 bg-white/5 w-max">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Article Bias</span>
          <span
            className={`text-lg font-bold px-3 py-1 rounded-lg ${
              article_bias > 0.2
                ? "bg-green-500/20 text-green-400"
                : article_bias < -0.2
                ? "bg-red-500/20 text-red-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {article_bias > 0 ? "+" : ""}
            {article_bias.toFixed(4)}
          </span>
        </div>
      )}

      {/* The Article Body */}
      <div className="leading-relaxed text-lg whitespace-pre-wrap break-words">
        {segments.map((seg, i) =>
          seg.statement ? (
            <span 
              key={i} 
              className={`inline px-1 py-0.5 rounded-md mx-0.5 ${VERDICT_STYLE[seg.statement.verdict] || VERDICT_STYLE.no_prior_data}`}
            >
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>
    </div>
  )
}
