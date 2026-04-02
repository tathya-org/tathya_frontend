import Link from "next/link"
import { getArticles } from "@/lib/api"

export default async function Home() {
  const articles = await getArticles()

  return (
    <main className="min-h-screen p-6">
          <h1 className="text-center mb-12">
            तथ्य
          </h1>

      <div className="max-w-2xl mx-auto space-y-4">
        {articles.map((article, index) => (
          <Link
            key={index}
            href={`/article/${index}`}
            className="block border-b pb-3 hover:text-blue-600"
          >
            {article.headline}
          </Link>
        ))}
      </div>
    </main>
  )
}
