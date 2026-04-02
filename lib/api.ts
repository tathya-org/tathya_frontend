export interface Article {
  headline: string
  body: string
  url: string
  published: string
  image?: string
}

const API_BASE = "http://localhost:8000"

export async function getArticles(): Promise<Article[]> {
  const res = await fetch(`${API_BASE}/feed`, {
    cache: "no-store",
  })

  if (!res.ok) throw new Error("Failed to fetch")

  const data = await res.json()
  return data.articles
}
