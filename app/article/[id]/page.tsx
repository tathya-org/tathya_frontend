import { getArticles } from "@/lib/api"
import MarkdownRenderer from "@/components/MarkdownRenderer"

interface Props {
  params: { id: string }
}

export default async function ArticlePage({ params }: Props) {
  const articles = await getArticles()
  const article = articles[parseInt(params.id)]

  if (!article) {
    return <div>Article not found</div>
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">
        {article.headline}
      </h1>

      <p className="text-gray-500 mb-6">
        Source: {article.url}
      </p>

      <MarkdownRenderer content={article.body} />
    </main>
  )
}
