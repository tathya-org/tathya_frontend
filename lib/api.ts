const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ── types ────────────────────────────────────────────────────────────────────

export interface Article {
  headline: string
  url:      string
  body:     string
  image:    string | null
  published: string | null
}

export interface AnalysedStatement {
  status:     "known" | "new"
  verdict:    "supported" | "contradicted" | "hedged" | "no_prior_data"
  p:          string
  connective: string
  conn_type:  string
  polarity:   number
  q:          string
  bias_score: number | null
  paths:      { chain: string[]; polarity: number; min_weight: number }[]
  sentence:   string
}

export interface AnalysedArticle {
  headline:        string
  source:          string
  token_count:     number
  sentence_count:  number
  statement_count: number
  known_count:     number
  new_count:       number
  article_bias:    number | null
  statements:      AnalysedStatement[]
}

// ── fetchers ─────────────────────────────────────────────────────────────────

export async function getArticles(): Promise<Article[]> {
  const res = await fetch(`${API_BASE}/feed?source=onlinekhabar&limit=20`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error("Failed to fetch articles")
  const data = await res.json()
  return data.articles as Article[]
}

export async function analyseArticle(
  headline: string,
  body: string,
  source = "onlinekhabar"
): Promise<AnalysedArticle | null> {
  try {
    const res = await fetch(`${API_BASE}/analyse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline, body, source }),
      next: { revalidate: 600 },
    })
    if (!res.ok) return null
    return (await res.json()) as AnalysedArticle
  } catch {
    return null
  }
}
